// Bootstrap script - create an admin user for initial setup
// Run with: npx tsx scripts/seed-students.ts
//
// SAFETY: Refuses to run against production DB unless SEED_CONFIRM=true
// ====================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// --- Production guard ---
const dbUrl = process.env.DATABASE_URL || "";
const hasRemoteDb = dbUrl.includes("pg" + ":") && dbUrl.includes("://");
const PW = process.env.ADMIN_PASSWORD || 'changeme123';
const NAME = process.env.ADMIN_NAME || 'Program Admin';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@ppc-companion.local';

if (hasRemoteDb && !process.env.SEED_CONFIRM) {
  console.error("Refusing to seed: database looks like production.");
  console.error("Set SEED_CONFIRM=true to override.");
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash(PW, 12);

  const admin = await db.student.upsert({
    where: { email: EMAIL },
    update: {},
    create: {
      email: EMAIL,
      name: NAME,
      password: hash,
      role: "ADMIN",
      status: "ACTIVE",
      currentPhase: 4,
      targetAcos: 30,
    },
  });

  console.log("Admin created: " + admin.email + " (" + NAME + ")");
  console.log("Change the default password in production!");
  console.log("Total students: " + (await db.student.count()));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
