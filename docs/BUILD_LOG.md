# Build Log

Record meaningful build-test-observe-adjust loops. Do not duplicate every commit.

## 2026-07-13: Project foundation

### Goal

Create a reproducible, documented foundation for PPC Companion.

### Evidence reviewed

- Project request and known constraints
- Existing repository files when mode is `existing`
- Detected or selected stack: Next.js and TypeScript

### Changes

- Added the standard documentation profile.
- Established the web-app layout guidance.
- Defined test-driven and preservation rules in `AGENTS.md`.

### Validation

- Install: `bun install --frozen-lockfile` — passed
- Lint: `bun run lint` — not run locally (CI only)
- Type check: `npx tsc --noEmit` — **failed** (23 corrupted API route files with escaped quotes)
- Test: `bun run test` — not run locally
- Build: `bun run build` — not run locally

### Next loop

Define the first vertical slice, write the first failing test, and implement the smallest passing behavior.

## 2026-07-14: Dashboard routing fix

### Goal

Fix broken landing page CTAs and add URL-addressable routes for all app sections.

### Changes

- Created `src/app/(app)/` route group with auth guard layout + 10 section pages
- Modified `src/app/page.tsx` (stripped SPA conditional), `src/lib/store.ts` (normalizeRole, pathToSection, sectionToPath), `src/components/layout/app-shell.tsx` (usePathname), `src/components/layout/sidebar.tsx` (next/link), `src/components/sections/landing.tsx` (router.push)

### Result

- Commit `5708866` pushed to `main`
- CI: TypeScript check failed (pre-existing API route corruption)
- Vercel: deployment blocked by CI failure
- Local type check: zero new errors from this patch

### Learning

The entire API route layer (`src/app/api/`) contained pre-existing corruption (double-escaped quotes in 23 files, binary corruption in 1 file). CI had been failing on every commit since at least 2026-07-13.

## 2026-07-14: API route corruption fix

### Goal

Restore CI-green state so Vercel can deploy.

### Changes

- Ran `sed -i 's/\\"/"/g'` on all `.ts` files in `src/app/api/` to unescape quotes
- Restored `src/app/api/students/[id]/activity/route.ts` from commit `0c2050d` (binary corruption)

### Result

- Commit `372e244` pushed to `main`
- CI: TypeScript check still needs verification (pending run)
- Local: `npx tsc --noEmit` passes with zero errors

### Learning

Corruption likely originated from a tool that serialized file contents with JSON escaping. The `activity/route.ts` file had null bytes and 910 non-ASCII characters — classic binary file misread.

## Entry template

### Goal

State the behavior or risk addressed.

### Tests added or changed

List the behavior each test proves.

### Changes

Summarize the smallest implementation change.

### Result

Record commands run and observed outcomes.

### Learning

Capture unexpected behavior or corrected assumptions.

### Next loop

State the next executable step.
