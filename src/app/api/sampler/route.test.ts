import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/sampler/route";

describe("GET /api/sampler — sampler-only metadata", () => {
  it("returns the sampler contract with no course phase leakage", async () => {
    const res = await GET();
    const json = await res.json();

    // Core sampler objects present.
    expect(json.meta.isSampler).toBe(true);
    expect(Array.isArray(json.steps)).toBe(true);
    expect(json.steps).toHaveLength(4);
    expect(json.diagnosticFramework).toBeDefined();
    expect(json.escalationCard).toBeDefined();
    expect(Array.isArray(json.academyTiers)).toBe(true);
    expect(Array.isArray(json.previewModules)).toBe(true);
    expect(Array.isArray(json.careerPaths)).toBe(true);

    // Decoupling guard: the sampler endpoint must NOT expose the legacy
    // four-phase course, module unlock state, or anything Academy-auth-like.
    expect(json.phases).toBeUndefined();
    expect(json.trialMode).toBeUndefined();
  });

  it("keeps each step focused (no full lessons copied)", async () => {
    const res = await GET();
    const json = await res.json();
    for (const step of json.steps) {
      expect(typeof step.title).toBe("string");
      expect(step).toHaveProperty("academyHandoff");
      // Each step points learners to the Academy for the deep content.
      expect(step.academyHandoff.tier.length).toBeGreaterThan(0);
    }
  });
});
