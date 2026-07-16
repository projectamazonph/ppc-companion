// ============================================================================
// SamplerView — the PPC Companion → AMPH v2 sampler experience
// ----------------------------------------------------------------------------
// A focused, mobile-first flow (4 steps + completion). It is NOT the legacy
// four-phase course. Sampler completion is tracked separately in the store and
// never presented as course/cohort completion.
// ============================================================================

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  samplerMeta,
  SAMPLER_STEPS,
  DIAGNOSTIC_FRAMEWORK,
  ESCALATION_CARD,
  TRIAGE_SCENARIO,
  AMPH_TIERS,
  PREVIEW_MODULES,
  gradeTriage,
  type SamplerStepId,
  type DiagnosticAnswer,
} from "@/lib/sampler-data";
import { buildAmphHandoffUrl, trackSamplerEvent } from "@/lib/sampler-tracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Compass,
  ListChecks,
  MagnifyingGlass as Search,
  Path as Route,
  ArrowRight,
  ArrowLeft,
  CheckCircle as CheckCircle2,
  Warning as AlertTriangle,
  ShieldCheck as ShieldCheck2,
  Sparkle as Sparkles,
  Download as DownloadIcon,
  ArrowSquareOut as ExternalLink,
} from "@phosphor-icons/react";

const STEP_ICONS = {
  "see-the-work": Compass,
  "check-listing": ListChecks,
  "make-decision": Search,
  "career-path": Route,
} as const;

const STEP_ORDER: SamplerStepId[] = [
  "see-the-work",
  "check-listing",
  "make-decision",
  "career-path",
];

export function SamplerView() {
  const samplerStepResults = useAppStore((s) => s.samplerStepResults);
  const markSamplerStarted = useAppStore((s) => s.markSamplerStarted);
  const completeSamplerStep = useAppStore((s) => s.completeSamplerStep);
  const completeSampler = useAppStore((s) => s.completeSampler);
  const getSamplerProgress = useAppStore((s) => s.getSamplerProgress);

  const [activeStep, setActiveStep] = useState<SamplerStepId>("see-the-work");
  const startedRef = useRef(false);

  const progress = getSamplerProgress();
  const isDone = progress.done || !!useAppStore.getState().samplerCompletedAt;

  // Fire sampler_started once.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    markSamplerStarted();
    trackSamplerEvent({ event: "sampler_started", step: activeStep });
  }, [markSamplerStarted, activeStep]);

  const markStepComplete = (step: SamplerStepId, score?: number) => {
    completeSamplerStep(step, score);
    trackSamplerEvent({ event: "sampler_step_completed", step });
  };

  const goToStep = (step: SamplerStepId) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(activeStep);
    markStepComplete(activeStep);
    if (idx < STEP_ORDER.length - 1) {
      goToStep(STEP_ORDER[idx + 1]);
    } else {
      completeSampler();
      trackSamplerEvent({ event: "sampler_completed" });
      goToStep("career-path");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <SamplerHeader progress={progress} />

      {/* Step progress rail */}
      <div className="mb-6 flex gap-2" aria-hidden>
        {STEP_ORDER.map((id, i) => {
          const stepMeta = SAMPLER_STEPS.find((s) => s.id === id)!;
          const done = !!samplerStepResults[id];
          const current = activeStep === id;
          return (
            <button
              key={id}
              onClick={() => goToStep(id)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                done ? "bg-emerald-500" : current ? "bg-orange-500" : "bg-muted"
              )}
              aria-label={`Step ${i + 1}: ${stepMeta.title}`}
            />
          );
        })}
      </div>

      {activeStep === "see-the-work" && (
        <SeeTheWork onNext={goNext} onCompleteStep={() => markStepComplete("see-the-work")} />
      )}
      {activeStep === "check-listing" && (
        <CheckListing
          onNext={goNext}
          onBack={() => goToStep("see-the-work")}
          onCompleteStep={() => markStepComplete("check-listing")}
        />
      )}
      {activeStep === "make-decision" && (
        <MakeDecision
          onNext={goNext}
          onBack={() => goToStep("check-listing")}
          onCompleteStep={(score) => markStepComplete("make-decision", score)}
        />
      )}
      {activeStep === "career-path" && (
        <CareerPath
          onBack={() => goToStep("make-decision")}
          samplerScore={
            samplerStepResults["make-decision"]?.score ?? null
          }
        />
      )}
    </div>
  );
}

