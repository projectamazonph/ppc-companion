// ============================================================================
// PPC Companion → Project Amazon PH Academy Sampler — Content Source
// ----------------------------------------------------------------------------
// This file is the EXCLUSIVE source of public sampler content.
//
// Guardrails (from the migration plan):
//   - Do NOT copy the Academy's full lessons here.
//   - Keep each concept to a single focused step.
//   - Define every acronym before relying on it.
//   - No claim of job placement, income, account access, or campaign results.
//   - The sampler must work without Seller Central, a client account, or
//     prior PPC knowledge.
//
// PPC Companion is a SHORT SAMPLER, not a second PPC course. The
// Project Amazon PH Academy remains the source of truth for the full
// curriculum, simulators, assessment, progression, credentials, and
// enrollment.
// ============================================================================

// =============================================================
// CROSS-REPOSITORY CONTENT CONTRACT (metadata only — not a runtime dep)
// =============================================================

export type SamplerConceptKey =
  | "amazon-ads-basics"
  | "listing-readiness"
  | "search-term-triage";

export type SamplerContentReference = {
  conceptKey: SamplerConceptKey;
  academySource: string; // Canonical Academy lesson or tool slug
  samplerPurpose: string; // What the student may learn here
  reviewDate: string; // ISO date — re-verify claim currency
  owner: "Project Amazon PH";
};

export const samplerContentReferences: SamplerContentReference[] = [
  {
    conceptKey: "amazon-ads-basics",
    academySource: "ppc-foundations/amazon-ecosystem",
    samplerPurpose: "Orient a new VA to what Amazon ads actually are in a real workflow.",
    reviewDate: "2026-07-16",
    owner: "Project Amazon PH",
  },
  {
    conceptKey: "listing-readiness",
    academySource: "listing-audit-simulator",
    samplerPurpose: "Teach the retail-readiness check before any ad spend is proposed.",
    reviewDate: "2026-07-16",
    owner: "Project Amazon PH",
  },
  {
    conceptKey: "search-term-triage",
    academySource: "search-term-triage",
    samplerPurpose: "Let a VA make ONE safe PPC decision and explain the reasoning.",
    reviewDate: "2026-07-16",
    owner: "Project Amazon PH",
  },
];

// =============================================================
// EVENT TYPES (privacy-respecting, anonymous until registration)
// =============================================================

export type SamplerEvent =
  | "sampler_started"
  | "sampler_step_completed"
  | "sampler_triage_submitted"
  | "sampler_completed"
  | "academy_cta_viewed"
  | "academy_cta_clicked";

// =============================================================
// SAMPLER STEPS
// =============================================================

export type SamplerStepId =
  | "see-the-work"
  | "check-listing"
  | "make-decision"
  | "career-path";

export type SamplerStep = {
  id: SamplerStepId;
  number: number;
  title: string;
  subtitle: string;
  minutes: number;
  artifactLabel: string;
  // The Academy tier + what it covers that this sampler does NOT.
  academyHandoff: { tier: string; preview: string };
};

export const SAMPLER_STEPS: SamplerStep[] = [
  {
    id: "see-the-work",
    number: 1,
    title: "See the work",
    subtitle:
      "What an Amazon PPC (pay-per-click) VA actually does — and the three problems to tell apart.",
    minutes: 8,
    artifactLabel: "Identify the first thing to check in a mock account",
    academyHandoff: {
      tier: "PPC Foundations",
      preview:
        "The Academy's Foundations covers the full Amazon ecosystem, every ad type, and metrics in depth.",
    },
  },
  {
    id: "check-listing",
    number: 2,
    title: "Check the listing",
    subtitle:
      "A mini retail-readiness scorecard. Produce a short, three-item escalation note.",
    minutes: 15,
    artifactLabel: "Produce a three-item escalation note",
    academyHandoff: {
      tier: "Listing Audit simulator",
      preview:
        "The Academy's Listing Audit simulator scores a full listing — this sampler only gives you the checklist mindset.",
    },
  },
  {
    id: "make-decision",
    number: 3,
    title: "Make one safe PPC decision",
    subtitle:
      "A context-aware search-term triage case. Choose keep, investigate, negate, or escalate — and explain why.",
    minutes: 20,
    artifactLabel: "Decision + evidence and a manager-ready note",
    academyHandoff: {
      tier: "Search Term Triage & Bid Elevator",
      preview:
        "The Academy teaches the full optimization loop with many cases — this sampler has one curated case.",
    },
  },
  {
    id: "career-path",
    number: 4,
    title: "See the career path",
    subtitle:
      "What you practiced, the gaps left to learn, and which Academy tier fits your goal.",
    minutes: 12,
    artifactLabel: "Personal action plan and course comparison",
    academyHandoff: {
      tier: "Pricing & enrollment",
      preview:
        "The Academy handles sign-up, payment, progression, and certificates. PPC Companion never stores these.",
    },
  },
];

