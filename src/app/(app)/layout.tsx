"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, pathToSection } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/shared/error-boundary";

/**
 * Route-group layout for all authenticated app pages.
 *
 * Responsibilities:
 *   1. Auth guard — if no `user` in the persisted Zustand store, redirect to `/`.
 *   2. Hydration safety — render a skeleton until the client store hydrates,
 *      avoiding flicker to the landing page during SSR mismatch.
 *   3. AppShell wrapper — every page inside (app) renders inside the sidebar+topbar chrome.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const setSection = useAppStore((s) => s.setSection);

  // Zustand persist rehydrates after mount. `useSyncExternalStore` reports
  // false on the server / first client render and true once mounted — no
  // effect-driven setState, so it's React Compiler-safe.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // After hydration, enforce the auth guard.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

  // Keep store's `activeSection` in sync with the URL so any consumer reading
  // it from Zustand (e.g. third-party widgets, future server-side code)
  // still sees the correct value.
  useEffect(() => {
    if (!hydrated) return;
    setSection(pathToSection(pathname));
  }, [pathname, hydrated, setSection]);

  // Pre-hydration skeleton — neutral background, no layout shift.
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground tracking-wide">Loading workspace…</p>
        </div>
      </div>
    );
  }

  // Post-hydration, but unauthenticated: render nothing while the redirect fires.
  if (!user) return null;

  return (
    <ErrorBoundary>
      <AppShell>{children}</AppShell>
    </ErrorBoundary>
  );
}