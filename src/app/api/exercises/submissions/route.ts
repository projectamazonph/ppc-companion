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
  const authUser = await requireAuth(req);
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
// Body: { studentId, exerciseId, answer }
//   Creates or updates a submission.
//   Students can only set their answer and whether it is SUBMITTED.
//   Grading fields (score, feedback, status=GRADED/RETURNED, gradedAt)
//   are restricted to INSTRUCTOR and ADMIN roles.
// =============================================================

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
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

    // Resolve exerciseId — it could be an ID or a code (e.g. "1.1A")
    // Check by ID first, then by code
    let exercise = await db.exercise.findUnique({
      where: { id: body.exerciseId },
      select: { id: true, type: true, code: true },
    });

    // If not found by ID, try resolving by code
    if (!exercise) {
      exercise = await db.exercise.findUnique({
        where: { code: body.exerciseId },
        select: { id: true, type: true, code: true },
      });
      if (!exercise) {
        return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
      }
    }

    // Verify student exists
    const student = await db.student.findUnique({
      where: { id: body.studentId },
      select: { id: true, deletedAt: true },
    });
    if (!student || student.deletedAt) {
      return NextResponse.json({ error: "Student not found or deactivated" }, { status: 404 });
    }

    const exerciseId = exercise.id;

    // Try to find existing submission for this (student, exercise)
    const existing = await db.exerciseSubmission.findFirst({
      where: { studentId: body.studentId, exerciseId },
      orderBy: { updatedAt: "desc" },
    });

    // Role-based field restrictions
    const isInstructor = ["ADMIN", "INSTRUCTOR"].includes(authUser.role);

    // Determine status:
    // - Instructors/admins can set status to any valid value
    // - Students can only set status to "DRAFT" or "SUBMITTED"
    const validStatuses = ["DRAFT", "SUBMITTED", "GRADED", "RETURNED"];
    let status: string;
    if (body.status && validStatuses.includes(body.status)) {
      if (isInstructor) {
        status = body.status;
      } else {
        // Students can only set DRAFT or SUBMITTED
        status = ["DRAFT", "SUBMITTED"].includes(body.status) ? body.status : "SUBMITTED";
      }
    } else {
      if (existing) {
        // When status is not explicitly provided by a non-instructor,
        // do NOT preserve GRADED/RETURNED — force to DRAFT so stale
        // grading metadata is not carried across re-submissions.
        if (!isInstructor && ["GRADED", "RETURNED"].includes(existing.status)) {
          status = "DRAFT";
        } else {
          status = existing.status;
        }
      } else {
        status = "SUBMITTED";
      }
    }

    let submission;
    if (existing) {
      // Build update — only allow fields appropriate to role
      const updateData: any = {
        answer: body.answer,
        status,
      };

      // Only instructors/admins can set grading fields
      if (isInstructor) {
        if (typeof body.score === "number") updateData.score = body.score;
        if (typeof body.feedback === "string") updateData.feedback = body.feedback.trim() || null;
        if (body.gradedAt) updateData.gradedAt = new Date(body.gradedAt);
      }

      // Track submission time
      if (status === "SUBMITTED" && existing.status !== "SUBMITTED") {
        updateData.submittedAt = new Date();
      }

      // If a non-instructor is re-submitting on a previously graded
      // submission, clear stale grading metadata.
      if (!isInstructor && ["GRADED", "RETURNED"].includes(existing.status)) {
        updateData.score = null;
        updateData.feedback = null;
        updateData.gradedAt = null;
        updateData.gradedBy = null;
      }

      submission = await db.exerciseSubmission.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      // New submission — grading fields only from instructors/admins
      const createData: any = {
        studentId: body.studentId,
        exerciseId,
        answer: body.answer,
        status: status as any,
      };

      // Only instructors/admins can set grading fields on creation
      if (isInstructor) {
        if (typeof body.score === "number") createData.score = body.score;
        if (typeof body.feedback === "string") createData.feedback = body.feedback.trim() || null;
      }

      if (status === "SUBMITTED") {
        createData.submittedAt = new Date();
      }

      submission = await db.exerciseSubmission.create({ data: createData });
    }

    return NextResponse.json({ submission }, { status: existing ? 200 : 201 });
  } catch (e: any) {
    console.error("[POST /api/exercises/submissions] error:", e);
    return NextResponse.json({ error: "Failed to save submission", detail: e.message }, { status: 500 });
  }
}