export const samplerMeta = {
  id: "ppc-companion-sampler",
  title: "Amazon PPC — Simula Dito",
  tagline:
    "Kumuha ng iyong unang hakbang sa Amazon PPC — guided, walang-pressure, at walang prior experience kinakailangan.",
  audience: "Filipino aspiring Virtual Assistants new to Amazon PPC",
  durationMinutes: SAMPLER_STEPS.reduce((s, step) => s + step.minutes, 0),
  isSampler: true as const,
  competitorWithAcademy: false as const,
  disclaimer:
    "This is a free sampler. It does not enroll you, grant certificates, or give account access. The full curriculum, simulators, and credentials are in the Project Amazon PH Academy.",
  promisedOutcome:
    "One credible VA artifact: a short, evidence-based escalation note you can put on a resume.",
};

// =============================================================
// NEW SAMPLER CONTENT — Diagnostic mini-framework
// =============================================================

export const DIAGNOSTIC_FRAMEWORK = {
  title: "PPC Diagnostic Mini-Framework",
  questions: [
    {
      q: "Is the product ready to advertise?",
      why: "Stock, Buy Box, price, and listing health come before any bid.",
    },
    {
      q: "Is the ad getting relevant traffic?",
      why: "Wrong search terms waste spend even with a perfect listing.",
    },
    {
      q: "Is the traffic converting?",
      why: "Clicks without orders usually point to the listing, not the bid.",
    },
    {
      q: "Is spend within the agreed guardrail?",
      why: "As a VA you never exceed the budget or ACoS your manager set.",
    },
    {
      q: "What can a VA safely do, document, or escalate?",
      why: "Keep, investigate, negate (manager-approved), or escalate — never silent risky edits.",
    },
  ],
} as const;

// =============================================================
// NEW SAMPLER CONTENT — Listing-to-PPC escalation card
// =============================================================

export const ESCALATION_CARD = {
  title: "Listing-to-PPC Escalation Card",
  rule: "If the blocker is the listing, inventory, price, or Buy Box, it is NOT a bid problem. Escalate — do not raise bids to fix a page.",
  decisionTree: [
    "Out of stock or no Buy Box? → Escalate to inventory/account owner. Ads will underperform regardless of bids.",
    "Price above market or weak reviews? → Escalate to listing owner. Traffic can't fix a weak offer.",
    "Ad gets clicks but no orders? → Check relevance + listing, then escalate if the page is the cause.",
    "Ad gets no relevant clicks? → That may be a targeting/bid question — propose, don't edit.",
  ],
  handoffNoteTemplate:
    "Escalation note: [Product] is not ready to advertise because [reason]. Recommended owner: [listing/inventory/account]. I did not change any bid or budget.",
} as const;

// =============================================================
// STEP 3 — Context-aware triage scenario (multiple terms)
// =============================================================

export type TriageDecision = "keep" | "investigate" | "negate" | "escalate";

export type DiagnosticAnswer = {
  termId: string;
  decision: TriageDecision;
  rationaleId?: string;
};

export type TriageRationaleOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type TriageSearchTerm = {
  id: string;
  term: string;
  clicks: number;
  orders: number;
  acos: string;
  relevance: "relevant" | "borderline" | "irrelevant";
  expectedDecision: TriageDecision;
  feedback: string;
  // Multiple-choice rationale so the exercise needs no manual review.
  rationaleOptions: TriageRationaleOption[];
  expectedRationaleId: string;
};

export type TriageScenario = {
  context: string;
  productStage: string;
  targetAcos: string;
  expectedCvr: string;
  guardrail: string;
  managerInstruction: string;
  searchTerms: TriageSearchTerm[];
};

