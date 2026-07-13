# Error Log

Record significant failures, root causes, regression tests, and prevention. Do not use this as a raw console dump.

## ERR-001: All landing page CTAs dead (no-op)

**Date:** 2026-07-14  
**Impact:** delivery — entire app unreachable from marketing page

#### Symptom

Clicking "Try as guest", "Start learning free", "Create account", or "Mayroon na akong account" on the landing page had no effect. URL stayed at `/`. No navigation, no modal, no state change.

#### Reproduction

1. Visit `https://ppc-companion.vercel.app/`
2. Click "Try as guest"
3. Observe: URL unchanged, landing page still showing

#### Root cause

The entire app was a single-page architecture gated behind a Zustand `user` field in `src/app/page.tsx`. No `/dashboard` route existed in the Next.js App Router. The landing page's `handleGuest` was technically correct but there was no destination.

#### Fix

Created `src/app/(app)/` route group with auth guard layout + 10 section pages. Modified `landing.tsx` to call `router.push("/dashboard")` after login/guest.

#### Regression test

Not yet automated. Manual verification: click "Try as guest" → URL changes to `/dashboard` → AppShell renders.

#### Prevention

Add a CI integration test that verifies the auth→dashboard navigation flow. Never ship CTAs without reachable destinations.

---

## ERR-002: CI TypeScript check failure (pre-existing corruption)

**Date:** 2026-07-14  
**Impact:** delivery — Vercel deployment blocked for 11+ days

#### Symptom

GitHub Actions CI fails at TypeScript check on every commit. 23 API route files produce `error TS1127: Invalid character`.

#### Reproduction

Push any commit to `main`. CI run fails at "TypeScript check" step.

#### Root cause

All 23 files in `src/app/api/` had double-escaped quotes (`\"` instead of `"`), likely from a tool that serialized file contents as JSON. One file (`activity/route.ts`) also had null bytes and 910 non-ASCII characters.

#### Fix

Ran `sed -i 's/\\"/"/g'` on all `.ts` files in `src/app/api/`. Restored `activity/route.ts` from commit `0c2050d`.

#### Regression test

`npx tsc --noEmit` passes with zero errors after fix.

#### Prevention

Add a CI step that checks for binary-corrupted source files. Validate file encoding before commit.

---

## ERR-003: Vercel deployment blocked by stale CI status

**Date:** 2026-07-14  
**Impact:** delivery — production site serves 11-day-old code

#### Symptom

`curl -I https://ppc-companion.vercel.app/dashboard` returns 404. Response headers show `age: 981550` (stale). Vercel deployment status: failure.

#### Reproduction

Check Vercel deployment status or response headers for age.

#### Root cause

Vercel blocked deployment because GitHub CI status was `failure`. Vercel's protection rules prevent deploying from a failing commit.

#### Fix

Fixed CI corruption (ERR-002) and pushed to `main`. Pending Vercel redeployment.

#### Regression test

Check Vercel deployment status after push: should be `success`.

#### Prevention

Configure Vercel to deploy independently of GitHub CI status, or ensure CI is green before pushing.

## Entry template

### ERR-NNN: Short description

**Date:** YYYY-MM-DD  
**Impact:** user, data, security, delivery, or operations

#### Symptom

Describe the observable failure.

#### Reproduction

Provide the smallest deterministic reproduction.

#### Root cause

Explain why the system allowed the failure, not only which line threw an error.

#### Fix

Describe the corrective change.

#### Regression test

Name the test that fails before the fix and passes afterward.

#### Prevention

Record the rule, guardrail, monitor, or design change that reduces recurrence.
