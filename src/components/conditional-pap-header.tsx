"use client";

import { usePathname } from "next/navigation";
import { PapHeader } from "@/components/header";

/**
 * Routes that should NOT show the global Project Amazon PH chrome.
 * The sampler is a public lead-funnel page with its own header; it
 * must not be preceded by the dark legacy bar from the old landing.
 */
const PAP_HEADER_EXCLUDED_ROUTES = ["/sampler"] as const;

export function ConditionalPapHeader() {
  const pathname = usePathname();
  const excluded = PAP_HEADER_EXCLUDED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  if (excluded) return null;
  return <PapHeader />;
}
