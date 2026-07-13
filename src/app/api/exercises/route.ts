import { NextRequest, NextResponse } from \"next/server\";

import { db } from \"@/lib/db\";


// =============================================================
// GET /api/exercises — list all exercises (optionally by module)
//   ?moduleCode=1.1   ?phase=2   ?type=OPEN
// =============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleCode = searchParams.get(\"moduleCode\");
    const phase = searchParams.get(\"phase\");
    const type = searchParams.get(\"type\");

    const where: any = {};
    if (type) where.type = type;
    if (moduleCode) {
      where.module = { code: moduleCode };
    }
    if (phase) {
      where.module = { ...where.module, phase: { number: parseInt(phase, 10) } };
    }

    const exercises = await db.exercise.findMany({
      where,
      include: { module: { select: { code: true, title: true, phase: { select: { number: true } } } } },
      orderBy: [{ module: { phase: { number: \"asc\" } } }, { order: \"asc\" }],
    }).then((exercises) =>
      exercises.map((e) => ({
        ...e,
        module: {
          ...e.module,
          // Preserve the historical response shape expected by clients.
          phaseNumber: e.module.phase?.number ?? null,
        },
      }))
    );

    return NextResponse.json({ count: exercises.length, exercises });
  } catch (e: any) {
    console.error(\"[GET /api/exercises] Error:\", e);
    return NextResponse.json({ error: \"Failed to list exercises\", detail: e.message }, { status: 500 });
  }
}
