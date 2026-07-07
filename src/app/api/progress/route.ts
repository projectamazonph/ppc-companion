import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/progress — fetch current user's phase pass fields
// Returns: { phase1Pass, phase2Pass, phase3Pass, phase4Pass, capstoneDone }
// =============================================================

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const student = await db.student.findUnique({
      where: { id: authUser.sub },
      select: {
        phase1Pass: true,
        phase2Pass: true,
        phase3Pass: true,
        phase4Pass: true,
        capstoneDone: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (e: any) {
    console.error("[GET /api/progress] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch progress", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// POST /api/progress — update phase pass fields (used after
// quiz pass or capstone completion to sync server state)
// Body: partial { phase1Pass?, phase2Pass?, phase3Pass?, phase4Pass?, capstoneDone? }
// =============================================================

const ALLOWED_FIELDS = [
  "phase1Pass",
  "phase2Pass",
  "phase3Pass",
  "phase4Pass",
  "capstoneDone",
] as const;

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const body = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
    }

    // Build update data — only allow known phase fields
    const updateData: Record<string, boolean> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updateData[field] = Boolean(body[field]);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid phase fields provided" },
        { status: 400 }
      );
    }

    const student = await db.student.update({
      where: { id: authUser.sub },
      data: updateData,
      select: {
        phase1Pass: true,
        phase2Pass: true,
        phase3Pass: true,
        phase4Pass: true,
        capstoneDone: true,
      },
    });

    return NextResponse.json(student);
  } catch (e: any) {
    console.error("[POST /api/progress] error:", e);
    return NextResponse.json(
      { error: "Failed to update progress", detail: e.message },
      { status: 500 }
    );
  }
}
