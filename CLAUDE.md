# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Amazon PPC Manager — Companion App: a Next.js 16 training platform for an 8–12 week Amazon PPC course. Students work through a 4-phase curriculum (course-view, exercises, quizzes, capstone project); instructors/admins get cohort management, grading, and analytics. See `AGENTS.md` for the canonical stack/conventions summary and `docs/decisions.md` for ADRs behind the major choices below.

## Commands

```bash
# Install & env
bun install
cp .env.example .env          # set JWT_SECRET and DATABASE_URL

# Database (see "Two Prisma schemas" below before running these)
bunx prisma generate           # or: bun run db:generate
bun run db:push                # push schema, no migration (dev)
bun run db:migrate:create      # create a migration, don't apply
bun run db:migrate             # prisma migrate dev
bun run db:migrate:prod        # prisma migrate deploy (production)
bun run db:seed                # scripts/seed-full.ts
bun run db:seed-students       # scripts/seed-students.ts (minimal/admin bootstrap)
bun run db:verify              # prisma validate + dry-run push — run before committing schema changes

# Dev server
bun run dev                    # next dev -p 3000, tees to dev.log

# Tests
bun run test                   # vitest run (all tests)
bun run test:watch             # vitest watch mode
bun run test:coverage          # vitest run --coverage
npx vitest run path/to/file.test.ts             # single file
npx vitest run -t "test name substring"         # single test by name

# Lint / typecheck / build
bun run lint                   # eslint .
npx tsc --noEmit               # typecheck (not wired to a package.json script; CI runs it directly)
bun run build                  # prisma generate && next build --webpack && copy static/public into standalone output
```

CI (`.github/workflows/ci.yml`) runs, in order: `tsc --noEmit`, `eslint .`, `vitest run`, a gitleaks secret scan, then `npm run build`. Match this locally before pushing.

## Two Prisma schemas — read before touching the database

`prisma/schema.prisma` is the **source of truth and defaults to `provider = "postgresql"`** (what Vercel/production uses). `prisma/schema.sqlite.prisma` is a parallel copy for local SQLite dev. To develop locally against SQLite you must copy `schema.sqlite.prisma` over `schema.prisma` (see comments in `.env.example`) — `DATABASE_URL="file:./db/custom.db"` alone is not enough if `schema.prisma` still says `postgresql`. Whichever schema you edit, keep both files in sync manually; there's no generation step between them. Run `bun run db:verify` before committing any schema change.

The Prisma model for a person is **`Student`** (not `User`) — it's the row for students, instructors, and admins alike, distinguished by `role: Role` (`STUDENT | INSTRUCTOR | ADMIN`). Some older docs (`README.md`, `docs/architecture.md`) still say "User" — that's stale, follow `prisma/schema.prisma`.

Schema conventions to follow when extending it: every model gets `createdAt`/`updatedAt`; recoverable entities get a nullable `deletedAt` (soft delete, never hard-delete these); every FK has an explicit `onDelete` (tightly-owned children like submissions/comments/progress cascade, cohorts/tags restrict); index every FK and every commonly-filtered column; use enums for fixed-value fields.

## Auth & middleware — two JWT libraries, on purpose

- `src/middleware.ts` runs on the Edge runtime and verifies JWTs with **`jose`** (edge-compatible). It also does CSRF checks (Origin/Referer validation for cookie-authenticated mutating requests; `Authorization: Bearer` bypasses CSRF) and rate limiting, gated on `/api/:path*` only.
- `src/lib/auth-server.ts` runs in route handlers (Node runtime) and verifies JWTs with **`jsonwebtoken`**. API routes call `requireAuth(req)` / `requireRole(req, ...roles)` and check `isErrorResponse(result)` to narrow between an `AuthUser` and a `NextResponse` error — this is the pattern used across all of `src/app/api/**/route.ts`.
- Tokens live in an HttpOnly `session` cookie or an `Authorization: Bearer` header; middleware and `auth-server.ts` both check the header first, cookie second.
- `JWT_EXEMPT_ROUTES` in `middleware.ts` and the `requireAuth`/`requireRole` calls inside each route are two independent gates — adding a new public API route requires updating both `publicRoutes`/`JWT_EXEMPT_ROUTES` in `middleware.ts` *and* not calling `requireAuth`/`requireRole` in the handler.

