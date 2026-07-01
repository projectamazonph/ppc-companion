import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCohortWithStudents } from "@/lib/db-queries";
import { requireAuth, requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/cohorts/[id] — fetch one cohort with its students
//   Any authenticated user can view cohorts.
// =============================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const cohort = await getCohortWithStudents(id);
    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }
    return NextResponse.json({ cohort });
  } catch (e: any) {
    console.error("[GET /api/cohorts/[id]] error:", e);
    return NextResponse.json({ error: "Failed to fetch cohort", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// PUT /api/cohorts/[id] — update a cohort
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.cohort.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    const data: any = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description.trim() || null;
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    if (typeof body.instructorId === "string") data.instructorId = body.instructorId || null;
    if (typeof body.maxStudents === "number") data.maxStudents = body.maxStudents;
    if (typeof body.metadata === "string") data.metadata = body.metadata;

    const validStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
    if (validStatuses.includes(body.status)) data.status = body.status;

    const cohort = await db.cohort.update({ where: { id }, data });
    return NextResponse.json({ cohort });
  } catch (e: any) {
    console.error("[PUT /api/cohorts/[id]] error:", e);
    return NextResponse.json({ error: "Failed to update cohort", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// DELETE /api/cohorts/[id] — delete (RESTRICT if enrollments exist)
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const existing = await db.cohort.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }
    if (existing._count.enrollments > 0) {
      return NextResponse.json(
        { error: `Cannot delete cohort with ${existing._count.enrollments} enrollment(s). Remove or transfer students first.` },
        { status: 409 }
      );
    }
    await db.cohort.delete({ where: { id } });
    return NextResponse.json({ deleted: true, id, name: existing.name });
  } catch (e: any) {
    console.error("[DELETE /api/cohorts/[id]] error:", e);
    return NextResponse.json({ error: "Failed to delete cohort", detail: e.message }, { status: 500 });
  }
}
