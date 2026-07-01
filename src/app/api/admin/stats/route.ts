import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isErrorResponse } from "@/lib/auth-server";

// =============================================================
// GET /api/admin/stats — aggregate platform stats for the admin
//   dashboard. Requires ADMIN role.
// =============================================================

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "ADMIN");
  if (isErrorResponse(auth)) return auth;

  try {
    const [
      totalStudents,
      activeStudents,
      totalCohorts,
      progressEntries,
      recentStudents,
      exerciseSubmissions,
    ] = await Promise.all([
      // Total non-deleted students
      db.student.count({
        where: { deletedAt: null },
      }),

      // Active students
      db.student.count({
        where: { deletedAt: null, status: "ACTIVE" },
      }),

      // Total cohorts
      db.cohort.count(),

      // All progress entries for completion rate
      db.progressEntry.findMany({
        select: { exercisesDone: true, exercisesTotal: true },
      }),

      // Recent registrations (last 5)
      db.student.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),

      // Count of submitted exercises
      db.exerciseSubmission.count(),
    ]);

    // Calculate average completion rate across all progress entries
    const avgCompletion =
      progressEntries.length > 0
        ? Math.round(
            (progressEntries.reduce((sum, e) => {
              const pct =
                e.exercisesTotal > 0
                  ? (e.exercisesDone / e.exercisesTotal) * 100
                  : 0;
              return sum + pct;
            }, 0) /
              progressEntries.length) *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      stats: {
        totalStudents,
        activeStudents,
        avgCompletion,
        totalCohorts,
        totalSubmissions: exerciseSubmissions,
      },
      recentRegistrations: recentStudents,
    });
  } catch (e: any) {
    console.error("[GET /api/admin/stats] error:", e);
    return NextResponse.json(
      { error: "Failed to load admin stats", detail: e.message },
      { status: 500 }
    );
  }
}
