// ============================================================================
// POST /api/sampler/event — privacy-safe sampler analytics
// ----------------------------------------------------------------------------
// Records ONLY the six whitelisted sampler events with an anonymous session id
// and non-PII numeric/enum metadata. It NEVER stores free-text PPC answers,
// names, emails, or account data. If no analytics sink is configured, it is a
// safe no-op that still returns 204 so the client flow never breaks.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EVENTS = new Set([
  "sampler_started",
  "sampler_step_completed",
  "sampler_triage_submitted",
  "sampler_completed",
  "academy_cta_viewed",
  "academy_cta_clicked",
]);

const ALLOWED_STEPS = new Set([
  "see-the-work",
  "check-listing",
  "make-decision",
  "career-path",
]);

// Only primitive, non-PII meta values are accepted, and keys are whitelisted.
const ALLOWED_META_KEYS = new Set(["score", "maxScore", "variant", "tier", "durationMs"]);

function sanitizeMeta(input: unknown): Record<string, string | number> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_META_KEYS.has(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "string" && v.length <= 40) out[k] = v;
  }
  return out;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { event, step, sessionId, meta } = (body ?? {}) as Record<string, unknown>;

  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "unknown event" }, { status: 400 });
  }
  if (step !== undefined && (typeof step !== "string" || !ALLOWED_STEPS.has(step))) {
    return NextResponse.json({ error: "unknown step" }, { status: 400 });
  }

  const record = {
    event,
    step: typeof step === "string" ? step : undefined,
    // Anonymous session id, truncated defensively. Never a user identifier.
    sessionId: typeof sessionId === "string" ? sessionId.slice(0, 64) : "anon",
    meta: sanitizeMeta(meta),
    at: new Date().toISOString(),
  };

  // Analytics sink is optional. When unset, this is a deliberate no-op so the
  // sampler works in any environment without leaking data anywhere.
  if (process.env.SAMPLER_ANALYTICS_DEBUG === "1") {
    console.info("[sampler-event]", JSON.stringify(record));
  }

  return new NextResponse(null, { status: 204 });
}
