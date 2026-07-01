import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/quizzes/attempts?studentId=xxx&quizId=xxx
//   Returns all quiz attempts for a student, optionally filtered by quiz.
//   Ownership: the authenticated user's own attempts, or any
//   if the user is an admin/instructor.
// =============================================================

export async function GET(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const quizId = searchParams.get("quizId");
    const best = searchParams.get("best") === "true";

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Enforce ownership
    if (authUser.sub !== studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own quiz attempts." },
        { status: 403 }
      );
    }

    const where: any = { studentId };
    if (quizId) where.quizId = quizId;

    const attempts = await db.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: { id: true, title: true, moduleId: true, module: { select: { code: true, title: true, phaseNumber: true } } },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
    });

    let result = attempts;
    if (best) {
      const byQuiz = new Map<string, any>();
      for (const a of attempts) {
        const current = byQuiz.get(a.quizId);
        if (!current || a.score > current.score) byQuiz.set(a.quizId, a);
      }
      result = Array.from(byQuiz.values());
    }

    return NextResponse.json({ count: result.length, attempts: result });
  } catch (e: any) {
    console.error("[GET /api/quizzes/attempts] error:", e);
    return NextResponse.json({ error: "Failed to list attempts", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// POST /api/quizzes/attempts
// Body: { studentId, quizId, score, total, answers, durationSec? }
//   Creates a new QuizAttempt record (always new — append-only).
//   Ownership: authenticated user's sub must match studentId.
// =============================================================

export async function POST(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();

    if (!body.studentId || typeof body.studentId !== "string") {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    if (!body.quizId || typeof body.quizId !== "string") {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    }
    if (typeof body.score !== "number" || typeof body.total !== "number") {
      return NextResponse.json({ error: "score and total (numbers) are required" }, { status: 400 });
    }
    if (!body.answers || typeof body.answers !== "object") {
      return NextResponse.json({ error: "answers (object) is required" }, { status: 400 });
    }

    // Enforce ownership: students can only submit attempts as themselves.
    if (authUser.sub !== body.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only submit your own quiz attempts." },
        { status: 403 }
      );
    }

    // Verify student + quiz exist
    const [student, quiz] = await Promise.all([
      db.student.findUnique({ where: { id: body.studentId }, select: { id: true, deletedAt: true } }),
      db.quiz.findUnique({ where: { id: body.quizId }, include: { module: { select: { phaseNumber: true } } } }),
    ]);
    if (!student || student.deletedAt) {
      return NextResponse.json({ error: "Student not found or deactivated" }, { status: 404 });
    }
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const total = Math.max(1, body.total);
    const percentage = (body.score / total) * 100;
    const passed = percentage >= (quiz.passingScore ?? 60);

    // Create the attempt
    const attempt = await db.quizAttempt.create({
      data: {
        studentId: body.studentId,
        quizId: body.quizId,
        score: body.score,
        total: body.total,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        answers: JSON.stringify(body.answers),
        durationSec: typeof body.durationSec === "number" ? body.durationSec : null,
      },
    });

    // Update ProgressEntry for this phase with the latest score
    const phaseNumber = quiz.module?.phaseNumber ?? 1;
    await db.progressEntry.upsert({
      where: { studentId_phaseNumber: { studentId: body.studentId, phaseNumber } },
      create: {
        studentId: body.studentId,
        phaseNumber,
        quizScore: body.score,
        quizTotal: body.total,
      },
      update: {
        quizScore: body.score,
        quizTotal: body.total,
      },
    });

    return NextResponse.json({ attempt, passed, percentage }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/quizzes/attempts] error:", e);
    return NextResponse.json({ error: "Failed to save attempt", detail: e.message }, { status: 500 });
  }
}
