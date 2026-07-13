import { NextRequest, NextResponse } from "next/server";
import { phases, TRIAL_MODULE_IDS } from "@/lib/course-data";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check auth user
  const authResult = requireAuth(request);

  if (isErrorResponse(authResult)) {
    // Unauthenticated: show trial mode
    const trialPhases = phases.map((phase) => ({
      ...phase,
      modules: phase.modules.map((m) => ({
        id: m.id,
        code: m.code,
        title: m.title,
        locked: !TRIAL_MODULE_IDS.includes(m.id),
      })),
    }));
    return NextResponse.json({ phases: trialPhases, trialMode: true });
  }

  // Authenticated — check if account is withdrawn or soft-deleted (C4 fix)
  const student = await db.student.findUnique({
    where: { id: authResult.sub },
    select: { status: true, deletedAt: true },
  });

  if (!student || student.status === "WITHDRAWN" || student.deletedAt) {
    const trialPhases = phases.map((phase) => ({
      ...phase,
      modules: phase.modules.map((m) => ({
        id: m.id,
        code: m.code,
        title: m.title,
        locked: !TRIAL_MODULE_IDS.includes(m.id),
      })),
    }));
    return NextResponse.json({ phases: trialPhases, trialMode: true });
  }

  // Active authenticated user — return everything
  return NextResponse.json({ phases, trialMode: false });
}
