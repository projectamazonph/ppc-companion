import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import type { Role, StudentStatus } from "@prisma/client";
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

    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required (at least 2 characters)" }, { status: 400 });
    }
    if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required", debug: { hasEmail: !!body.email, type: typeof body.email, keys: Object.keys(body) } }, { status: 400 });
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();

    const existing = await db.student.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: `An account with "${email}" already exists. Try signing in instead.` },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    const student = await db.student.create({
      data: {
        name: body.name.trim(),
        email,
        password: hashedPassword,
        role: "STUDENT" as Role,
        status: "ACTIVE" as StudentStatus,
        cohort: typeof body.cohort === "string" && body.cohort.trim() ? body.cohort.trim() : null,
        currentPhase: 1,
        targetAcos: 30,
      },
      include: { progress: true },
    });

    // Generate token
    const token = signToken(student);

    const response = NextResponse.json(
      {
        user: publicUser(student),
        progress: student.progress,
        token,
        welcome: `Welcome aboard, ${student.name.split(" ")[0]}! Your training journey starts now.`,
      },
      { status: 201 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (e: any) {
    console.error("[POST /api/auth/signup] error:", e);
    return NextResponse.json({ error: "Signup failed", detail: e.message }, { status: 500 });
  }
}