Rate limiting has two implementations: `src/middleware.ts` has its own in-memory `Map`-based limiter (per Edge instance, resets on redeploy), while `src/lib/rate-limit.ts` is a separate, more durable `node:sqlite`-backed limiter (survives restarts, falls back to in-memory if `node:sqlite` is unavailable). Check which one a given code path actually uses before assuming persistence — the middleware currently does **not** import `rate-limit.ts`.

## Routing & rendering model

Routes are real Next.js App Router files under `src/app/(app)/*/page.tsx`, but each page is a thin wrapper that renders one component from `src/components/sections/` (e.g. `dashboard/page.tsx` → `<DashboardSection />`). The route-group layout `src/app/(app)/layout.tsx` is a client component that: waits for Zustand's `persist` middleware to hydrate (via `useSyncExternalStore`, not an effect, to stay React-Compiler-safe), redirects to `/` if there's no `user` in the store, syncs the URL pathname into the store's `activeSection` via `pathToSection`, and wraps children in `AppShell` + `ErrorBoundary`. `docs/architecture.md` describes an older single-page "section routing" model from `page.tsx` — that has been superseded by this per-route-file structure; don't rely on that doc for current routing.

Client state (`src/lib/store.ts`, Zustand + `persist` to localStorage) is the source of truth for the logged-in user's own view (exercise answers, quiz results, capstone checklist, active section/module/phase). `src/lib/sync.ts` fire-and-forgets that same activity to the backend (resolving human-readable codes like exercise `"1.1A"` or quiz `"phase1-checkpoint"` to DB IDs, with an in-memory cache) so instructors see it — sync failures are swallowed silently by design, since localStorage remains authoritative for the student's own session.

## API route conventions

Every route in `src/app/api/**/route.ts` follows the same shape: call `requireAuth`/`requireRole` first and return early via `isErrorResponse`, do manual validation of the request body (no schema library is used for this despite `zod` being a dependency — check the specific route before assuming zod is wired in), wrap the Prisma call in try/catch logging `[METHOD /api/path] error:` and returning `{ error, detail }` with an appropriate status, and strip `password` off any `Student` record before returning it (`publicStudent()` — defined ad hoc in some routes and reusably in `src/lib/db-queries/index.ts`; prefer the shared one for new code).

## Design system

shadcn/ui config is in `components.json` (`style: "new-york"`, Tailwind v4, `baseColor: "neutral"`, no prefix). Recent history (`git log`) shows an active migration to a custom "Field Manual" design system driven by references in `stitch-designs/` (static HTML mockups) — several sections have been rewritten to plain Tailwind classes matching those mockups instead of shadcn primitives. When touching a section component, check whether `stitch-designs/` has a corresponding mockup and match its structure/classes rather than reintroducing shadcn components that were deliberately removed.

## Testing

Vitest + jsdom + Testing Library (`vitest.config.ts`, setup in `src/test/setup.ts`). Test files live next to source as `*.test.ts(x)` or under `__tests__/` (e.g. `src/lib/__tests__/store.test.ts`). There's no e2e layer and no `tsc` script wired into `package.json` — CI invokes `npx tsc --noEmit` directly, do the same locally.

## Known inconsistencies worth checking before relying on docs

- ESLint (`eslint.config.mjs`) explicitly turns **off** `no-explicit-any`, `no-unused-vars`, and most other strictness rules, despite `AGENTS.md` saying "no `any` unless absolutely required." `tsconfig.json` has `strict: true` but also `noImplicitAny: false`. Follow what the configs actually enforce, not the prose.
- `docs/architecture.md`'s route tree (`/(student)/`, `/(instructor)/`, `/(admin)/` with a `User` model) does not match the current `src/app/(app)/` structure or the `Student` Prisma model — treat that doc as historical context, not current fact.
- Root-level docs (`DEV-PLAN.md`, `KANBAN.md`, `PRD.md`, `WORKLOG.md`, `docs/BUILD_LOG.md`, `docs/LOOP_LOG.md`, `docs/ENGINEERING_DIARY.md`, etc.) are working logs from iterative/loop-driven development sessions, not specs — useful for history, not for current-state truth.
