# Fix: Dashboard + Module Routes

**Status:** ✅ Implemented — awaiting deployment
**Branch:** `fix/dashboard-routing`
**Affects:** `src/app/page.tsx`, `src/components/layout/*`, `src/lib/store.ts`, new `src/app/(app)/**`

---

## Problem Statement

The deployed production build at `ppc-companion.vercel.app` ships with only the
landing page (`src/app/page.tsx`). Every CTA — `Start`, `Try as guest`,
`Start learning free`, `Create account`, `Mayroon na akong account` — is a
**no-op** because:

1. There is no `/dashboard` route in the Next.js App Router (visiting `/dashboard`
   returns the `not-found.tsx` 404 boundary).
2. The landing page gates the entire app behind a `user` field in Zustand, but
   the deployed bundle's `handleGuest` click handler doesn't fire — verified via
   browser diagnostic: clicking `Try as guest` with cleared `localStorage` does
   not write to the persisted Zustand key.
3. Even if it did fire, the in-app `AppShell` only renders sections by switching
   on a `state.activeSection` enum. The URLs are all `/`; users cannot
   bookmark or share a section.

The user reported: *"In dashboard click on other pages or modules"*. There is no
clickable surface that leads anywhere — every primary CTA is dead.

---

## Goals

1. Make every CTA on the landing page navigate to a real, working `/dashboard`
   route on click.
2. Promote each of the 10 student-visible sections (`dashboard`, `curriculum`,
   `exercises`, `quizzes`, `tools`, `reference`, `capstone`, `downloads`,
   `notifications`, `myprofile`) to a **real Next.js route** so each is
   URL-addressable, shareable, and reachable via the browser back button.
3. Keep the existing section components untouched — they're already
   `"use client"` and self-contained.
4. Preserve the existing Zustand persist key (`ppc-companion-store`) so user
   progress survives the refactor.

---

## Architecture

### Before (current)

```
src/app/
├── layout.tsx         ← root + PapHeader
├── page.tsx           ← if (!user) <Landing /> else <AppShell>{activeSection branch}</AppShell>
├── not-found.tsx
├── error.tsx
├── api/...
└── projectamazonph/page.tsx
```

Single-page app. All navigation is in-memory via Zustand `activeSection`.

### After

```
src/app/
├── layout.tsx         ← root + PapHeader (unchanged)
├── page.tsx           ← just <Landing /> (auth happens here, then router.push)
├── not-found.tsx      (unchanged)
├── error.tsx          (unchanged)
├── api/...            (unchanged)
├── projectamazonph/page.tsx (unchanged)
│
└── (app)/                       ← new route group — does not affect URLs
    ├── layout.tsx               ← auth guard + AppShell chrome
    ├── dashboard/page.tsx       ← <DashboardSection />
    ├── curriculum/page.tsx
    ├── exercises/page.tsx
    ├── quizzes/page.tsx
    ├── tools/page.tsx
    ├── reference/page.tsx
    ├── capstone/page.tsx
    ├── downloads/page.tsx
    ├── notifications/page.tsx
    └── my-profile/page.tsx      ← (was `myprofile` enum → snake-case URL)
```

The `(app)` directory is a Next.js **route group** (parens) — it does not
appear in the URL, so `src/app/(app)/dashboard/page.tsx` resolves to `/dashboard`
exactly.

### Key flows

**Try as guest** (`landing.tsx` `handleGuest`):
1. `login(user)` — Zustand state now has `user`
2. `router.push("/dashboard")` — navigates to the new route
3. `(app)/layout.tsx` reads `user`, renders `<AppShell><DashboardSection /></AppShell>`

**Sidebar click** (`sidebar.tsx`):
1. `<Link href="/curriculum">` — Next.js client navigation
2. `(app)/layout.tsx` (which already mounted `AppShell`) renders `<CurriculumSection />`

