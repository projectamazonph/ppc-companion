import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAction } from "@/lib/db-queries";
import { requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// PUT /api/exercises/submissions/[id]/grade
// Body: { status?, score?, feedback? }
// Used by instructors to grade/return an exercise submission.
// Grader identity comes from the JWT, not the request body.
// =============================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireRole(req, "INSTRUCTOR", "ADMIN");
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id } = await params;
    const body = await req.json();

    // Verify the submission exists
    const existing = await db.exerciseSubmission.findUnique({
      where: { id },
      include: { exercise: { select: { code: true, title: true } }, student: { select: { id: true, name: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Build update payload
    const data: any = {
      gradedBy: authUser.sub,
      gradedAt: new Date(),
    };

    const validStatuses = ["DRAFT", "SUBMITTED", "GRADED", "RETURNED"];
    if (validStatuses.includes(body.status)) {
      data.status = body.status;
    } else {
      data.status = "GRADED";
    }

    if (typeof body.score === "number") data.score = body.score;
    if (typeof body.feedback === "string") data.feedback = body.feedback.trim() || null;

    const updated = await db.exerciseSubmission.update({
      where: { id },
      data,
      include: {
        exercise: { select: { id: true, code: true, title: true, type: true, module: { select: { code: true, title: true, phase: { select: { number: true } } } } } },
      },
    }).then((u) => ({
      ...u,
      exercise: {
        ...u.exercise,
        module: { ...u.exercise.module, phaseNumber: u.exercise.module.phase?.number ?? null },
      },
    }));

    // Write an audit log entry
    await logAction({
      actorId: authUser.sub,
      action: "UPDATE",
      entityType: "exercise_submission",
      entityId: id,
      summary: `${authUser.name} graded ${existing.student.name}'s submission for ${existing.exercise.code} (${data.status})`,
      changes: { status: data.status, score: data.score, feedback: data.feedback ? "added" : undefined },
    });

    // Notify the student
    await db.notification.create({
      data: {
        studentId: existing.student.id,
        type: data.status === "GRADED" ? "GRADE" : "INFO",
        title: `${existing.exercise.code} ${data.status === "GRADED" ? "graded" : "returned"}`,
        message: `Your submission for "${existing.exercise.title}" has been ${data.status.toLowerCase()} by ${authUser.name}.${data.feedback ? ` Feedback: "${data.feedback.slice(0, 100)}"` : ""}`,
        actionUrl: "/myprofile",
      },
    });

    return NextResponse.json({ submission: updated });
  } catch (e: any) {
    console.error("[PUT /api/exercises/submissions/[id]/grade] error:", e);
    return NextResponse.json({ error: "Failed to grade submission", detail: e.message }, { status: 500 });
  }
}
