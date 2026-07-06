import { NextRequest, NextResponse } from "next/server";
import { phases, TRIAL_MODULE_IDS } from "@/lib/course-data";

const TRIAL_IDS: readonly string[] = TRIAL_MODULE_IDS;
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  // Check auth user
  const authResult = requireAuth(request);
  if (isErrorResponse(authResult)) {
    // Guest / trial: only first 2 modules
    const trialPhases = phases.map((phase) => ({
      ...phase,
      modules: phase.modules.map((m) => ({
        id: m.id,
        code: m.code,
        title: m.title,
        locked: !TRIAL_IDS.includes(m.id),
      })),
    }));
    return NextResponse.json({ phases: trialPhases, trialMode: true });
  }

  // If authenticated, return everything
  if (authResult) {
    return NextResponse.json({ phases, trialMode: false });
  }

  // Blocked user - show trial mode
  const trialPhases = phases.map((phase) => ({
    ...phase,
    modules: phase.modules.map((m) => ({
      id: m.id,
      code: m.code,
      title: m.title,
      locked: !TRIAL_IDS.includes(m.id),
    })),
  }));

  return NextResponse.json({ phases: trialPhases, trialMode: true });
}