**Auth guard** (`(app)/layout.tsx`):
- Reads `useAppStore(s => s.user)` (already persisted)
- If `user === null` → `redirect("/")` (Next.js server redirect)
- If hydration pending → render a skeleton (don't flicker to landing)

---

## Files Touched

| File | Change |
|---|---|
| `src/lib/store.ts` | Fix `UserRole` casing (lowercase canonical). Add `useActiveSectionFromPath()` helper. Add `navigateToSection(s)` action that calls `router.push`. |
| `src/components/layout/app-shell.tsx` | Remove `activeSection` prop drilling — section now comes from route. Replace `meta.title` lookup from `activeSection` to URL path. |
| `src/components/layout/sidebar.tsx` | Replace `setSection(id)` with `<Link href={`/${id}`}>` for proper routing. Active state from `usePathname()`. |
| `src/components/sections/landing.tsx` | After `login(user)` succeeds (handleSubmit / handleGuest), call `router.push("/dashboard")`. |
| `src/app/page.tsx` | Strip the `user` branch — always render `<LandingPage />`. The (app) layout handles the auth gate. |
| `src/app/(app)/layout.tsx` | **NEW** — auth guard + `<AppShell>{children}</AppShell>`. |
| `src/app/(app)/dashboard/page.tsx` | **NEW** — thin re-export of `DashboardSection`. |
| `src/app/(app)/curriculum/page.tsx` | **NEW** |
| `src/app/(app)/exercises/page.tsx` | **NEW** |
| `src/app/(app)/quizzes/page.tsx` | **NEW** |
| `src/app/(app)/tools/page.tsx` | **NEW** |
| `src/app/(app)/reference/page.tsx` | **NEW** |
| `src/app/(app)/capstone/page.tsx` | **NEW** |
| `src/app/(app)/downloads/page.tsx` | **NEW** |
| `src/app/(app)/notifications/page.tsx` | **NEW** |
| `src/app/(app)/my-profile/page.tsx` | **NEW** |

Total: 4 modified + 11 new files.

---

## Section ID ↔ URL Map

| Zustand `Section` enum | URL path |
|---|---|
| `dashboard` | `/dashboard` |
| `curriculum` | `/curriculum` |
| `exercises` | `/exercises` |
| `quizzes` | `/quizzes` |
| `tools` | `/tools` |
| `reference` | `/reference` |
| `capstone` | `/capstone` |
| `downloads` | `/downloads` |
| `notifications` | `/notifications` |
| `myprofile` | `/my-profile` |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing users with `user.role === "GUEST"` (uppercase) in localStorage break the sidebar | `normalizeRole()` helper on app boot maps `GUEST → guest`, `STUDENT → student`, etc. |
| `myprofile` enum vs `my-profile` URL mismatch | `myprofile` retained in store; `usePathname().replace('/','')` mapping in helper |
| Persisted `activeSection` becomes dead state | Helper maps URL → enum on every page mount, keeps store in sync |
| Hydration mismatch (server doesn't know about Zustand) | `(app)/layout.tsx` is a client component with a `mounted` flag; renders skeleton until `useAppStore` hydrates |
| Old Zustand `user.role === "guest"` lowercase crashes AppShell role colors | Confirm with tests; the existing code already uses lowercase comparisons |
| API routes under `/api/*` still work | Route group `(app)` doesn't affect API routes — they're under `src/app/api/` |

---

## Verification (post-deploy)

1. Reload `ppc-companion.vercel.app/` — landing renders.
2. Click `Try as guest` → URL changes to `/dashboard`, AppShell renders with sidebar.
3. Click sidebar `Curriculum` → URL `/curriculum`, content renders.
4. Click `Exercises` → URL `/exercises`, content renders.
5. Browser **back** → URL `/curriculum`, content renders.
6. Browser **back** again → URL `/dashboard`.
7. Reload `/curriculum` directly → renders curriculum without flicker.
8. Sign out → redirected to `/`.
9. Check localStorage — `user` field persists, `activeSection` updates on each click.
10. Console is clean — no hydration warnings, no 404s.

---

## Rollback

Single revert of the merge commit. The original `src/app/page.tsx` is preserved
verbatim in git history.