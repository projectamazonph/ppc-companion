import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Role, StudentStatus } from "@prisma/client";
import { requireRole, isErrorResponse } from "@/lib/auth-server";

// Strip the password field from a student object before returning to client
function publicStudent(s: any) {
  if (Array.isArray(s)) return s.map(publicStudent);
  if (!s) return s;
  const { password, ...rest } = s;
  return rest;
}

// =============================================================
// GET /api/students — list all students (with optional filters)
//   ?role=STUDENT  ?status=ACTIVE  ?cohort=Spring+2026  ?q=search
//   ?progress=true (include progress entries)
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const cohort = searchParams.get("cohort");
    const q = searchParams.get("q");
    const includeProgress = searchParams.get("progress") === "true";

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (cohort) where.cohort = cohort;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const students = await db.student.findMany({
      where,
      include: includeProgress ? { progress: { orderBy: { phaseNumber: "asc" } } } : undefined,
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({
      count: students.length,
      students: publicStudent(students),
    });
  } catch (e: any) {
    console.error("[GET /api/students] error:", e);
    return NextResponse.json(
      { error: "Failed to list students", detail: e.message },
      { status: 500 }
    );
  }
}

// =============================================================
// POST /api/students — create a new student
//   Body: { email, name, role?, status?, cohort?, currentPhase?, targetAcos?, notes? }
//   Requires: ADMIN or INSTRUCTOR
// =============================================================

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "ADMIN", "INSTRUCTOR");
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();

    // Validation
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Check email uniqueness
    const existing = await db.student.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json(
        { error: `A student with email "${body.email}" already exists` },
        { status: 409 }
      );
    }

    // Validate enums
    const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];
    const validStatuses = ["ACTIVE", "PAUSED", "GRADUATED", "WITHDRAWN", "PENDING"];

    const role = (validRoles.includes(body.role) ? body.role : "STUDENT") as Role;
    const status = (validStatuses.includes(body.status) ? body.status : "ACTIVE") as StudentStatus;

    const currentPhase =
      typeof body.currentPhase === "number" && body.currentPhase >= 1 && body.currentPhase <= 4
        ? body.currentPhase
        : 1;

    const targetAcos =
      typeof body.targetAcos === "number" && body.targetAcos > 0 && body.targetAcos <= 100
        ? body.targetAcos
        : 30;

    const student = await db.student.create({
      data: {
        email: body.email,
        name: body.name,
        role,
        status,
        cohort: body.cohort ?? null,
        currentPhase,
        targetAcos,
        notes: body.notes ?? null,
      },
      include: { progress: true },
    });

    return NextResponse.json({ student: publicStudent(student) }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/students] error:", e);
    return NextResponse.json(
      { error: "Failed to create student", detail: e.message },
      { status: 500 }
    );
  }
}
