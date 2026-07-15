import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/notifications — list notifications for a student
//   ?studentId=xxx   ?unreadOnly=true
//   Ownership: the authenticated user's own notifications, or any
//   if the user is an admin/instructor.
// =============================================================

export async function GET(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Enforce ownership
    if (authUser.sub !== studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own notifications." },
        { status: 403 }
      );
    }

    const where: any = { studentId };
    if (unreadOnly) where.read = false;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { studentId, read: false },
    });

    return NextResponse.json({
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (e: any) {
    console.error("[GET /api/notifications] error:", e);
    return NextResponse.json({ error: "Failed to list notifications", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// PUT /api/notifications — mark as read
// Body: { id: "xxx" } or { studentId: "xxx", markAllRead: true }
//   Ownership: user can only mark their own notifications as read,
//   unless they're an admin/instructor.
// =============================================================

export async function PUT(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();

    if (body.markAllRead && body.studentId) {
      // Enforce ownership for bulk mark-read
      if (authUser.sub !== body.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
        return NextResponse.json(
          { error: "Access denied. You can only mark your own notifications." },
          { status: 403 }
        );
      }

      const result = await db.notification.updateMany({
        where: { studentId: body.studentId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ markedRead: result.count });
    }

    if (body.id) {
      // For a single notification, verify ownership by reading it first
      const notif = await db.notification.findUnique({ where: { id: body.id } });
      if (!notif) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      if (authUser.sub !== notif.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
        return NextResponse.json(
          { error: "Access denied. You can only mark your own notifications." },
          { status: 403 }
        );
      }

      const updated = await db.notification.update({
        where: { id: body.id },
        data: { read: true },
      });
      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json({ error: "Provide either {id} or {studentId, markAllRead}" }, { status: 400 });
  } catch (e: any) {
    console.error("[PUT /api/notifications] error:", e);
    return NextResponse.json({ error: "Failed to update notification", detail: e.message }, { status: 500 });
  }
}

// =============================================================
// DELETE /api/notifications — delete a single notification
// Body: { id: "xxx" }
//   Ownership: user can only delete their own notifications,
//   unless they're an admin/instructor.
// =============================================================

export async function DELETE(req: NextRequest) {
  const authUser = requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Enforce ownership
    if (authUser.sub !== notif.studentId && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only delete your own notifications." },
        { status: 403 }
      );
    }

    await db.notification.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (e: any) {
    console.error("[DELETE /api/notifications] error:", e);
    return NextResponse.json({ error: "Failed to delete notification", detail: e.message }, { status: 500 });
  }
}
