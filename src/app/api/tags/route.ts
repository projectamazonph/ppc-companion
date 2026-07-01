import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/tags — list all tags
//   Any authenticated user can view tags.
// =============================================================

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const tags = await db.tag.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({
      count: tags.length,
      tags: tags.map((t) => ({
        ...t,
        studentCount: t._count.students,
        _count: undefined,
      })),
    });
  } catch (e: any) {
    console.error("[GET /api/tags] error:", e);
    return NextResponse.json({ error: "Failed to list tags", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// POST /api/tags — create a new tag
//   Body: { name, color?, description? }
//   Requires: ADMIN
// =============================================================

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "ADMIN");
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const existing = await db.tag.findUnique({ where: { name: body.name } });
    if (existing) {
      return NextResponse.json({ error: `Tag "${body.name}" already exists` }, { status: 409 });
    }
    const tag = await db.tag.create({
      data: {
        name: body.name.trim(),
        color: body.color ?? "amber",
        description: body.description ?? null,
      },
    });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/tags] error:", e);
    return NextResponse.json({ error: "Failed to create tag", detail: e.message }, { status: 500 });
  }
}
