import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// =============================================================
// GET /api/exercises — list all exercises (optionally by module)
//   ?moduleCode=1.1   ?phase=2   ?type=OPEN
// =============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleCode = searchParams.get("moduleCode");
    const phase = searchParams.get("phase");
    const type = searchParams.get("type");

    const where: any = {};
    if (type) where.type = type;
    if (moduleCode) {
      where.module = { code: moduleCode };
    }
    if (phase) {
      where.module = { ...where.module, phaseNumber: parseInt(phase, 10) };
    }

    const exercises = await db.exercise.findMany({
      where,
      include: { module: { select: { code: true, title: true, phaseNumber: true } } },
      orderBy: [{ module: { phaseNumber: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({ count: exercises.length, exercises });
  } catch (e: any) {
    console.error("[GET /api/exercises] error:", e);
    return NextResponse.json({ error: "Failed to list exercises", detail: e.message }, { status: 500 });
  }
}
