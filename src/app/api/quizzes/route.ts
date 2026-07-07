import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/quizzes — list all quizzes with their questions
//   ?moduleId=xxx   ?withQuestions=true
// =============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const withQuestions = searchParams.get("withQuestions") === "true";

    const where: any = {};
    if (moduleId) where.moduleId = moduleId;

    const quizzes = await db.quiz.findMany({
      where,
      include: withQuestions
        ? { questions: { orderBy: { order: "asc" } }, module: { select: { code: true, title: true, phaseNumber: true } } }
        : { module: { select: { code: true, title: true, phaseNumber: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ count: quizzes.length, quizzes });
  } catch (e: any) {
    console.error("[GET /api/quizzes] error:", e);
    return NextResponse.json({ error: "Failed to list quizzes", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// POST /api/quizzes — submit quiz answers and get graded result
// Body: { quizId, answers: { [questionId]: answer } }
// Sets Student.phaseNPass = true if score >= 70%
// =============================================================

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const body = await req.json();
    const { quizId, answers } = body as { quizId: string; answers: Record<string, string> };

    if (!quizId || typeof quizId !== "string") {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers object is required" }, { status: 400 });
    }

    // Fetch quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: "asc" } }, module: { select: { code: true, title: true, phaseNumber: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade each question
    let correct = 0;
    const results = quiz.questions.map((q) => {
      const given = answers[q.id] ?? null;
      let isCorrect = false;

      if (q.type === "MCQ" && q.options) {
        try {
          const opts = JSON.parse(q.options) as Array<{ id: string; label: string; correct?: boolean }>;
          const correctOption = opts.find((o) => o.correct);
          isCorrect = correctOption ? given === correctOption.id : false;
        } catch {
          isCorrect = false;
        }
      } else if (q.type === "NUMERIC" && q.acceptableAnswers) {
        try {
          const acceptable = JSON.parse(q.acceptableAnswers) as string[];
          isCorrect = acceptable.includes(given ?? "");
        } catch {
          isCorrect = given === q.modelAnswer;
        }
      } else {
        isCorrect = given === q.modelAnswer;
      }

      if (isCorrect) correct++;
      return { questionId: q.id, given, isCorrect };
    });

    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= (quiz.passingScore ?? 70);

    // Record the attempt
    await db.quizAttempt.create({
      data: {
        studentId: authUser.sub,
        quizId,
        score: correct,
        total,
        percentage,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    // If passed, set the corresponding phaseNPass field on the Student record
    const phaseNumber = quiz.module.phaseNumber;
    if (passed && phaseNumber >= 1 && phaseNumber <= 4) {
      const phaseFieldMap: Record<number, string> = {
        1: "phase1Pass",
        2: "phase2Pass",
        3: "phase3Pass",
        4: "phase4Pass",
      };
      const field = phaseFieldMap[phaseNumber];
      await db.student.update({
        where: { id: authUser.sub },
        data: { [field]: true },
      });
    }

    return NextResponse.json({
      score: correct,
      total,
      percentage,
      passed,
      passingScore: quiz.passingScore ?? 70,
      phaseUnlocked: passed && phaseNumber < 4 ? phaseNumber + 1 : null,
      results,
    });
  } catch (e: any) {
    console.error("[POST /api/quizzes] error:", e);
    return NextResponse.json({ error: "Failed to submit quiz", detail: e.message }, { status: 500 });
  }
}
