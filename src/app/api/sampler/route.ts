// ============================================================================
// GET /api/sampler — sampler-only metadata
// ----------------------------------------------------------------------------
// Returns ONLY the PPC Companion sampler contract. It intentionally does NOT
// surface course phases, modules, unlock logic, or Academy internals. This
// keeps the sampler experience decoupled from the legacy four-phase course
// and from the Academy's auth/DB/payment systems.
// ============================================================================

import { NextResponse } from "next/server";
import {
  samplerMeta,
  SAMPLER_STEPS,
  DIAGNOSTIC_FRAMEWORK,
  ESCALATION_CARD,
  ACADEMY_TIERS,
  PREVIEW_MODULES,
  CAREER_PATHS,
} from "@/lib/sampler-data";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    meta: samplerMeta,
    steps: SAMPLER_STEPS,
    diagnosticFramework: DIAGNOSTIC_FRAMEWORK,
    escalationCard: ESCALATION_CARD,
    academyTiers: ACADEMY_TIERS,
    previewModules: PREVIEW_MODULES,
    careerPaths: CAREER_PATHS,
    // Deliberately NOT included: course phases, module unlock state,
    // Academy auth, pricing secrets, or payment links.
  });
}
