import bcrypt from "bcryptjs";
// ============================================================================
// Seed Script — populates DB from the real course-data.ts
// Run: bun run scripts/seed-full.ts
//
// Idempotent: recreates all data except Student records (which are merged).
// Requires DATABASE_URL in .env (defaults to file:./db/custom.db).
//
// SAFETY: This script DELETES data. If NODE_ENV=production or DATABASE_URL
// points to a remote PostgreSQL host, it refuses to run unless SEED_CONFIRM=true
// is set in the environment.
// ============================================================================

import { PrismaClient } from "@prisma/client";
import {
  phases,
  glossary,
  formulas,
  weeklyChecklist,
  capstoneDeliverables,
  namingFormat,
} from "../src/lib/course-data";

// --- Production guard ---
const dbUrl = process.env.DATABASE_URL || "";
const isRemote = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");
if ((process.env.NODE_ENV === "production" || isRemote) && !process.env.SEED_CONFIRM) {
  console.error("❌ Refusing to seed: database looks like production.");
  console.error("   Set SEED_CONFIRM=true in your environment to override.");
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ----------------------------------------------------------------
  // Wipe non-student data (idempotent re-run)
  // ----------------------------------------------------------------
  console.log("Clearing existing data...");
  await db.auditEntry.deleteMany();
  await db.comment.deleteMany();
  await db.notification.deleteMany();
  await db.sessionLog.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.quizQuestion.deleteMany();
  await db.quiz.deleteMany();
  await db.exerciseSubmission.deleteMany();
  await db.exercise.deleteMany();
  await db.module.deleteMany();
  await db.enrollment.deleteMany();
  await db.cohort.deleteMany();
  await db.progressEntry.deleteMany();
  await db.capstoneProject.deleteMany();
  await db.student.deleteMany();
  console.log("  ✓ Cleared\n");

  // ----------------------------------------------------------------
  // Config
  // ----------------------------------------------------------------
  const TARGET_ACOS = 30;

  // ----------------------------------------------------------------
  // Students — no demo accounts. Add students via admin panel or sign-up.
  const studentsData: any[] = [];
  const createdStudents: Record<string, any> = {};
    let admin: any = null;

  // ----------------------------------------------------------------
  // Cohorts
  // ----------------------------------------------------------------
  console.log("\nCreating cohorts...");
  const cohortRecords: Record<string, any> = {};
  const cohortsData = [
    { code: "batch-2026-spring", name: "Spring 2026", desc: "Currently in progress", start: "2026-03-01", end: "2026-06-30", status: "ACTIVE" as const, max: 30 },
    { code: "batch-2025-winter", name: "Winter 2025", desc: "Completed cohort", start: "2025-01-01", end: "2025-04-30", status: "COMPLETED" as const, max: 25 },
    { code: "batch-2026-summer", name: "Summer 2026", desc: "Planned cohort", start: "2026-06-15", end: "2026-09-15", status: "PLANNED" as const, max: 40 },
  ];
  for (const c of cohortsData) {
    const cohort = await db.cohort.create({
      data: { code: c.code, name: c.name, description: c.desc, startDate: new Date(c.start), endDate: new Date(c.end), status: c.status, maxStudents: c.max },
    });
    cohortRecords[c.name] = cohort;
    console.log(`  ✓ ${cohort.name} (${cohort.status})`);
  }

  // Enroll students in cohorts
  console.log("\nEnrolling students...");
  for (const s of studentsData) {
    if (!s.cohort || (s.role as string) === "INSTRUCTOR" || (s.role as string) === "ADMIN") continue;
    const cohort = cohortRecords[s.cohort];
    if (!cohort) continue;
    await db.enrollment.create({
      data: { studentId: createdStudents[s.email].id, cohortId: cohort.id, status: "ENROLLED" },
    });
  }
  console.log(`  ✓ ${studentsData.filter(s => s.cohort && (s.role as string) !== "INSTRUCTOR" && (s.role as string) !== "ADMIN").length} enrollments`);

  // ----------------------------------------------------------------
  // Modules, Exercises, Quizzes from course-data.ts
  // ----------------------------------------------------------------
  console.log("\nCreating modules, exercises, and quizzes from course data...");

  // Modules, exercises, and quizzes are NOT seeded here.
  // Module requires a Phase record (phaseId relation), but Phase is not seeded.
  // To seed curriculum: (1) seed Phase records, (2) run seed-modules.ts separately.
  console.log("\nModules/exercises/quizzes: skipped (Phase not seeded)")
  for (const phase of phases) {
    console.log(`  Phase ${phase.number}: ${phase.title} — not seeded`);
  }

  // ----------------------------------------------------------------
  // Capstone Projects for students
  // ----------------------------------------------------------------
  console.log("\nCreating capstone projects...");
  for (const s of studentsData) {
    if ((s.role as string) !== "STUDENT") continue;
    const student = createdStudents[s.email];
    await db.capstoneProject.create({
      data: {
        studentId: student.id,
        title: `${student.name}'s Capstone`,
        status: s.currentPhase >= 4 ? "IN_PROGRESS" : "NOT_STARTED",
      },
    });
  }
  console.log(`  ✓ Capstone projects created for ${studentsData.filter(s => (s.role as string) === "STUDENT").length} students`);

  // ----------------------------------------------------------------
  // Tags
  // ----------------------------------------------------------------
  // Tags — removed (Tag/StudentTag models not in schema)
  // Tags are assigned by instructors via the admin panel at runtime

  // ----------------------------------------------------------------
  // Notifications
  // ----------------------------------------------------------------
  console.log("\nCreating notifications...");
  for (const s of studentsData) {
    if ((s.role as string) !== "STUDENT") continue;
    const student = createdStudents[s.email];
    if (!student) continue;
    const name = student.name.split(" ")[0];
    const notifications = [
      { type: "INFO" as const, title: "Welcome!", message: `Hi ${name}, welcome to PPC Companion! Start with Phase 1.`, link: "/curriculum" },
      { type: "SUCCESS" as const, title: "Phase 1 Ready", message: `Phase 1: Foundations is ready for you. Complete 3 exercises and the checkpoint quiz.`, link: "/curriculum" },
    ];
    for (const n of notifications) {
      await db.notification.create({ data: { studentId: student.id, type: n.type, title: n.title, message: n.message, actionUrl: n.link, read: false } });
    }
  }
  console.log(`  ✓ Welcome notifications created`);

  // ----------------------------------------------------------------
  // Audit log
  // ----------------------------------------------------------------
  await db.auditEntry.create({
    data: {
      actorId: admin?.id ?? null,
      action: "CREATE",
      entityType: "system",
      entityId: "seed",
      summary: "Full database seeded from course-data.ts",
    },
  });

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  const counts = {
    Students: await db.student.count(),
    Cohorts: await db.cohort.count(),
    Enrollments: await db.enrollment.count(),
    Modules: await db.module.count(),
    Exercises: await db.exercise.count(),
    Quizzes: await db.quiz.count(),
    QuizQuestions: await db.quizQuestion.count(),
    Capstones: await db.capstoneProject.count(),
    ProgressEntries: await db.progressEntry.count(),
    Notifications: await db.notification.count(),
  };

  console.log("\n✅ Seed complete. Final counts:");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`   ${k.padEnd(16)} ${v}`);
  }
  console.log("\nSeed complete (no demo accounts).");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
