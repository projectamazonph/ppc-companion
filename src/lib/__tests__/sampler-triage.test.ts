import { describe, it, expect } from "vitest";
import { gradeTriage, TRIAGE_SCENARIO, type DiagnosticAnswer } from "@/lib/sampler-data";

// =============================================================
// gradeTriage — scoring rules
//   - 4 safe decisions each score a base weight (none are "wrong")
//   - matching the *expected* decision adds a correctness point
//   - reasoning note is judged on evidence + safe-action language (max 2)
// =============================================================

const allExpected = (): DiagnosticAnswer[] =>
  TRIAGE_SCENARIO.searchTerms.map((t) => ({
    termId: t.id,
    decision: t.expectedDecision,
  }));

describe("gradeTriage", () => {
  it("awards full score when every expected decision is chosen with a strong note", () => {
    const { score, maxScore } = gradeTriage(
      allExpected(),
      "0 orders means the term is irrelevant; I will flag for negation with manager approval.",
      TRIAGE_SCENARIO
    );
    expect(maxScore).toBe(14); // 4 terms × 3 + 2 reasoning
    expect(score).toBe(maxScore);
  });

  it("still scores for SAFE-but-unexpected decisions (no decision is unsafe)", () => {
    // All 'keep' — a safe action. The first term's expected decision IS 'keep',
    // so it earns the match bonus; the rest earn the base safe-action weight.
    const safeOnly: DiagnosticAnswer[] = TRIAGE_SCENARIO.searchTerms.map((t) => ({
      termId: t.id,
      decision: "keep",
    }));
    const { score, maxScore } = gradeTriage(safeOnly, "keep everything for now", TRIAGE_SCENARIO);
    expect(maxScore).toBe(14);
    // 1 term matches expected (3) + 3 terms base (2×3) + reasoning 1 (safe "keep") = 10
    expect(score).toBe(10);
  });

  it("penalizes missing decisions and awards zero for an empty answer set", () => {
    const { score, maxScore } = gradeTriage([], "", TRIAGE_SCENARIO);
    expect(maxScore).toBe(14);
    expect(score).toBe(0);
  });

  it("rewards evidence language in the reasoning note", () => {
    const { score } = gradeTriage(
      allExpected(),
      "the term has zero orders so it is irrelevant",
      TRIAGE_SCENARIO
    );
    // 4×3 (expected) + reasoning 1 (evidence only: "irrelevant"/"zero orders")
    expect(score).toBe(13);
  });

  it("returns a human-readable breakdown per term", () => {
    const { breakdown } = gradeTriage(allExpected(), "escalate to manager", TRIAGE_SCENARIO);
    expect(breakdown.length).toBe(TRIAGE_SCENARIO.searchTerms.length + 1);
    expect(breakdown.some((b) => b.includes("expected"))).toBe(true);
  });
});
