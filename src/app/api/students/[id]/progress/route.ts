import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/students/[id]/progress — list progress entries
//   Ownership: the authenticated user's own progress, or any
//   if the user is an admin/instructor.
// =============================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id } = await params;

    // Enforce ownership
    if (authUser.sub !== id && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own progress." },
        { status: 403 }
      );
    }
    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const progress = await db.progressEntry.findMany({
      where: { studentId: id },
      orderBy: { phaseNumber: "asc" },
    });
    return NextResponse.json({ progress });
  } catch (e: any) {
    console.error("[GET /api/students/[id]/progress] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch progress", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// PUT /api/students/[id]/progress — upsert a progress entry
// Body: { phaseNumber, exercisesDone?, exercisesTotal?, quizScore?, quizTotal?, capstoneDone?, notes? }
// =============================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id } = await params;

    // Enforce ownership: user can only update their own progress,
    // unless they're an admin or instructor.
    if (authUser.sub !== id && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only update your own progress." },
        { status: 403 }
      );
    }
    const body = await req.json();

    const student = await db.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (typeof body.phaseNumber !== "number" || body.phaseNumber < 1 || body.phaseNumber > 4) {
      return NextResponse.json(
        { error: "phaseNumber (1-4) is required" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (typeof body.exercisesDone === "number") data.exercisesDone = Math.max(0, body.exercisesDone);
    if (typeof body.exercisesTotal === "number") data.exercisesTotal = Math.max(0, body.exercisesTotal);
    if (typeof body.quizScore === "number" || body.quizScore === null) data.quizScore = body.quizScore;
    if (typeof body.quizTotal === "number") data.quizTotal = Math.max(0, body.quizTotal);
    if (typeof body.capstoneDone === "boolean") data.capstoneDone = body.capstoneDone;
    if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

    // Upsert by (studentId, phaseNumber) unique key
    const entry = await db.progressEntry.upsert({
      where: {
        studentId_phaseNumber: {
          studentId: id,
          phaseNumber: body.phaseNumber,
        },
      },
      create: {
        studentId: id,
        phaseNumber: body.phaseNumber,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ progress: entry });
  } catch (e: any) {
    console.error("[PUT /api/students/[id]/progress] error:", e);
    return NextResponse.json(
      { error: "Failed to update progress", detail: e.message },
      { status: 500 }
    );
  }
}
