import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/capstones?studentId=xxx
//   Returns the capstone project for a student (creates one if not exists).
//   Ownership: the authenticated user's own capstone, or any
//   if the user is an admin/instructor.
// =============================================================

export async function GET(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Enforce ownership
    if (authUser.sub !== studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own capstone." },
        { status: 403 }
      );
    }

    // Find or create capstone project
    let capstone = await db.capstoneProject.findFirst({ where: { studentId } });
    if (!capstone) {
      capstone = await db.capstoneProject.create({
        data: { studentId, title: "My Capstone Project", status: "NOT_STARTED" },
      });
    }

    return NextResponse.json({ capstone });
  } catch (e: any) {
    console.error("[GET /api/capstones] error:", e);
    return NextResponse.json({ error: "Failed to fetch capstone", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// PUT /api/capstones
// Body: { studentId, ...fields }
//   Updates the capstone project for a student.
//   Ownership: the authenticated user's own capstone, or any
//   if the user is an admin/instructor.
// =============================================================

export async function PUT(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();
    if (!body.studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Enforce ownership
    if (authUser.sub !== body.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only update your own capstone." },
        { status: 403 }
      );
    }

    // Find or create
    let capstone = await db.capstoneProject.findFirst({ where: { studentId: body.studentId } });
    if (!capstone) {
      capstone = await db.capstoneProject.create({
        data: { studentId: body.studentId, title: body.title || "Capstone Project", status: "NOT_STARTED" },
      });
    }

    // Build update payload with validation
    const data: any = {};
    const stringFields = [
      "title", "description", "deliverables", "feedback",
    ];
    for (const f of stringFields) {
      if (typeof body[f] === "string") data[f] = body[f] || null;
    }
    // targetAcos/targetTacos removed — not in schema

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"];
    if (validStatuses.includes(body.status)) {
      data.status = body.status;
      if (body.status === "SUBMITTED" && !capstone.submittedAt) {
        data.submittedAt = new Date();
      }
      if ((body.status === "APPROVED" || body.status === "REJECTED") && !capstone.reviewedAt) {
        data.reviewedAt = new Date();
      }
    }

    const updated = await db.capstoneProject.update({
      where: { id: capstone.id },
      data,
    });

    // Note: ProgressEntry requires moduleId — capstoneDone tracking via Phase model needed separately
    

    return NextResponse.json({ capstone: updated });
  } catch (e: any) {
    console.error("[PUT /api/capstones] error:", e);
    return NextResponse.json({ error: "Failed to update capstone", detail: e.message }, { status: 500 });
  }
}
