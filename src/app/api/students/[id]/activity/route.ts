import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeOverallPercent } from "@/lib/db-queries";
import { requireAuth, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/students/[id]/activity
//   Returns a comprehensive activity feed for a student.
//   Ownership: the authenticated user's own activity, or any
//   activity if the user is an admin/instructor.
// =============================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await requireAuth(req);
  if (isErrorResponse(authUser)) return authUser;

  try {
    const { id } = await params;

    // Enforce ownership: user can only view their own activity
    // unless they're an admin or instructor.
    if (authUser.sub !== id && !["ADMIN", "INSTRUCTOR"].includes(authUser.role)) {
      return NextResponse.json(
        { error: "Access denied. You can only view your own activity." },
        { status: 403 }
      );
    }

    const student = await db.student.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
        enrolledAt: true,
        currentPhase: true,
        targetAcos: true,
        cohort: true,
        avatarUrl: true,
        bio: true,
        timezone: true,
        lastLoginAt: true,
      },
    });
    if (!student || student.deletedAt) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch all the related data in parallel
    const [
      submissions,
      attempts,
      capstone,
      progress,
      enrollments,
      sessions,
      notifications,
    ] = await Promise.all([
      db.exerciseSubmission
        .findMany({
          where: { studentId: id },
          include: {
            exercise: {
              select: {
                id: true,
                code: true,
                title: true,
                type: true,
                module: { select: { code: true, title: true, phase: { select: { number: true } } } },
              },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
          take: 50,
        })
        .then((subs) =>
          subs.map((s) => ({
            ...s,
            exercise: {
              ...s.exercise,
              module: { ...s.exercise.module, phaseNumber: s.exercise.module.phase?.number ?? null },
            },
          }))
        ),
      db.quizAttempt
        .findMany({
          where: { studentId: id },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                module: { select: { code: true, title: true, phase: { select: { number: true } } } },
              },
            },
          },
          orderBy: [{ createdAt: "desc" }],
          take: 50,
        })
        .then((atts) =>
          atts.map((a) => ({
            ...a,
            quiz: {
              ...a.quiz,
              module: { ...a.quiz.module, phaseNumber: a.quiz.module.phase?.number ?? null },
            },
          }))
        ),
      db.capstoneProject.findFirst({ where: { studentId: id } }),
      db.progressEntry.findMany({
        where: { studentId: id },
        orderBy: { phaseNumber: "asc" },
      }),
      db.enrollment.findMany({
        where: { studentId: id },
        include: { cohort: { select: { id: true, name: true, status: true } } },
      }),
      db.sessionLog.findMany({
        where: { studentId: id },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
      db.notification.findMany({
        where: { studentId: id },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
    ]);

    // Build a unified activity timeline (newest first)
    type ActivityItem = {
      id: string;
      type: "submission" | "quiz_attempt" | "capstone" | "login" | "notification";
      timestamp: string;
      title: string;
      description: string;
      metadata?: Record<string, unknown>;
    };

    const timeline: ActivityItem[] = [];

    for (const s of submissions) {
      timeline.push({
        id: s.id,
        type: "submission",
        timestamp: s.updatedAt.toISOString(),
        title: `Exercise ${s.exercise.code}: ${s.exercise.title}`,
        description: s.answer && s.answer.length > 100 ? s.answer.slice(0, 100) + "..." : s.answer ?? "",
        metadata: {
          exerciseCode: s.exercise.code,
          exerciseType: s.exercise.type,
          phase: s.exercise.module?.phase?.number ?? null,
          status: s.status,
        },
      });
    }

    for (const a of attempts) {
      timeline.push({
        id: a.id,
        type: "quiz_attempt",
        timestamp: a.createdAt.toISOString(),
        title: `Quiz: ${a.quiz.title}`,
        description: `Scored ${a.score}/${a.total} (${a.percentage ?? 0}%)`,
        metadata: {
          quizId: a.quiz.id,
          phase: a.quiz.module?.phaseNumber ?? null,
          passed: a.passed,
        },
      });
    }

    if (capstone) {
      timeline.push({
        id: capstone.id,
        type: "capstone",
        timestamp: (capstone.updatedAt ?? capstone.createdAt).toISOString(),
        title: "Capstone project",
        description: capstone.title ?? "Capstone submission",
        metadata: { status: capstone.status },
      });
    }

    for (const sess of sessions) {
      timeline.push({
        id: sess.id,
        type: "login",
        timestamp: sess.createdAt.toISOString(),
        title: "Logged in",
        description: sess.userAgent ?? "Session started",
      });
    }

    for (const n of notifications) {
      timeline.push({
        id: n.id,
        type: "notification",
        timestamp: n.createdAt.toISOString(),
        title: n.title,
        description: n.message ?? "",
        metadata: { read: n.read, type: n.type },
      });
    }

    timeline.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    const overallProgress = computeOverallPercent(progress);
    const gradedAttempts = attempts.filter((a) => typeof a.percentage === "number");
    const avgQuizPercentage = gradedAttempts.length
      ? Math.round(
          (gradedAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / gradedAttempts.length) * 100
        ) / 100
      : 0;

    const stats = {
      overallProgress,
      avgQuizPercentage,
      submissionsCount: submissions.length,
      attemptsCount: attempts.length,
    };

    return NextResponse.json({
      student,
      progress,
      submissions,
      attempts,
      sessions,
      notifications,
      tags: [],
      timeline,
      stats,
      enrollments,
      capstone: capstone ?? null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[GET /api/students/[id]/activity] error:", message);
    return NextResponse.json({ error: "Failed to load activity", detail: message }, { status: 500 });
  }
}
