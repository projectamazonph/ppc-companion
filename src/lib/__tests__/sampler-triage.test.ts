import { describe, it, expect } from "vitest";
import { gradeTriage, TRIAGE_SCENARIO, type DiagnosticAnswer } from "@/lib/sampler-data";

// =============================================================
// gradeTriage — scoring rules (fully multiple-choice, no free text)
//   - 4 safe decisions each score a base weight (none are "wrong")
//   - matching the *expected* decision adds a correctness point
//   - the multiple-choice rationale adds 1 point when correct
//   - max = 4 terms × (2 + 1) + 4 × 1 rationale = 20
// =============================================================

const allExpected = (): DiagnosticAnswer[] =>
  TRIAGE_SCENARIO.searchTerms.map((t) => ({
    termId: t.id,
    decision: t.expectedDecision,
    rationaleId: t.expectedRationaleId,
  }));

describe("gradeTriage", () => {
  it("awards full score when every expected decision + rationale is chosen", () => {
    const { score, maxScore } = gradeTriage(allExpected(), "", TRIAGE_SCENARIO);
    expect(maxScore).toBe(16); // 4 terms × 3 + 4 rationale
    expect(score).toBe(maxScore);
  });

  it("still scores for SAFE-but-unexpected decisions (no decision is unsafe)", () => {
    // All 'keep' — a safe action. The first term's expected decision IS 'keep',
    // so it earns the match bonus; the rest earn base weight.
    const safeOnly: DiagnosticAnswer[] = TRIAGE_SCENARIO.searchTerms.map((t) => ({
      termId: t.id,
      decision: "keep",
      rationaleId: t.rationaleOptions[0].id,
    }));
    const { score, maxScore } = gradeTriage(safeOnly, "", TRIAGE_SCENARIO);
    expect(maxScore).toBe(16);
    // term1: 3 (expected) +1 rationale = 4; terms2-4: 2 base +1 rationale = 3 each → 4+9 = 13
    expect(score).toBe(13);
  });

  it("penalizes missing decisions/rationales and awards zero for an empty answer set", () => {
    const { score, maxScore } = gradeTriage([], "", TRIAGE_SCENARIO);
    expect(maxScore).toBe(16);
    expect(score).toBe(0);
  });

  it("awards no rationale point when the chosen rationale is incorrect", () => {
    const wrongRationale: DiagnosticAnswer[] = TRIAGE_SCENARIO.searchTerms.map((t) => {
      const wrong = t.rationaleOptions.find((r) => !r.correct)!;
      return { termId: t.id, decision: t.expectedDecision, rationaleId: wrong.id };
    });
    const { score } = gradeTriage(wrongRationale, "", TRIAGE_SCENARIO);
    // 4×3 (expected) + 0 rationale
    expect(score).toBe(12);
  });

  it("returns a human-readable breakdown per term plus rationale lines", () => {
    const { breakdown } = gradeTriage(allExpected(), "", TRIAGE_SCENARIO);
    // 4 decision lines + 4 rationale lines
    expect(breakdown.length).toBe(TRIAGE_SCENARIO.searchTerms.length * 2);
    expect(breakdown.some((b) => b.includes("expected"))).toBe(true);
    expect(breakdown.some((b) => b.includes("Rationale correct"))).toBe(true);
  });
});
