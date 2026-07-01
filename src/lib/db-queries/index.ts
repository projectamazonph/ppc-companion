// ============================================================================
// Reusable database query helpers
// ----------------------------------------------------------------------------
// These wrap common Prisma queries so API routes and components can stay
// thin. All functions strip the password field from Student records before
// returning.
// ============================================================================

import { db } from "@/lib/db";
import type { Student, Cohort, ProgressEntry } from "@prisma/client";

// Strip password from any student-shaped object
export function publicStudent<T extends Student>(s: T): Omit<T, "password"> {
  if (!s) return s;
  const { password, ...rest } = s;
  return rest;
}

// ============================================================================
// Student queries
// ============================================================================

export type StudentWithRelations = Student & {
  progress?: ProgressEntry[];
  enrollments?: (Cohort & { cohort: Cohort })[];
  tagsAssigned?: { tag: { id: string; name: string; color: string } }[];
};

/** Get a single student by ID, with progress + enrollments + tags. */
export async function getStudentById(id: string) {
  const student = await db.student.findUnique({
    where: { id },
    include: {
      progress: { orderBy: { phaseNumber: "asc" } },
      enrollments: { include: { cohort: true } },
      tagsAssigned: { include: { tag: true } },
      capstones: true,
    },
  });
  return student ? publicStudent(student) : null;
}

/** Get a student by email (case-insensitive) for auth flows. */
export async function getStudentByEmail(email: string) {
  return db.student.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { progress: { orderBy: { phaseNumber: "asc" } } },
  });
}

/** List students with optional filters. */
export async function listStudents(opts: {
  role?: string;
  status?: string;
  cohort?: string;
  q?: string;
  includeProgress?: boolean;
  includeDeleted?: boolean;
  limit?: number;
} = {}) {
  const where: any = {};
  if (opts.role) where.role = opts.role;
  if (opts.status) where.status = opts.status;
  if (opts.cohort) where.cohort = opts.cohort;
  if (!opts.includeDeleted) where.deletedAt = null;
  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q } },
      { email: { contains: opts.q } },
      { notes: { contains: opts.q } },
    ];
  }
  const students = await db.student.findMany({
    where,
    include: opts.includeProgress ? { progress: { orderBy: { phaseNumber: "asc" } } } : undefined,
    orderBy: [{ createdAt: "desc" }],
    take: opts.limit ?? 100,
  });
  return students.map(publicStudent);
}

/** Soft-delete a student (sets deletedAt). */
export async function softDeleteStudent(id: string) {
  return db.student.update({
    where: { id },
    data: { deletedAt: new Date(), status: "WITHDRAWN" },
  });
}

/** Restore a soft-deleted student. */
export async function restoreStudent(id: string) {
  return db.student.update({
    where: { id },
    data: { deletedAt: null, status: "ACTIVE" },
  });
}

/** Update a student's lastLoginAt timestamp. */
export async function touchLogin(id: string) {
  return db.student.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

// ============================================================================
// Cohort queries
// ============================================================================

/** List cohorts with enrollment counts. */
export async function listCohorts(includeStats = false) {
  if (!includeStats) {
    return db.cohort.findMany({ orderBy: [{ startDate: "desc" }] });
  }
  const cohorts = await db.cohort.findMany({
    include: {
      _count: { select: { enrollments: true } },
      enrollments: {
        where: { status: "ENROLLED" as const },
        select: { id: true },
      },
    },
    orderBy: [{ startDate: "desc" }],
  });
  return cohorts.map((c) => ({
    ...c,
    enrollmentCount: c._count.enrollments,
    activeCount: c.enrollments.length,
    _count: undefined,
    enrollments: undefined,
  }));
}

/** Get a cohort with its enrollments + student details. */
export async function getCohortWithStudents(id: string) {
  return db.cohort.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              currentPhase: true,
              targetAcos: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      },
      instructor: { select: { id: true, name: true, email: true } },
    },
  });
}

// ============================================================================
// Progress queries
// ============================================================================

/** Get or create a progress entry for a (student, phase) pair. */
export async function getOrCreateProgress(studentId: string, phaseNumber: number) {
  return db.progressEntry.upsert({
    where: { studentId_phaseNumber: { studentId, phaseNumber } },
    create: { studentId, phaseNumber },
    update: {},
  });
}

/** Compute the overall % complete for a student. */
export function computeOverallPercent(progress: ProgressEntry[] | undefined): number {
  if (!progress || progress.length === 0) return 0;
  let total = 0;
  let done = 0;
  for (const p of progress) {
    if (p.exercisesTotal > 0) {
      total += p.exercisesTotal;
      done += p.exercisesDone;
    }
    total += 1;
    if (p.quizScore !== null && p.quizScore / Math.max(1, p.quizTotal) >= 0.6) done += 1;
    if (p.phaseNumber === 4) {
      total += 1;
      if (p.capstoneDone) done += 1;
    }
  }
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

/** Get aggregate stats for a cohort (or all students). */
export async function getCohortStats(cohortId?: string) {
  const studentFilter = cohortId
    ? { enrollments: { some: { cohortId, status: "ENROLLED" as const } } }
    : {};
  const students = await db.student.findMany({
    where: { role: "STUDENT", deletedAt: null, ...studentFilter },
    include: { progress: true },
  });
  return {
    total: students.length,
    active: students.filter((s) => s.status === "ACTIVE").length,
    paused: students.filter((s) => s.status === "PAUSED").length,
    graduated: students.filter((s) => s.status === "GRADUATED").length,
    withdrawn: students.filter((s) => s.status === "WITHDRAWN").length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + computeOverallPercent(s.progress), 0) / students.length)
      : 0,
    avgPhase: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.currentPhase, 0) / students.length * 10) / 10
      : 0,
  };
}

// ============================================================================
// Audit log
// ============================================================================

export async function logAction(opts: {
  actorId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT";
  entityType: string;
  entityId: string;
  summary: string;
  changes?: any;
  ipAddress?: string;
}) {
  return db.auditLog.create({
    data: {
      actorId: opts.actorId ?? null,
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId,
      summary: opts.summary,
      changes: opts.changes ? JSON.stringify(opts.changes) : null,
      ipAddress: opts.ipAddress ?? null,
    },
  });
}

// ============================================================================
// Notification helpers
// ============================================================================

export async function notifyStudent(opts: {
  studentId: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "ASSIGNMENT" | "GRADE";
  title: string;
  message: string;
  link?: string;
}) {
  return db.notification.create({
    data: {
      studentId: opts.studentId,
      type: opts.type ?? "INFO",
      title: opts.title,
      message: opts.message,
      link: opts.link ?? null,
    },
  });
}

/** Get unread notification count for a student. */
export async function getUnreadCount(studentId: string): Promise<number> {
  return db.notification.count({
    where: { studentId, readAt: null },
  });
}
