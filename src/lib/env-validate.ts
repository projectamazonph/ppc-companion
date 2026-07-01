// ============================================================================
// Environment Variable Validation
// ============================================================================
// Called at module import time to validate critical env vars are set.
// Throws with a clear message so the app fails fast, not at runtime.

const REQUIRED_VARS: { key: string; hint: string }[] = [
  {
    key: "JWT_SECRET",
    hint: "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  },
  {
    key: "DATABASE_URL",
    hint: "SQLite: 'file:./db/custom.db' | PostgreSQL: 'postgresql://user:pass@host/db?sslmode=require'",
  },
];

const OPTIONAL_VARS: { key: string; default: string; hint: string }[] = [
  {
    key: "NODE_ENV",
    default: "development",
    hint: "Set to 'production' in deployment",
  },
  {
    key: "PORT",
    default: "3000",
    hint: "Server port (Next.js default: 3000)",
  },
  {
    key: "RATE_LIMIT_MAX",
    default: "20",
    hint: "Max API requests per minute per IP",
  },
];

export function validateEnv(): void {
  const missing: string[] = [];

  for (const { key, hint } of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(`  • ${key} — ${hint}`);
    }
  }

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:\n");
    for (const msg of missing) {
      console.error(msg);
    }
    console.error(
      `\nCopy .env.example to .env and fill in the values, then restart.\n`
    );
    // Don't throw in development so the user can at least see the error
    // before the process exits. In production, crash hard.
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  // Apply defaults for optional vars
  for (const { key, default: val } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const okVars = REQUIRED_VARS.filter((v) => process.env[v.key]);
    if (okVars.length > 0) {
      console.debug(
        `✅ Env: ${okVars.length}/${REQUIRED_VARS.length} required vars set`
      );
    }
  }
}

// Run validation on import (edge-compatible: only in Node.js/Bun runtime)
if (typeof process !== "undefined" && process.env) {
  validateEnv();
}
