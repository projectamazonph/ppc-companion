import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/cohorts — list all cohorts
//   Any authenticated user can view cohorts.
// =============================================================

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const cohorts = await db.cohort.findMany({
      include: { _count: { select: { enrollments: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      count: cohorts.length,
      cohorts: cohorts.map((c) => ({
        ...c,
        studentCount: c._count.enrollments,
        _count: undefined,
      })),
    });
  } catch (e: any) {
    console.error("[GET /api/cohorts] error:", e);
    return NextResponse.json({ error: "Failed to list cohorts", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// POST /api/cohorts — create a new cohort
//   Body: { name, description?, startDate?, endDate?, status? }
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();

    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const validStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
    type CohortStatus = (typeof validStatuses)[number];
    const status: CohortStatus = validStatuses.includes(body.status as CohortStatus) ? body.status : "PLANNED";

    const cohort = await db.cohort.create({
      data: {
        code: body.code.trim(),
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
        status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    return NextResponse.json({ cohort }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/cohorts] error:", e);
    return NextResponse.json({ error: "Failed to create cohort", detail: e.message }, { status: 500 });
  }
}
