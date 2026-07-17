import { NextResponse } from "next/server";

// =============================================================
// POST /api/auth/logout — clear the session cookie
// =============================================================

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Signed out successfully",
  });

  // Clear the session cookie by setting it to expire immediately
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}
