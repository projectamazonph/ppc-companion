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
  const authUser = requireAuth(req);
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
    const [submissions, attempts, capstone, progress, enrollments, tags, sessions, notifications] =
      await Promise.all([
        db.exerciseSubmission.findMany({
          where: { studentId: id },
          include: {
            exercise: {
              select: { id: true, code: true, title: true, type: true, module: { select: { code: true, phaseNumber: true } } },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
          take: 50,
        }),
        db.quizAttempt.findMany({
          where: { studentId: id },
          include: {
            quiz: {
              select: { id: true, title: true, module: { select: { code: true, phaseNumber: true } } },
            },
          },
          orderBy: [{ createdAt: "desc" }],
          take: 50,
        }),
        db.capstoneProject.findFirst({ where: { studentId: id } }),
        db.progressEntry.findMany({
          where: { studentId: id },
          orderBy: { phaseNumber: "asc" },
        }),
        db.enrollment.findMany({
          where: { studentId: id },
          include: { cohort: { select: { id: true, name: true, status: true } } },
        }),
    // studentTag removed — Tag model not in schema
          where: { studentId: id },
          include: { tag: { select: { id: true, name: true, color: true } } },
        }),
        db.sessionLog.findMany({
          where: { studentId: id },
          orderBy: [{ loginAt: "desc" }],
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
      metadata?: any;
    };

    const timeline: ActivityItem[] = [];

    for (const s of submissions) {
      timeline.push({
        id: s.id,
        type: "submission",
        timestamp: s.updatedAt.toISOString(),
        title: `Exercise ${s.exercise.code}: ${s.exercise.title}`,
        description:
          s.answer.length > 100 ? s.answer.slice(0, 100) + "..." : s.answer,
        metadata: {
          exerciseCode: s.exercise.code,
          exerciseType: s.exercise.type,
          phase: s.exercise.module?.phaseNumber,
          status: s.status,
          score: s.score,
          hasFeedback: !!s.feedback,
        },
      });
    }

    for (const a of attempts) {
      timeline.push({
        id: a.id,
        type: "quiz_attempt",
        timestamp: a.createdAt.toISOString(),
        title: `Quiz attempt: ${a.quiz.title}`,
        description: `Scored ${a.score}/${a.total} (${a.percentage.toFixed(1)}%) — ${a.passed ? "PASSED" : "did not pass"}`,
        metadata: {
          phase: a.quiz.module?.phaseNumber,
          score: a.score,
          total: a.total,
          percentage: a.percentage,
          passed: a.passed,
          durationSec: a.durationSec,
        },
      });
    }

    for (const s of sessions) {
      timeline.push({
        id: s.id,
        type: "login",
        timestamp: s.loginAt.toISOString(),
        title: "Signed in",
        description: s.userAgent
          ? `From ${s.userAgent.includes("Mobile") ? "mobile" : "desktop"} browser${s.ipAddress ? ` · ${s.ipAddress}` : ""}`
          : "Session started",
        metadata: { durationSec: s.durationSec },
      });
    }

    for (const n of notifications) {
      timeline.push({
        id: n.id,
        type: "notification",
        timestamp: n.createdAt.toISOString(),
        title: n.title,
        description: n.message,
        metadata: { type: n.type, read: !!n.readAt, link: n.link },
      });
    }

    // Sort by timestamp descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Aggregate stats
    const passedAttempts = attempts.filter((a) => a.passed);
    const avgQuizPercentage =
      attempts.length > 0
        ? Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) * 10) / 10
        : null;

    return NextResponse.json({
      student,
      stats: {
        submissionsCount: submissions.length,
        gradedSubmissions: submissions.filter((s) => s.status === "GRADED").length,
        quizAttemptsCount: attempts.length,
        quizzesPassedCount: passedAttempts.length,
        avgQuizPercentage,
        capstoneStatus: capstone?.status ?? "NOT_STARTED",
        overallProgress: computeOverallPercent(progress),
        currentPhase: progress.length > 0 ? Math.max(...progress.map((p) => p.phaseNumber)) : 1,
      },
      timeline: timeline.slice(0, 50), // cap at 50 most recent
      submissions,
      attempts,
      capstone,
      progress,
      enrollments,
      tags: tags.map((t) => t.tag),
      sessions,
      notifications,
    });
  } catch (e: any) {
    console.error("[GET /api/students/[id]/activity] error:", e);
    return NextResponse.json({ error: "Failed to fetch activity", detail: e.message }, { status: 500 });
  }
}
