import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
// Verify a JWT and return the decoded user payload
// --------------------------------------------------------------------------
export function verifyToken(token: string): AuthUser {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret) as AuthUser & { iat: number; exp: number };
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name,
  };
}

// --------------------------------------------------------------------------
// Get authenticated user from request, or null
// --------------------------------------------------------------------------
export function getAuthUser(req: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Require authentication — returns 401 if not authenticated
// --------------------------------------------------------------------------
export function requireAuth(req: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(req);
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
export function requireRole(
  req: NextRequest,
  ...allowedRoles: ("STUDENT" | "INSTRUCTOR" | "ADMIN")[]
): AuthUser | NextResponse {
  const user = getAuthUser(req);
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
