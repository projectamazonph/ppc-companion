import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    // Authenticate — identity comes from JWT, not the request body
    const authUser = requireAuth(req);
    if (isErrorResponse(authUser)) return authUser;

    const body = await req.json();
    const { currentPassword, newPassword } = body;
    const targetStudentId = body.studentId;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Determine which student's password to change:
    //   - Default: the authenticated user's own password
    //   - Explicit target: only admins can change another user's password
    const changeStudentId = targetStudentId ?? authUser.sub;

    if (targetStudentId && targetStudentId !== authUser.sub && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can change another user's password" },
        { status: 403 }
      );
    }

    const student = await db.student.findUnique({ where: { id: changeStudentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify current password
    const valid = student.password.startsWith("$2")
      ? await bcrypt.compare(currentPassword, student.password)
      : student.password === currentPassword;

    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.student.update({
      where: { id: changeStudentId },
      data: { password: hashed },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e: any) {
    console.error("[POST /api/auth/change-password] error:", e);
    return NextResponse.json(
      { error: "Failed to change password", detail: e.message },
      { status: 500 }
    );
  }
}
