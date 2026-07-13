import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/audit — list audit log entries
//   Requires: ADMIN role
// =============================================================

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "ADMIN");
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const actorId = searchParams.get("actorId");
    const action = searchParams.get("action");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;

    const [entries, total] = await Promise.all([
      db.auditEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditEntry.count({ where }),
    ]);

    return NextResponse.json({ count: entries.length, total, skip: offset, limit, entries });
  } catch (e: any) {
    console.error("[GET /api/audit] error:", e);
    return NextResponse.json({ error: "Failed to list audit entries", detail: e.message }, { status: 500 });
  }
}
