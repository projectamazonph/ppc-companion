// ============================================================================
// Sampler → AMPH v2 handoff + privacy-safe event tracking
// ----------------------------------------------------------------------------
// PPC Companion never shares AMPH v2's auth, DB, or payment. It only routes
// learners to a public AMPH v2 comparison page with measurable, non-PII params.
// ============================================================================

import type { SamplerEvent } from "@/lib/sampler-data";

// ---------------------------------------------------------------------------
// Config (documented in .env.example)
// ---------------------------------------------------------------------------

const AMPH_APP_URL = process.env.NEXT_PUBLIC_AMPH_APP_URL ?? "https://amph.projectamazonph.com";
const AMPH_COMPARE_PATH = process.env.NEXT_PUBLIC_AMPH_COMPARE_PATH ?? "/course-comparison";
const SAMPLER_CAMPAIGN = process.env.NEXT_PUBLIC_AMPH_SAMPLER_CAMPAIGN ?? "va-ppc-starter";

export type AmphComparisonParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  samplerStep?: string;
  variant?: string;
};

/**
 * Build the measurable AMPH v2 handoff URL.
 * Always sends learners to the comparison/course page — never straight to
 * checkout. Params are non-PII: source, medium, campaign, step, optional variant.
 */
export function buildAmphHandoffUrl(opts: AmphComparisonParams = {}): string {
  const url = new URL(AMPH_APP_URL);
  url.pathname = AMPH_COMPARE_PATH.replace(/^\/+/, "") ? `/${AMPH_COMPARE_PATH.replace(/^\/+/, "")}` : url.pathname;
  const params = new URLSearchParams(url.search);
  params.set("source", opts.source ?? "ppc-companion");
  params.set("medium", opts.medium ?? "sampler");
  params.set("campaign", opts.campaign ?? SAMPLER_CAMPAIGN);
  if (opts.samplerStep) params.set("sampler_step", opts.samplerStep);
  if (opts.variant) params.set("variant", opts.variant);
  url.search = params.toString();
  return url.toString();
}

// ---------------------------------------------------------------------------
// Anonymous session id (privacy-safe) — no PII, no PPC answer text stored
// ---------------------------------------------------------------------------

const SESSION_KEY = "ppc_sampler_session";

export function getSamplerSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ---------------------------------------------------------------------------
// Event tracking — only the 6 events required to judge sampler usefulness.
// No PPC answer text is ever sent to analytics.
// ---------------------------------------------------------------------------

type TrackPayload = {
  event: SamplerEvent;
  step?: string;
  // Optional, non-PII context only. Never include free-text answers.
  meta?: Record<string, string | number>;
};

export async function trackSamplerEvent(payload: TrackPayload): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/sampler/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: payload.event,
        step: payload.step,
        sessionId: getSamplerSessionId(),
        meta: payload.meta ?? {},
      }),
      // Analytics must not block the student experience.
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Tracking failures must never break the sampler.
  }
}
