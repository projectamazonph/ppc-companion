import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Role, StudentStatus } from "@prisma/client";
import { requireRole, isErrorResponse } from "@/lib/auth-server";

// Strip the password field before returning to client
function publicStudent(s: any) {
  if (!s) return s;
  const { password, ...rest } = s;
  return rest;
}

// =============================================================
// GET /api/students/[id] — fetch one student (with progress)
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: { progress: { orderBy: { phaseNumber: "asc" } } },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ student: publicStudent(student) });
  } catch (e: any) {
    console.error("[GET /api/students/[id]] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch student", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// PUT /api/students/[id] — update a student
//   Body: any subset of { name, email, role, status, cohort, currentPhase, notes }
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

    // Existence check
    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Email uniqueness check (if changing)
    if (body.email && body.email !== existing.email) {
      const emailTaken = await db.student.findUnique({ where: { email: body.email } });
      if (emailTaken) {
        return NextResponse.json(
          { error: `Email "${body.email}" is already in use` },
          { status: 409 }
        );
      }
    }

    // Build update payload with validation
    const data: any = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim();
    if (typeof body.cohort === "string") data.cohort = body.cohort.trim() || null;
    if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

    const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];
    if (validRoles.includes(body.role)) data.role = body.role as Role;

    const validStatuses = ["ACTIVE", "PAUSED", "GRADUATED", "WITHDRAWN", "PENDING"];
    if (validStatuses.includes(body.status)) data.status = body.status as StudentStatus;

    if (typeof body.currentPhase === "number" && body.currentPhase >= 1 && body.currentPhase <= 4) {
      data.currentPhase = body.currentPhase;
    }

    const student = await db.student.update({
      where: { id },
      data,
      include: { progress: { orderBy: { phaseNumber: "asc" } } },
    });

    return NextResponse.json({ student: publicStudent(student) });
  } catch (e: any) {
    console.error("[PUT /api/students/[id]] error:", e);
    return NextResponse.json(
      { error: "Failed to update student", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// DELETE /api/students/[id] — delete a student (cascades to progress entries)
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
    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await db.student.delete({ where: { id } });

    return NextResponse.json({
      deleted: true,
      id,
      name: existing.name,
      email: existing.email,
    });
  } catch (e: any) {
    console.error("[DELETE /api/students/[id]] error:", e);
    return NextResponse.json(
      { error: "Failed to delete student", detail: e.message },
      { status: 500 }
    );
  }
}