export const TRIAGE_SCENARIO: TriageScenario = {
  context:
    "Bamboo Cutlery Set (16-pc) is launching. You are a VA reviewing the Search Term Report. You may NOT change any bid or budget.",
  productStage: "Launching (first 30 days)",
  targetAcos: "Up to ~45%",
  expectedCvr: "~9%",
  guardrail:
    "Never raise/lower bids or change budgets. Safe actions only: keep, investigate, negate (manager approves), escalate.",
  managerInstruction:
    "Review each term. Pick the safe action and write a one-line reason. Flag anything that is not a bid problem.",
  searchTerms: [
    {
      id: "t1",
      term: "bamboo cutlery set",
      clicks: 42,
      orders: 5,
      acos: "31%",
      relevance: "relevant",
      expectedDecision: "keep",
      feedback:
        "Relevant and converting under target ACoS — keep watching. No reason to touch it.",
      rationaleOptions: [
        { id: "r1a", text: "It's relevant and converting under target ACoS, so there's no reason to touch it yet.", correct: true },
        { id: "r1b", text: "It has the most clicks, so I should raise its bid to get even more.", correct: false },
        { id: "r1c", text: "Any term with orders should be negated to protect the budget.", correct: false },
      ],
      expectedRationaleId: "r1a",
    },
    {
      id: "t2",
      term: "wooden spoon",
      clicks: 19,
      orders: 0,
      acos: "—",
      relevance: "irrelevant",
      expectedDecision: "negate",
      feedback:
        "Zero orders and off-topic. As a VA you propose it as a negative (escalate for approval) rather than silently editing.",
      rationaleOptions: [
        { id: "r2a", text: "It's off-topic with zero orders, so propose it as a negative (escalate for approval), not a silent edit.", correct: true },
        { id: "r2b", text: "It has fewer clicks than the others, so I'll raise its bid to fix it.", correct: false },
        { id: "r2c", text: "Low volume means I should keep it running to gather more data.", correct: false },
      ],
      expectedRationaleId: "r2a",
    },
    {
      id: "t3",
      term: "reusable utensils travel",
      clicks: 27,
      orders: 1,
      acos: "58%",
      relevance: "borderline",
      expectedDecision: "investigate",
      feedback:
        "Borderline relevance, above target ACoS. Pull more data before deciding — do not panic-negate a possibly good term.",
      rationaleOptions: [
        { id: "r3a", text: "Borderline relevance and above target ACoS, so I'll pull more data before deciding — not panic-negate.", correct: true },
        { id: "r3b", text: "Any term above target ACoS should be negated immediately.", correct: false },
        { id: "r3c", text: "One order means it's converting, so I'll raise the bid now.", correct: false },
      ],
      expectedRationaleId: "r3a",
    },
    {
      id: "t4",
      term: "bamboo cutlery set bulk wholesale",
      clicks: 8,
      orders: 0,
      acos: "—",
      relevance: "relevant",
      expectedDecision: "escalate",
      feedback:
        "Relevant but very low volume with 0 orders in launch — escalate to the manager: this may be a B2B/wholesale intent worth a separate campaign, not a quick negate.",
      rationaleOptions: [
        { id: "r4a", text: "Relevant but very low volume with 0 orders in launch — escalate as possible B2B/wholesale intent, not a quick negate.", correct: true },
        { id: "r4b", text: "Zero orders means I should negate it right away.", correct: false },
        { id: "r4c", text: "It's relevant, so I'll keep it and raise the bid to force conversions.", correct: false },
      ],
      expectedRationaleId: "r4a",
    },
  ],
};

// =============================================================
// SCORING — rewards reasoning, not just the button
// =============================================================

const DECISION_WEIGHT: Record<TriageDecision, number> = {
  keep: 2,
  investigate: 2,
  negate: 2,
  escalate: 2,
};

const MAX_PER_TERM = 3; // 2 for decision + 1 if matches expected

export const TRIAGE_MAX_SCORE_PER_TERM = MAX_PER_TERM + 1; // 3 decision + 1 rationale = 4

/**
 * Maximum score for the bundled TRIAGE_SCENARIO.
 * Computed from the scenario so adding/removing terms doesn't desync the UI.
 */
export const TRIAGE_MAX_SCORE = TRIAGE_MAX_SCORE_PER_TERM * TRIAGE_SCENARIO.searchTerms.length;

