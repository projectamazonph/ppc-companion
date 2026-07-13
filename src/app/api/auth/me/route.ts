import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/auth/me
// Returns the public user + progress for the authenticated user.
// Uses the JWT sub claim to identify the user — no ?id param.
// =============================================================

function publicUser(s: any) {
  const { password, ...rest } = s;
  return rest;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const student = await db.student.findUnique({
      where: { id: authUser.sub },
      include: { progress: { orderBy: { phaseNumber: "asc" } } },
    });

    if (!student) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: publicUser(student),
      progress: student.progress,
    });
  } catch (e: unknown) {
    console.error("[GET /api/auth/me] error:", e);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to fetch session", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
