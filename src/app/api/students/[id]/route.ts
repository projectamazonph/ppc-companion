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
  const auth = await requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id, deletedAt: null },
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
//   Security: Only ADMIN can modify role. Instructors may update
//   non-role fields. Users cannot change their own privilege level.
// =============================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    // Existence check (skip soft-deleted students)
    const existing = await db.student.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Security: prevent users from changing their own privilege level
    if (auth.sub === id && body.role && body.role !== existing.role) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 403 }
      );
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

    // Security: Only ADMIN can modify role. Instructors cannot set/change roles.
    const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];
    if (validRoles.includes(body.role)) {
      if (auth.role === "ADMIN") {
        // Prevent demoting the last ADMIN
        if (existing.role === "ADMIN" && body.role !== "ADMIN") {
          const adminCount = await db.student.count({
            where: { role: "ADMIN", deletedAt: null },
          });
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: "Cannot demote the last administrator account." },
              { status: 403 }
            );
          }
        }
        data.role = body.role as Role;
      }
      // Instructors silently ignore role field
    }

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
// DELETE /api/students/[id] — soft-delete a student
//   Requires: ADMIN only (instructors cannot delete users)
//   Sets deletedAt timestamp instead of hard-deleting.
//   Prevents deleting the last remaining ADMIN user.
// =============================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Security: Only ADMIN can delete users
  const auth = await requireRole(req, "ADMIN");
  if (isErrorResponse(auth)) return auth;

  try {
    const { id } = await params;
    const existing = await db.student.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Prevent deleting the last ADMIN user
    if (existing.role === "ADMIN") {
      const adminCount = await db.student.count({
        where: { role: "ADMIN", deletedAt: null },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last administrator account." },
          { status: 403 }
        );
      }
    }

    // Soft delete instead of hard delete
    await db.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

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
