import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/exercises/submissions?studentId=xxx&exerciseId=xxx
//   Returns all submissions for a student, optionally filtered by exercise.
//   Ownership: the authenticated user's own submissions, or any
//   if the user is an admin/instructor.
// =============================================================

export async function GET(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const exerciseId = searchParams.get("exerciseId");
    const latest = searchParams.get("latest") === "true";

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Enforce ownership
    if (authUser.sub !== studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own submissions." },
        { status: 403 }
      );
    }

    const where: any = { studentId };
    if (exerciseId) where.exerciseId = exerciseId;

    const submissions = await db.exerciseSubmission.findMany({
      where,
      include: {
        exercise: {
          select: { id: true, code: true, title: true, type: true, moduleId: true, module: { select: { code: true, title: true, phase: { select: { number: true } } } } },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    }).then((submissions) =>
      submissions.map((s) => ({
        ...s,
        exercise: {
          ...s.exercise,
          module: { ...s.exercise.module, phaseNumber: s.exercise.module.phase?.number ?? null },
        },
      }))
    );

    // If "latest" requested, dedupe by exerciseId keeping the most recent
    let result = submissions;
    if (latest) {
      const seen = new Set<string>();
      result = submissions.filter((s) => {
        if (seen.has(s.exerciseId)) return false;
        seen.add(s.exerciseId);
        return true;
      });
    }

    return NextResponse.json({ count: result.length, submissions: result });
  } catch (e: any) {
    console.error("[GET /api/exercises/submissions] error:", e);
    return NextResponse.json({ error: "Failed to list submissions", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// POST /api/exercises/submissions
// Body: { studentId, exerciseId, answer, status?, score?, feedback? }
//   Creates a new submission OR upserts if one already exists.
//   Ownership: authenticated user's sub must match JWT sub.
// =============================================================

export async function POST(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();

    if (!body.studentId || typeof body.studentId !== "string") {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    if (!body.exerciseId || typeof body.exerciseId !== "string") {
      return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
    }
    if (typeof body.answer !== "string") {
      return NextResponse.json({ error: "answer (string) is required" }, { status: 400 });
    }

    // Enforce ownership: students can only submit as themselves.
    // Admins/instructors can submit on behalf of others.
    if (authUser.sub !== body.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only submit your own exercises." },
        { status: 403 }
      );
    }

    // Verify student + exercise exist
    const [student, exercise] = await Promise.all([
      db.student.findUnique({ where: { id: body.studentId }, select: { id: true, deletedAt: true } }),
      db.exercise.findUnique({ where: { id: body.exerciseId }, select: { id: true, type: true } }),
    ]);
    if (!student || student.deletedAt) {
      return NextResponse.json({ error: "Student not found or deactivated" }, { status: 404 });
    }
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Look up the exercise by code if exerciseId is actually a code (e.g. "1.1A")
    let exerciseId = body.exerciseId;
    if (!exercise) {
      const byCode = await db.exercise.findUnique({ where: { code: body.exerciseId }, select: { id: true } });
      if (byCode) exerciseId = byCode.id;
    }

    // Try to find existing submission for this (student, exercise)
    const existing = await db.exerciseSubmission.findFirst({
      where: { studentId: body.studentId, exerciseId },
      orderBy: { updatedAt: "desc" },
    });

    const validStatuses = ["DRAFT", "SUBMITTED", "GRADED", "RETURNED"];
    const status = validStatuses.includes(body.status) ? body.status : "SUBMITTED";

    let submission;
    if (existing) {
      submission = await db.exerciseSubmission.update({
        where: { id: existing.id },
        data: {
          answer: body.answer,
          status: status as any,
          score: typeof body.score === "number" ? body.score : existing.score,
          feedback: body.feedback ?? existing.feedback,
          gradedAt: body.gradedAt ? new Date(body.gradedAt) : existing.gradedAt,
        },
      });
    } else {
      submission = await db.exerciseSubmission.create({
        data: {
          studentId: body.studentId,
          exerciseId,
          answer: body.answer,
          status: status as any,
          score: typeof body.score === "number" ? body.score : null,
          feedback: body.feedback ?? null,
        },
      });
    }

    return NextResponse.json({ submission }, { status: existing ? 200 : 201 });
  } catch (e: any) {
    console.error("[POST /api/exercises/submissions] error:", e);
    return NextResponse.json({ error: "Failed to save submission", detail: e.message }, { status: 500 });
  }
}
