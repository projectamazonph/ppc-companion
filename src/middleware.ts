// ============================================================================
// Middleware — JWT auth gate, CSRF protection, in-memory rate limiting
// ============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// --- In-memory rate limiter (works in Edge Runtime) ---
// NOTE: On Vercel serverless, each instance has its own Map.
// This limits abuse per-instance, not globally.
// For global rate limiting, use Upstash Redis or Vercel built-in rate limiting.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 20;

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000;

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [k, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(k);
    }
    lastCleanup = now;
  }
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }
  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { allowed: remaining > 0, remaining, resetAt: entry.resetAt };
}

// --- Route config ---
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/csrf",
  "/api/health",
  "/_next/",
  "/favicon.ico",
  "/icons/",
  "/logo.svg",
  "/manifest.json",
  "/og/",
  "/robots.txt",
];

const JWT_EXEMPT_ROUTES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/csrf",
  "/api/health",
  "/api/curriculum",
  // Public PPC Companion → Project Amazon PH Academy sampler funnel (no login required)
  "/api/sampler",
];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

/**
 * Parse allowed origins from env + dev defaults.
 */
function getAllowedOrigins(): string[] {
  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ];
  if (process.env.APP_URL) defaults.push(process.env.APP_URL);
  return defaults;
}

/**
 * Extract the origin from a URL string. Returns null if invalid.
 */
function extractOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function csrfCheck(request: NextRequest): { pass: boolean; reason?: string } {
  const method = request.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) return { pass: true };

  // Authorization header -> immune to CSRF
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return { pass: true };

  const allowedOrigins = getAllowedOrigins();

  // Check Origin header (preferred)
  const origin = request.headers.get("origin");
  if (origin) {
    const originUrl = extractOrigin(origin);
    if (originUrl && allowedOrigins.includes(originUrl)) return { pass: true };
    return { pass: false, reason: `Origin '${origin}' not allowed` };
  }

  // Check Referer header (fallback) — use URL.origin() to prevent bypass
  const referer = request.headers.get("referer");
  if (referer) {
    const refererOrigin = extractOrigin(referer);
    if (refererOrigin && allowedOrigins.includes(refererOrigin)) return { pass: true };
    return { pass: false, reason: `Referer '${referer}' not allowed` };
  }

  // No Origin/Referer on cookie-authed mutating request
  // Require a per-session CSRF token (not the static "1")
  const csrfToken = request.headers.get("x-csrf-token");
  if (csrfToken && csrfToken.length > 8 && csrfToken !== "1") return { pass: true };

  return {
    pass: false,
    reason:
      "CSRF check failed: mutating request with cookie auth requires Origin/Referer or valid X-CSRF-Token header",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 1. Rate limiting — applies to ALL API routes (including login/signup)
  // On Vercel, x-forwarded-for is set by the platform and trusted.
  // In other deployments, spoofable headers may weaken this — rate limiting
  // is abuse prevention, not a hard security boundary.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // 2. Skip public routes (rate limiting already applied above)
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    return response;
  }

  // 3. CSRF protection for mutating cookie-authenticated requests
  const { pass: csrfPass, reason: csrfReason } = csrfCheck(request);
  if (!csrfPass) {
    return NextResponse.json(
      { error: `CSRF validation failed: ${csrfReason}` },
      { status: 403 }
    );
  }

  // 4. JWT verification for protected API routes
  if (!JWT_EXEMPT_ROUTES.some((route) => pathname.startsWith(route))) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }

    try {
      const secret = getJwtSecret();
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token. Please sign in again." },
        { status: 401 }
      );
    }
  }

  // 5. Attach rate limit headers and proceed
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
