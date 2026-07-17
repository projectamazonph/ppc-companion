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
  const authUser = await requireAuth(req);
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
          select: { id: true, title: true, moduleId: true, module: { select: { code: true, title: true, phase: { select: { number: true } } } } },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
    }).then((attempts) =>
      attempts.map((a) => ({
        ...a,
        quiz: {
          ...a.quiz,
          module: { ...a.quiz.module, phaseNumber: a.quiz.module.phase?.number ?? null },
        },
      }))
    );

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
// POST /api/quizzes/attempts — Submit a quiz attempt
// Body: { studentId, quizId, answers, durationSec? }
//   Answers are graded server-side against the quiz's question bank.
//   Only "answers" and "durationSec" are accepted from the client;
//   score, total, percentage, and passed are all computed server-side.
// =============================================================

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();

    if (!body.studentId || typeof body.studentId !== "string") {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    if (!body.quizId || typeof body.quizId !== "string") {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
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
      db.quiz.findUnique({
        where: { id: body.quizId },
        include: {
          questions: { orderBy: { order: "asc" } },
          module: { select: { phase: { select: { number: true } }, id: true } },
        },
      }),
    ]);

    if (!student || student.deletedAt) {
      return NextResponse.json({ error: "Student not found or deactivated" }, { status: 404 });
    }
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // ------------------------------------------------------------------
    // Server-side grading: compare submitted answers against question bank
    // ------------------------------------------------------------------
    const questions = quiz.questions;
    const submittedAnswers = body.answers as Record<string, string>;
    let score = 0;
    let total = 0;
    const gradedAnswers: Record<string, { submitted: string; correct: boolean; points: number }> = {};

    for (const q of questions) {
      const points = q.points;
      total += points;
      const submitted = submittedAnswers[q.id];

      if (submitted === undefined || submitted === null || submitted === "") {
        // Unanswered question
        gradedAnswers[q.id] = { submitted: submitted ?? "", correct: false, points };
        continue;
      }

      let isCorrect = false;

      if (q.type === "MCQ" && q.modelAnswer) {
        // MCQ: compare submitted answer to model answer
        isCorrect = submitted.trim().toLowerCase() === q.modelAnswer.trim().toLowerCase();
      } else if (q.type === "NUMERIC" && q.acceptableAnswers) {
        // NUMERIC: check if submitted value falls within acceptable range(s)
        try {
          const acceptable: (number | { min: number; max: number })[] = JSON.parse(q.acceptableAnswers);
          const submittedNum = parseFloat(submitted);
          if (!isNaN(submittedNum)) {
            isCorrect = acceptable.some((entry) => {
              if (typeof entry === "number") {
                return Math.abs(submittedNum - entry) < 0.001;
              }
              if (entry && typeof entry === "object" && "min" in entry && "max" in entry) {
                return submittedNum >= entry.min && submittedNum <= entry.max;
              }
              return false;
            });
          }
        } catch {
          // If acceptableAnswers is malformed JSON, skip grading
          isCorrect = false;
        }
      }
      // OPEN questions: cannot auto-grade. Student receives 0 points
      // and instructor must manually grade.

      if (isCorrect) {
        score += points;
      }

      gradedAnswers[q.id] = { submitted, correct: isCorrect, points };
    }

    // Ensure total is at least 1 to avoid division by zero
    const safeTotal = Math.max(1, total);
    const percentage = (score / safeTotal) * 100;
    const passed = percentage >= (quiz.passingScore ?? 70);

    // Validate that all submitted question IDs belong to this quiz
    const validQuestionIds = new Set(questions.map((q) => q.id));
    for (const qid of Object.keys(submittedAnswers)) {
      if (!validQuestionIds.has(qid)) {
        return NextResponse.json(
          { error: `Question ID "${qid}" does not belong to this quiz` },
          { status: 400 }
        );
      }
    }

    // Create the attempt record
    const attempt = await db.quizAttempt.create({
      data: {
        studentId: body.studentId,
        quizId: body.quizId,
        score,
        total: safeTotal,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        answers: JSON.stringify(gradedAnswers),
        durationSec: typeof body.durationSec === "number" ? body.durationSec : null,
      },
    });

    // Update ProgressEntry for this phase with the latest score
    const phaseNumber = quiz.module?.phase?.number ?? 1;
    const moduleId = quiz.module?.id ?? null;
    if (moduleId) {
      await db.progressEntry.upsert({
        where: { studentId_phaseNumber: { studentId: body.studentId, phaseNumber } },
        create: {
          studentId: body.studentId,
          moduleId,
          phaseNumber,
          quizScore: score,
          quizTotal: safeTotal,
        },
        update: {
          quizScore: score,
          quizTotal: safeTotal,
        },
      });
    }

    return NextResponse.json({ attempt, passed, percentage }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/quizzes/attempts] error:", e);
    return NextResponse.json({ error: "Failed to save attempt", detail: e.message }, { status: 500 });
  }
}
