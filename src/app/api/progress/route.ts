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
  // 1. Get all quiz attempts for the student, with quiz->module->phase info
  const attempts = await db.quizAttempt.findMany({
    where: { studentId },
    include: {
      quiz: {
        include: {
          module: {
            include: { phase: true },
          },
        },
      },
    },
  });

  // 2. Get capstone status
  const capstone = await db.capstoneProject.findFirst({
    where: { studentId },
    select: { status: true },
  });

  // 3. Derive phase pass states (phases 1-4)
  // A phase is passed if the student has passed ALL quizzes linked to that phase.
  const phasePass: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false };

  // Group quizzes by phase number
  const quizzesByPhase = new Map<number, Set<string>>();
  const passedQuizzes = new Map<string, boolean>();

  for (const attempt of attempts) {
    const phaseNumber = attempt.quiz.module?.phase?.number;
    if (!phaseNumber) continue;

    if (!quizzesByPhase.has(phaseNumber)) {
      quizzesByPhase.set(phaseNumber, new Set());
    }
    quizzesByPhase.get(phaseNumber)!.add(attempt.quizId);

    // Track if this quiz has been passed (any attempt)
    if (attempt.passed && !passedQuizzes.get(attempt.quizId)) {
      passedQuizzes.set(attempt.quizId, true);
    }
  }

  for (const [phaseNumber, quizIds] of quizzesByPhase) {
    if (quizIds.size === 0) continue;
    // All quizzes in this phase must be passed
    phasePass[phaseNumber] = Array.from(quizIds).every((id) => passedQuizzes.get(id) === true);
  }

  // Handle case where no quizzes exist for a phase — default to false
  for (let i = 1; i <= 4; i++) {
    if (!quizzesByPhase.has(i)) {
      phasePass[i] = false;
    }
  }

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

export async function POST(_req: NextRequest) {
  // Direct progress mutation is no longer allowed.
  // Phase pass states are derived server-side from authoritative
  // quiz attempt and capstone records.
  return NextResponse.json(
    {
      error:
        "Direct progress mutation is disabled. Progress is derived from quiz and capstone records.",
    },
    { status: 410 }
  );
}