// =============================================================
// Header
// =============================================================

function SamplerHeader({ progress }: { progress: { completed: number; total: number } }) {
  return (
    <header className="mb-6">
      <Badge variant="secondary" className="mb-3 bg-orange-500/10 text-orange-600 border-0">
        Free sampler · ~45–75 min
      </Badge>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {samplerMeta.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        {samplerMeta.tagline}
      </p>
      <p className="mt-3 rounded-lg border border-dashed border-orange-300/60 bg-orange-50/50 px-3 py-2 text-xs text-orange-800/90 dark:border-orange-500/30 dark:bg-orange-500/5 dark:text-orange-300/90">
        {samplerMeta.disclaimer}
      </p>
      <div className="mt-3 text-xs text-muted-foreground">
        Step {Math.min(progress.completed + 1, progress.total)} of {progress.total}
      </div>
    </header>
  );
}

// =============================================================
// Step 1 — See the work
// =============================================================

function SeeTheWork({
  onNext,
  onCompleteStep,
}: {
  onNext: () => void;
  onCompleteStep: () => void;
}) {
  const [answered, setAnswered] = useState<string | null>(null);
  const correct = "conversion";
  const step = SAMPLER_STEPS[0];

  return (
    <Card>
      <CardHeader>
        <StepEyebrow index={1} title={step.title} subtitle={step.subtitle} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-sm leading-relaxed text-foreground/90">
            Amazon ads (the ad side of <strong>Amazon Advertising</strong>) is one
            channel inside a much bigger store. Before you touch a single bid, a
            real PPC (pay-per-click) specialist checks three different kinds of
            problems — because a bid change cannot fix the wrong kind.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            <li>
              <span className="font-semibold">Traffic problem</span> — too few
              people see or click the ad. (Keywords, targeting, bids.)
            </li>
            <li>
              <span className="font-semibold">Conversion problem</span> — people
              click but don&apos;t buy. (Listing, price, reviews, images.)
            </li>
            <li>
              <span className="font-semibold">Retail-readiness problem</span> —
              the product can&apos;t be bought even with traffic. (Out of stock,
              no Buy Box, price broken.)
            </li>
          </ul>

          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-semibold">{DIAGNOSTIC_FRAMEWORK.title}</p>
            <ul className="mt-2 space-y-1 text-xs text-foreground/80">
              {DIAGNOSTIC_FRAMEWORK.questions.map((item) => (
                <li key={item.q}>
                  <span className="font-medium text-foreground">{item.q}</span>{" "}
                  <span className="text-muted-foreground">— {item.why}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">
            Quick check: A shopper clicks your ad, likes the price, but the page
            has only 2 reviews and blurry photos. They leave without buying.
            What is the <em>first</em> thing to check?
          </p>
          <div className="mt-3 grid gap-2">
            {["traffic", "conversion", "retail-readiness"].map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                  answered === opt
                    ? answered === correct
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                    : "border-border hover:bg-accent"
                )}
              >
                <input
                  type="radio"
                  name="first-check"
                  value={opt}
                  checked={answered === opt}
                  onChange={() => setAnswered(opt)}
                  className="accent-orange-500"
                />
                <span className="capitalize">{opt.replace("-", " ")}</span>
              </label>
            ))}
          </div>
          {answered && (
            <p
              className={cn(
                "mt-3 text-xs font-medium",
                answered === correct ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {answered === correct
                ? "Correct. The listing (conversion) is the blocker — fixing the page beats raising a bid."
                : "Not quite. The shopper reached the page and liked the price, so traffic is fine. The page itself failed to convert."}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              onCompleteStep();
              onNext();
            }}
          >
            Next: Check the listing <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Step 2 — Check the listing (retail-readiness scorecard)
// =============================================================

const LISTING_FIELDS = [
  { key: "stock", label: "In stock", fail: "Out of stock" },
  { key: "buybox", label: "Buy Box owned", fail: "Losing the Buy Box" },
  { key: "price", label: "Price competitive", fail: "Price above market" },
  { key: "reviews", label: "Review signal ok", fail: "Too few / low reviews" },
  { key: "images", label: "Images clear", fail: "Blurry / missing images" },
  { key: "title", label: "Title clear", fail: "Title vague" },
  { key: "bullets", label: "Bullets clear", fail: "Bullets weak" },
] as const;

function CheckListing({
  onNext,
  onBack,
  onCompleteStep,
}: {
  onNext: () => void;
  onBack: () => void;
  onCompleteStep: () => void;
}) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState<"yes" | "no" | "">("");
  const flagged = LISTING_FIELDS.filter((f) => flags[f.key]);

  return (
    <Card>
      <CardHeader>
        <StepEyebrow index={2} title={SAMPLER_STEPS[1].title} subtitle={SAMPLER_STEPS[1].subtitle} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mark every item that looks <strong>weak or broken</strong> on the mock
          product page below. Then decide if this product is ready to advertise.
        </p>

        <div className="rounded-lg border border-blue-300/50 bg-blue-50/40 p-3 text-xs dark:border-blue-500/30 dark:bg-blue-500/5">
          <p className="font-semibold text-blue-900 dark:text-blue-200">
            {ESCALATION_CARD.title}
          </p>
          <p className="mt-1 text-blue-900/80 dark:text-blue-200/80">
            {ESCALATION_CARD.rule}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mock product page
          </p>
          <p className="mt-1 text-sm font-medium">Bamboo Cutlery Set (16-pc)</p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {LISTING_FIELDS.map((f) => (
              <label
                key={f.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors",
                  flags[f.key]
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-500/10"
                    : "border-border hover:bg-accent"
                )}
              >
                <input
                  type="checkbox"
                  checked={!!flags[f.key]}
                  onChange={() =>
                    setFlags((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                  }
                  className="accent-rose-500"
                />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium">Is this product ready to advertise?</p>
          <div className="mt-2 flex gap-2">
            {(["yes", "no"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setReady(v)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm capitalize transition-colors",
                  ready === v
                    ? v === "no"
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-border hover:bg-accent"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {ready === "no" && flagged.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              You said &quot;no&quot; — pick at least one weak item that explains why.
            </p>
          )}
        </div>

        {flagged.length > 0 && (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50/50 p-3 dark:border-amber-500/30 dark:bg-amber-500/5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" /> Escalation note (your VA artifact)
            </p>
            <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
              Flagged: {flagged.map((f) => f.fail).join("; ")}. These are{" "}
              <strong>not bid problems</strong> — escalate to the listing owner
              before spending on ads.
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] text-amber-900/70 dark:text-amber-200/70">
              {ESCALATION_CARD.decisionTree.map((d, i) => (
                <li key={i}>• {d}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <Button
            disabled={flagged.length === 0 || ready === ""}
            onClick={() => {
              onCompleteStep();
              onNext();
            }}
          >
            Next: Make one PPC decision <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
// Step 3 — Make one safe PPC decision (triage)
// =============================================================

function MakeDecision({
  onNext,
  onBack,
  onCompleteStep,
}: {
  onNext: () => void;
  onBack: () => void;
  onCompleteStep: (score: number) => void;
}) {
  const scenario = TRIAGE_SCENARIO;
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allDecided = scenario.searchTerms.every((t) => decisions[t.id] && rationales[t.id]);
  const canSubmit = allDecided;

  const submit = () => {
    const answers: DiagnosticAnswer[] = scenario.searchTerms.map((t) => ({
      termId: t.id,
      decision: decisions[t.id] as DiagnosticAnswer["decision"],
      rationaleId: rationales[t.id],
    }));
    const { score, maxScore } = gradeTriage(answers, "", scenario);
    setSubmitted(true);
    onCompleteStep(score);
    trackSamplerEvent({
      event: "sampler_triage_submitted",
      step: "make-decision",
      meta: { score, maxScore },
    });
  };

  return (
    <Card>
      <CardHeader>
        <StepEyebrow index={3} title={SAMPLER_STEPS[2].title} subtitle={SAMPLER_STEPS[2].subtitle} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-semibold">{scenario.context}</p>
          <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            <li>Stage: <span className="text-foreground">{scenario.productStage}</span></li>
            <li>Target ACoS: <span className="text-foreground">{scenario.targetAcos}%</span></li>
            <li>Expected CVR: <span className="text-foreground">{scenario.expectedCvr}%</span></li>
                        <li>Guardrail: <span className="text-foreground">{scenario.guardrail}</span></li>
          </ul>
          <p className="mt-2 text-xs italic text-muted-foreground">
            Manager note: {scenario.managerInstruction}
          </p>
        </div>

        <div className="space-y-3">
          {scenario.searchTerms.map((t) => (
            <div key={t.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">&quot;{t.term}&quot;</p>
                  <p className="text-xs text-muted-foreground">
                    {t.clicks} clicks · {t.orders} orders · {t.acos}% ACoS
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t.relevance}
                </Badge>
              </div>
              {!submitted ? (
                <>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["keep", "investigate", "negate", "escalate"].map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          setDecisions((p) => ({ ...p, [t.id]: d }))
                        }
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
                          decisions[t.id] === d
                            ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground">Why? Pick the best reason:</p>
                    <div className="mt-1.5 space-y-1">
                      {t.rationaleOptions.map((r) => (
                        <label
                          key={r.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                            rationales[t.id] === r.id
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                              : "border-border hover:bg-accent"
                          )}
                        >
                          <input
                            type="radio"
                            name={`rationale-${t.id}`}
                            value={r.id}
                            checked={rationales[t.id] === r.id}
                            onChange={() =>
                              setRationales((p) => ({ ...p, [t.id]: r.id }))
                            }
                            className="mt-0.5 accent-orange-500"
                          />
                          <span>{r.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <TriageFeedback term={t} chosen={decisions[t.id] as never} rationaleId={rationales[t.id]} />
              )}
            </div>
          ))}
        </div>

        {submitted && (
          <TriageResult decisions={decisions} rationales={rationales} scenario={scenario} />
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} disabled={submitted}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          {!submitted ? (
            <Button disabled={!canSubmit} onClick={submit}>
              Submit decision <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onNext}>
              See your career path <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TriageFeedback({
  term,
  chosen,
  rationaleId,
}: {
  term: (typeof TRIAGE_SCENARIO.searchTerms)[number];
  chosen: "keep" | "investigate" | "negate" | "escalate";
  rationaleId?: string;
}) {
  const expected = term.expectedDecision;
  const ok = chosen === expected;
  const rationaleOk = term.rationaleOptions.find((r) => r.id === rationaleId)?.correct ?? false;
  return (
    <div className="mt-2 space-y-1">
      <p
        className={cn(
          "text-xs font-medium",
          ok ? "text-emerald-600" : "text-amber-600"
        )}
      >
        {ok ? "✓ Good call." : `Expected action: ${expected}.`} {term.feedback}
      </p>
      <p
        className={cn(
          "text-xs font-medium",
          rationaleOk ? "text-emerald-600" : "text-amber-600"
        )}
      >
        {rationaleOk ? "✓ Reasoning correct." : "Reasoning: see the correct rationale above."}
      </p>
    </div>
  );
}

function TriageResult({
  decisions,
  rationales,
  scenario,
}: {
  decisions: Record<string, string>;
  rationales: Record<string, string>;
  scenario: typeof TRIAGE_SCENARIO;
}) {
  const answers: DiagnosticAnswer[] = scenario.searchTerms.map((t) => ({
    termId: t.id,
    decision: decisions[t.id] as DiagnosticAnswer["decision"],
    rationaleId: rationales[t.id],
  }));
  const { score, maxScore, breakdown } = gradeTriage(answers, "", scenario);
  return (
    <div className="rounded-lg border border-emerald-300/60 bg-emerald-50/50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/5">
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        Score: {score}/{maxScore}
      </p>
      <ul className="mt-2 space-y-1 text-xs text-emerald-900/80 dark:text-emerald-200/80">
        {breakdown.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs italic text-muted-foreground">
        Fully auto-scored — no submission review needed.
      </p>
    </div>
  );
}

// =============================================================
// Step 4 — Career path + AMPH v2 handoff
// =============================================================

function CareerPath({
  onBack,
  samplerScore,
}: {
  onBack: () => void;
  samplerScore: number | null;
}) {
  const ctaViewedRef = useRef(false);
  const amphUrl = useMemo(() => buildAmphHandoffUrl({ samplerStep: "career-path" }), []);

  useEffect(() => {
    if (ctaViewedRef.current) return;
    ctaViewedRef.current = true;
    trackSamplerEvent({ event: "amph_cta_viewed", step: "career-path" });
  }, []);

  const recommended =
    samplerScore !== null && samplerScore >= 15
      ? AMPH_TIERS[1]
      : samplerScore !== null && samplerScore >= 10
      ? AMPH_TIERS[2]
      : AMPH_TIERS[2];

  const onCtaClick = (intent: string) => {
    trackSamplerEvent({
      event: "amph_cta_clicked",
      step: "career-path",
      meta: { intent },
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <StepEyebrow index={4} title={SAMPLER_STEPS[3].title} subtitle={SAMPLER_STEPS[3].subtitle} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-300/60 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> You practiced
            </p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-900/80 dark:text-emerald-200/80">
              <li>• A retail-readiness check → an escalation note</li>
              <li>• One safe, evidence-based search-term decision</li>
              <li>• Professional escalation when a listing (not a bid) is the blocker</li>
            </ul>
            {samplerScore !== null && (
              <p className="mt-2 text-xs text-muted-foreground">
                Triage score: {samplerScore}/20. This shows you tried the work — it is
                not a certificate and does not equal AMPH v2 completion.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Gaps still to learn (in AMPH v2):</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PREVIEW_MODULES.map((m) => (
                <Badge key={m.title} variant="secondary" className="bg-muted text-muted-foreground">
                  {m.title}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Which AMPH v2 tier fits your goal?</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {AMPH_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    tier.id === recommended.id
                      ? "border-orange-500 bg-orange-50/60 dark:bg-orange-500/5"
                      : "border-border"
                  )}
                >
                  {tier.id === recommended.id && (
                    <Badge className="mb-1.5 bg-orange-500 text-white">Recommended</Badge>
                  )}
                  <p className="font-semibold">{tier.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tier.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AMPH v2 handoff CTA — routes to comparison page, not checkout */}
          <div className="rounded-xl border-2 border-orange-400/50 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:from-orange-500/10 dark:to-amber-500/5">
            <p className="flex items-center gap-1.5 text-sm font-bold text-orange-800 dark:text-orange-300">
              <Sparkles className="h-4 w-4" /> Continue in AMPH v2
            </p>
            <p className="mt-1 text-xs text-orange-900/80 dark:text-orange-200/80">
              The sampler is a try-it preview. The full curriculum, simulators,
              assessment, and credentials live in AMPH v2.
            </p>
            <a
              href={amphUrl}
              onClick={() => onCtaClick("course-comparison")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              Compare AMPH v2 courses <ExternalLink className="h-4 w-4" />
            </a>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMPH_TIERS.map((tier) => (
                <a
                  key={tier.id}
                  href={buildAmphHandoffUrl({ samplerStep: "career-path", variant: tier.id })}
                  onClick={() => onCtaClick(tier.id)}
                  className="text-xs font-medium text-orange-700 underline-offset-2 hover:underline dark:text-orange-300"
                >
                  {tier.name} →
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <DownloadIcon className="h-3.5 w-3.5" /> First PPC Decision Sheet (PDF)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================
// Shared bits
// =============================================================

function StepEyebrow({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  const Icon = STEP_ICONS[SAMPLER_STEPS[index - 1].id];
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
          Step {index}
        </p>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{subtitle}</CardDescription>
      </div>
    </div>
  );
}
