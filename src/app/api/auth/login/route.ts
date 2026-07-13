import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { touchLogin, logAction } from "@/lib/db-queries";
import { getJwtSecret } from "@/lib/auth-server";

const JWT_SECRET = getJwtSecret();

function publicUser(s: any) {
  const { password, ...rest } = s;
  return rest;
}

function signToken(student: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(
    { sub: student.id, email: student.email, role: student.role, name: student.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      include: { progress: { orderBy: { phaseNumber: "asc" } } },
    });

    // Generic error message to prevent user enumeration (C2)
    const genericAuthError = "Invalid email or password. Please try again.";

    if (!student) {
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    // Compare password using bcrypt
    const passwordValid = await bcrypt.compare(body.password, student.password);

    if (!passwordValid) {
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    if (student.status === "WITHDRAWN") {
      return NextResponse.json(
        { error: "This account has been withdrawn. Contact your administrator." },
        { status: 403 }
      );
    }

    if (student.deletedAt) {
      return NextResponse.json(
        { error: "This account has been deactivated." },
        { status: 403 }
      );
    }

    // Generate JWT
    const token = signToken(student);

    // Side effects
    await touchLogin(student.id);
    await logAction({
      actorId: student.id,
      action: "LOGIN",
      entityType: "student",
      entityId: student.id,
      summary: `${student.name} signed in`,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined as string | undefined,
    });
    await db.sessionLog.create({
      data: {
        studentId: student.id,
        userAgent: req.headers.get("user-agent") ?? null,
        ipAddress: req.headers.get("x-forwarded-for") ?? null,
      },
    });

    const response = NextResponse.json({
      user: publicUser(student),
      progress: student.progress,
      token,
      warning:
        student.status === "PAUSED"
          ? "Your account is currently paused. You can still browse the material."
          : null,
    });

    // Set HTTP-only cookie for middleware-based auth
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (e: unknown) {
    console.error("[POST /api/auth/login] error:", e);
    // C3: Only expose error detail in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
    }
    return NextResponse.json({
      error: "Login failed",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
