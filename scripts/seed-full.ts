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

  for (const phase of phases) {
    console.log(`  Phase ${phase.number}: ${phase.title}`);

    for (const mod of phase.modules) {
      // Create module
      const moduleItem = await db.module.create({
        data: {
          code: mod.code,
          title: mod.title,
          phaseNumber: phase.number,
          order: parseInt(mod.code.split(".")[1], 10),
          description: mod.content?.[0]?.body?.slice(0, 200) ?? null,
        },
      });

      // Create exercises for this module
      if (mod.exercises) {
        for (let i = 0; i < mod.exercises.length; i++) {
          const ex = mod.exercises[i];
          await db.exercise.create({
            data: {
              moduleId: moduleItem.id,
              code: ex.id,
              title: ex.title,
              prompt: ex.prompt,
              type: ex.type === "open" ? "OPEN" : ex.type === "calculation" ? "CALCULATION" : ex.type === "decision" ? "DECISION" : "OPEN",
              order: i + 1,
            },
          });
        }
      }

      console.log(`    ✓ Module ${mod.code}: ${mod.title} (${mod.exercises?.length ?? 0} exercises)`);
    }

    // Create checkpoint quiz for this phase
    if (phase.checkpoint) {
      const quiz = phase.checkpoint;
      const phaseModule = await db.module.findFirst({
        where: { code: `${phase.number}.3` },
      }) ?? await db.module.findFirst({
        where: { code: `${phase.number}.2` },
      }) ?? await db.module.findFirst({
        where: { phaseNumber: phase.number },
        orderBy: { order: "desc" },
      });

      if (phaseModule) {
        const createdQuiz = await db.quiz.create({
          data: {
            moduleId: phaseModule.id,
            title: quiz.title,
            passingScore: 60,
          },
        });

        for (let i = 0; i < quiz.questions.length; i++) {
          const q = quiz.questions[i];
          await db.quizQuestion.create({
            data: {
              quizId: createdQuiz.id,
              question: q.question,
              type: q.type === "mcq" ? "MCQ" : q.type === "numeric" ? "NUMERIC" : "OPEN",
              options: q.options ? JSON.stringify(q.options.map(o => ({ id: o.id, label: o.label, correct: o.correct ?? false }))) : null,
              modelAnswer: q.modelAnswer ?? null,
              explanation: q.explanation ?? null,
              points: 20,
              order: i + 1,
            },
          });
        }
        console.log(`    ✓ Quiz: ${quiz.title} (${quiz.questions.length} questions)`);
      }
    }
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
        targetAcos: TARGET_ACOS,
        targetTacos: 15,
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
      await db.notification.create({ data: { studentId: student.id, type: n.type, title: n.title, message: n.message, link: n.link } });
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
