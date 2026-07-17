import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/progress — derived phase progress for the current user
// Returns: { phase1Pass, phase2Pass, phase3Pass, phase4Pass, capstoneDone }
// Each phase is considered "passed" if the student has passed ALL
// quizzes belonging to that phase. capstoneDone is true if the
// capstone has been APPROVED.
// =============================================================

async function deriveProgress(studentId: string) {
  // 1. Get every quiz in the catalog, grouped by phase via module->phase.
  //    This is the authoritative list of what must be passed.
  const allQuizzes = await db.quiz.findMany({
    include: {
      module: {
        include: { phase: { select: { number: true } } },
      },
    },
  });

  const quizzesByPhase = new Map<number, Set<string>>();
  for (const quiz of allQuizzes) {
    const phaseNumber = quiz.module?.phase?.number;
    if (phaseNumber) {
      if (!quizzesByPhase.has(phaseNumber)) quizzesByPhase.set(phaseNumber, new Set());
      quizzesByPhase.get(phaseNumber)!.add(quiz.id);
    }
  }

  // 2. Get the student's best result per quiz (passed on any attempt).
  const attempts = await db.quizAttempt.findMany({
    where: { studentId, passed: true },
    select: { quizId: true },
  });
  const passedQuizIds = new Set(attempts.map((a) => a.quizId));

  // 3. Derive phase pass states: all quizzes in the phase must be in passedQuizIds.
  const phasePass: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false };
  for (const [phaseNumber, quizIds] of quizzesByPhase) {
    if (quizIds.size === 0) continue;
    phasePass[phaseNumber] = Array.from(quizIds).every((id) => passedQuizIds.has(id));
  }

  // 4. Capstone done
  const capstone = await db.capstoneProject.findFirst({
    where: { studentId },
    select: { status: true },
  });
  const capstoneDone = capstone?.status === "APPROVED";

  return {
    phase1Pass: phasePass[1],
    phase2Pass: phasePass[2],
    phase3Pass: phasePass[3],
    phase4Pass: phasePass[4],
    capstoneDone,
  };
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const progress = await deriveProgress(authUser.sub);
    return NextResponse.json(progress);
  } catch (e: any) {
    console.error("[GET /api/progress] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch progress", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// POST /api/progress — now READ-ONLY (returns derived state)
// Direct progress mutation has been removed for security.
// Phase pass state is derived server-side from quiz attempt
// records. Capstone done is derived from capstone approval.
// =============================================================

export async function POST(req: NextRequest) {
  // Authenticated callers still receive 410 — mutation is disabled.
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  return NextResponse.json(
    {
      error:
        "Direct progress mutation is disabled. Progress is derived from quiz and capstone records.",
    },
    { status: 410 }
  );
}