/**
 * Grade a triage submission. Fully multiple-choice, no free text to review.
 *  - Each term: up to 2 points for a safe, defensible decision + 1 point if it
 *    matches the expected decision (so reasoning that differs but is justified
 *    still scores).
 *  - Rationale: +1 if the chosen multiple-choice rationale is correct.
 * Max score scales with the number of terms (4 terms × 4 = 16 for the default scenario).
 */
export function gradeTriage(
  answers: DiagnosticAnswer[],
  _reason: string,
  scenario: TriageScenario
): { score: number; maxScore: number; breakdown: string[] } {
  const expected = new Map(scenario.searchTerms.map((t) => [t.id, t.expectedDecision]));
  const rationaleById = new Map(
    scenario.searchTerms.flatMap((t) => t.rationaleOptions.map((r) => [r.id, r]))
  );
  const breakdown: string[] = [];
  let score = 0;
  let maxScore = 0;

  for (const t of scenario.searchTerms) {
    const ans = answers.find((a) => a.termId === t.id)?.decision;
    maxScore += MAX_PER_TERM;
    // Multiple-choice rationale (no free text) counts toward max regardless.
    maxScore += 1;
    if (!ans) {
      breakdown.push(`• "${t.term}": no decision selected.`);
      breakdown.push(`  ↳ Rationale: not selected — 0/1.`);
      continue;
    }
    // Any of the 4 safe actions scores the base weight; matching expected adds 1.
    let termScore = DECISION_WEIGHT[ans];
    if (expected.get(t.id) === ans) termScore += 1;
    score += termScore;
    breakdown.push(
      `• "${t.term}": ${ans}${expected.get(t.id) === ans ? " (expected)" : ""} — ${termScore}/${MAX_PER_TERM}.`
    );

    const chosen = answers.find((a) => a.termId === t.id)?.rationaleId;
    const r = chosen ? rationaleById.get(chosen) : undefined;
    if (r?.correct) {
      score += 1;
      breakdown.push(`  ↳ Rationale correct — +1.`);
    } else {
      breakdown.push(`  ↳ Rationale: ${r?.correct ? "correct" : "not selected / incorrect"} — 0/1.`);
    }
  }

  return { score, maxScore, breakdown };
}

// =============================================================
// STEP 4 — Career paths + Project Amazon PH Academy tiers
// =============================================================

export type AcademyTier = {
  id: string;
  name: string;
  summary: string;
  fits: string;
};

export const ACADEMY_TIERS: AcademyTier[] = [
  {
    id: "foundations",
    name: "PPC Foundations",
    summary: "Full Amazon ecosystem + PPC basics for total beginners.",
    fits: "New to PPC, want the fundamentals done right.",
  },
  {
    id: "accelerated",
    name: "Accelerated Mastery",
    summary: "Hands-on simulators + faster results for career-switchers.",
    fits: "Want simulators and a quicker path to real tasks.",
  },
  {
    id: "transformation",
    name: "Ultimate Transformation",
    summary: "Complete career track with mentorship and credentials.",
    fits: "Want the full program, support, and a certificate.",
  },
];

export const CAREER_PATHS = [
  {
    practiced: "Retail-readiness check → escalation note",
    gap: "Full listing optimization lessons",
  },
  {
    practiced: "One evidence-based search-term decision",
    gap: "Search Term Triage + Bid Elevator modules",
  },
  {
    practiced: "Professional escalation (no silent risky edits)",
    gap: "Client communication + campaign building",
  },
] as const;

// Modules the sampler only PREVIEWS (locked in the Academy).
export const PREVIEW_MODULES = [
  { title: "Unit economics", note: "Calculate true profit per order." },
  { title: "Campaign building", note: "Structure Sponsored Products campaigns." },
  { title: "Sponsored Brands", note: "Build video & headline ads." },
  { title: "Sponsored Display", note: "Retargeting & audience ads." },
  { title: "Reporting", note: "Read full PPC reports." },
  { title: "Client communication", note: "Write weekly client updates." },
] as const;

// The single retained worksheet (plan: keep "First PPC Decision Sheet" only).
export const samplerWorksheet = {
  id: "first-ppc-decision-sheet",
  title: "First PPC Decision Sheet",
  description: "Fill this in as you complete the sampler. One page, resume-friendly.",
  fields: [
    "The product I checked and its biggest readiness risk",
    "My three-item escalation note (listing → inventory → price/Buy Box)",
    "The search term I reviewed and the safe action I chose",
    "The one-line reason a manager would accept",
    "Which Academy tier I will look at next",
  ],
} as const;
