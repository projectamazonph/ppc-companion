import { describe, it, expect } from "vitest";

// =============================================================
// Smoke tests — basic sanity checks for the app
// =============================================================

describe("Smoke tests", () => {
  it("Node runs", () => {
    expect(typeof process).toBe("object");
    expect(typeof process.version).toBe("string");
  });

  it("ES modules work", async () => {
    // Verify we can import from the source tree
    const { programOverview } = await import("@/lib/course-data");
    expect(programOverview).toBeDefined();
    expect(programOverview.title).toBe("Amazon PPC Manager");
    expect(programOverview.subtitle).toBe("Student Workbook");
    expect(programOverview.version).toBe("2026");
  });

  it("Auth utilities export expected symbols", async () => {
    const auth = await import("@/lib/auth-server");
    expect(auth.verifyToken).toBeDefined();
    expect(auth.requireAuth).toBeDefined();
    expect(auth.requireRole).toBeDefined();
    expect(auth.isErrorResponse).toBeDefined();
    expect(auth.getAuthUser).toBeDefined();
  });

  it("Phase structure is intact", async () => {
    const { phases } = await import("@/lib/course-data");
    expect(Array.isArray(phases)).toBe(true);
    expect(phases.length).toBeGreaterThanOrEqual(4);
    // Each phase must have required fields
    for (const phase of phases) {
      expect(phase.id).toBeDefined();
      expect(phase.title).toBeDefined();
      expect(phase.modules).toBeDefined();
      expect(Array.isArray(phase.modules)).toBe(true);
    }
  });

  it("Environment validation loads", async () => {
    const env = await import("@/lib/env-validate");
    expect(env.validateEnv).toBeDefined();
  });
});
