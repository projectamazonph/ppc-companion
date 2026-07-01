// ============================================================================
// Middleware — JWT auth gate, CSRF protection, in-memory rate limiting
// ============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// --- In-memory rate limiter (works in Edge Runtime) ---
// Vercel instances are ephemeral, so persistent storage is unnecessary.
// This is per-instance and resets on cold start — acceptable for abuse prevention.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 20;

// Cleanup stale entries every 5 minutes (keeps memory bounded)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
    lastCleanup = now;
  }

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetAt });
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
  "/api/auth/csrf",
  "/api/health",
  "/_next/",
  "/favicon.ico",
  "/logo.svg",
  "/manifest.json",
  "/robots.txt",
];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

function csrfCheck(request: NextRequest): { pass: boolean; reason?: string } {
  const method = request.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) return { pass: true };

  // Authorization header → immune to CSRF
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return { pass: true };

  // Cookie auth → require Origin or Referer
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowedOrigins: string[] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ];
  if (process.env.APP_URL) allowedOrigins.push(process.env.APP_URL);

  if (origin) {
    if (allowedOrigins.includes(origin)) return { pass: true };
    return { pass: false, reason: `Origin '${origin}' not allowed` };
  }

  if (referer) {
    for (const ao of allowedOrigins) {
      if (referer.startsWith(ao as string)) return { pass: true };
    }
    return { pass: false, reason: `Referer '${referer}' not allowed` };
  }

  // No Origin/Referer on cookie-authed mutating request → require header
  if (request.headers.get("x-csrf-token") === "1") return { pass: true };

  return {
    pass: false,
    reason:
      "CSRF check failed: mutating request with cookie auth requires Origin/Referer or X-CSRF-Token header",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip public routes immediately
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Only process API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";

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

  // 3. CSRF protection for mutating cookie-authenticated requests
  const { pass: csrfPass, reason: csrfReason } = csrfCheck(request);
  if (!csrfPass) {
    return NextResponse.json(
      { error: `CSRF validation failed: ${csrfReason}` },
      { status: 403 }
    );
  }

  // 4. JWT verification for all protected API routes
  if (
    !pathname.startsWith("/api/auth/login") &&
    !pathname.startsWith("/api/auth/signup") &&
    !pathname.startsWith("/api/auth/csrf") &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/curriculum")
  ) {
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
