// ============================================================================
// Persistent Rate Limiter — Node:SQLite Backed
// ============================================================================
// Replaces the in-memory Map with a SQLite table so limits survive
// server restarts. Uses Node 22's built-in node:sqlite (experimental).
// Falls back to in-memory if SQLite fails.

import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), ".rate-limit.db");
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "20", 10);

// Periodic cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL_MS = 300_000;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

let db: DatabaseSync | null = null;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

// In-memory fallback (same interface, used if SQLite fails)
const memStore = new Map<string, { count: number; resetAt: number }>();

function initSqlite(): DatabaseSync | null {
  try {
    const d = new DatabaseSync(DB_PATH);
    d.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        ip TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        reset_at INTEGER NOT NULL
      )
    `);
    // Enable WAL mode for better concurrent access
    d.exec("PRAGMA journal_mode=WAL");
    return d;
  } catch (err) {
    console.warn(
      "[rate-limit] SQLite unavailable, using in-memory fallback:",
      (err as Error).message
    );
    return null;
  }
}

function cleanupExpired(): void {
  const now = Date.now();
  if (db) {
    try {
      db.prepare("DELETE FROM rate_limits WHERE reset_at < ?").run(now);
    } catch {
      // Silent — will try again next cycle
    }
  } else {
    // Clean in-memory store
    for (const [ip, entry] of memStore) {
      if (now >= entry.resetAt) memStore.delete(ip);
    }
  }
}

// Initialize on import
db = initSqlite();

// Periodic cleanup — prevents unbounded growth
cleanupTimer = setInterval(cleanupExpired, CLEANUP_INTERVAL_MS);
if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}

// Also run cleanup once immediately to clear stale entries from last session
cleanupExpired();

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  if (db) {
    // SQLite path
    const row = db
      .prepare("SELECT count, reset_at FROM rate_limits WHERE ip = ?")
      .get(ip) as { count: number; reset_at: number } | undefined;

    if (row && now < row.reset_at) {
      const newCount = row.count + 1;
      db.prepare("UPDATE rate_limits SET count = ? WHERE ip = ?").run(
        newCount,
        ip
      );
      return {
        allowed: newCount <= MAX_REQUESTS,
        remaining: Math.max(0, MAX_REQUESTS - newCount),
        resetAt: row.reset_at,
      };
    }

    // New window or expired entry
    const resetAt = now + WINDOW_MS;
    db.prepare(
      "INSERT OR REPLACE INTO rate_limits (ip, count, reset_at) VALUES (?, 1, ?)"
    ).run(ip, resetAt);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt,
    };
  }

  // In-memory fallback
  const entry = memStore.get(ip);
  if (entry && now < entry.resetAt) {
    entry.count++;
    return {
      allowed: entry.count <= MAX_REQUESTS,
      remaining: Math.max(0, MAX_REQUESTS - entry.count),
      resetAt: entry.resetAt,
    };
  }

  const resetAt = now + WINDOW_MS;
  memStore.set(ip, { count: 1, resetAt });
  return {
    allowed: true,
    remaining: MAX_REQUESTS - 1,
    resetAt,
  };
}

export function getRateLimitConfig(): { windowMs: number; maxRequests: number } {
  return { windowMs: WINDOW_MS, maxRequests: MAX_REQUESTS };
}

// Graceful shutdown (cleanup timer + close DB)
export function shutdownRateLimiter(): void {
  if (cleanupTimer) clearInterval(cleanupTimer);
  if (db) {
    try {
      db.close();
    } catch {
      // Already closed
    }
  }
}
