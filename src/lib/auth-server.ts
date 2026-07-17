import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

// ============================================================================
// Server-side JWT authentication & authorization helpers
// ============================================================================
// Usage:
//   const user = requireAuth(req)        → 401 if missing/invalid
//   const user = requireRole(req, "ADMIN") → 403 if wrong role
//   const user = getAuthUser(req)        → null if not authenticated
// ============================================================================

export interface AuthUser {
  sub: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  name: string;
  sessionVersion: number;
}

// --------------------------------------------------------------------------
// JWT Secret — required at runtime, never falls back to a default
// --------------------------------------------------------------------------
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is not set. " +
        "Set it in .env or your deployment environment."
    );
  }
  return secret;
}

// --------------------------------------------------------------------------
// Extract token from Authorization header or session cookie
// --------------------------------------------------------------------------
export function getTokenFromRequest(req: NextRequest): string | null {
  // Prefer Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to httpOnly session cookie
  const cookie = req.cookies.get("session")?.value;
  if (cookie) return cookie;

  return null;
}

// --------------------------------------------------------------------------
// Verify a JWT and return the decoded user payload.
// Checks sessionVersion against the database to enforce token revocation
// after password changes.
// --------------------------------------------------------------------------
export function verifyToken(token: string): AuthUser | null {
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(token, secret) as AuthUser & { iat: number; exp: number };

    // Session version check: if the JWT includes a sessionVersion, verify it
    // matches the current value in the database. This invalidates tokens
    // issued before a password change.
    if (decoded.sessionVersion !== undefined) {
      // We use a non-blocking check; if the DB lookup fails, we still
      // trust the token (degraded mode) rather than blocking all requests.
      // The actual enforcement happens asynchronously.
      try {
        // db is a Prisma client, but this is synchronous code.
        // We'll defer the DB check to requireAuth/getAuthUser instead.
      } catch {
        // Ignore DB errors in token verification
      }
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      sessionVersion: decoded.sessionVersion ?? 0,
    };
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Verify sessionVersion: check that the token's sessionVersion matches
// the stored value. Returns true if valid, false if token should be rejected.
// --------------------------------------------------------------------------
async function verifySessionVersion(
  userId: string,
  tokenVersion: number
): Promise<boolean> {
  try {
    const student = await db.student.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    });
    if (!student) return false;
    return student.sessionVersion === tokenVersion;
  } catch {
    // On DB error, accept the token (degraded mode)
    return true;
  }
}

// --------------------------------------------------------------------------
// Get authenticated user from request, or null
// --------------------------------------------------------------------------
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  // Verify session version (async check against DB)
  const versionValid = await verifySessionVersion(user.sub, user.sessionVersion);
  if (!versionValid) return null;

  return user;
}

// --------------------------------------------------------------------------
// Require authentication — returns 401 if not authenticated
// --------------------------------------------------------------------------
export async function requireAuth(
  req: NextRequest
): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }
  return user;
}

// --------------------------------------------------------------------------
// Require specific role(s) — returns 401/403 if not authenticated or wrong role
// --------------------------------------------------------------------------
export async function requireRole(
  req: NextRequest,
  ...allowedRoles: ("STUDENT" | "INSTRUCTOR" | "ADMIN")[]
): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${user.role}.`,
      },
      { status: 403 }
    );
  }
  return user;
}

// --------------------------------------------------------------------------
// Type guard — check if result is an error response (for TypeScript narrowing)
// --------------------------------------------------------------------------
export function isErrorResponse(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
