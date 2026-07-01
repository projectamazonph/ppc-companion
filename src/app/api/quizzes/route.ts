import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
