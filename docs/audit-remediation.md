# PPC Companion — Audit Remediation

> **Repository:** projectamazonph/ppc-companion
> **Audit commit:** `b03470984e18bdd305983310f553c3f90493686e`
> **Status:** ✅ Phase 1 merged to main (`e6c5831`). Phase 2–4 open for implementation.
> **Last updated:** 2026-07-17

## Executive Summary

The security audit (July 2026) identified **6 P0 (critical)** and **8+ P1 (high)** findings. The application has a strong visual and engineering foundation, but several trust boundaries were decorative rather than enforced.

**Phase 1 — Security freeze** implementation is complete. Four of six P0 issues are fully closed. P0-5 (dual Prisma schemas) is partially addressed. P0-6 (paid-content boundary) is deferred to Phase 3 as it requires product-level decisions beyond code changes.

---

**Merged:** PR [#6](https://github.com/projectamazonph/ppc-companion/pull/6) — 3 commits, all CI green (TypeScript, ESLint, tests, gitleaks, build). 16 CodeRabbit review comments resolved.

---

## Phase 1: Security Freeze (✓ Complete)

### P0-1: Students can unlock every phase themselves

**Fix applied:** `src/app/api/progress/route.ts`

- POST handler now returns `410 Gone` — direct progress mutation is disabled.
- GET handler derives pass states server-side from authoritative quiz attempt records.
- A phase is considered "passed" when all quizzes in that phase have at least one attempt with `passed: true`.
- `capstoneDone` is derived from the capstone project's status being `APPROVED`.
- The deprecated `phase1Pass`–`phase4Pass` and `capstoneDone` columns on `Student` remain in the schema for backward compatibility but are no longer written by this endpoint.

### P0-2: Quiz scores are trusted from the browser

**Fix applied:** `src/app/api/quizzes/attempts/route.ts`

- POST handler now accepts only `studentId`, `quizId`, `answers` (questionId → answer mapping), and `durationSec`.
- Server fetches the quiz with all questions (including `modelAnswer` for MCQ, `acceptableAnswers` for NUMERIC).
- Each answer is graded server-side:
  - **MCQ:** exact match against `modelAnswer` (case-insensitive trimmed comparison).
  - **NUMERIC:** value checked against acceptable range(s) defined in `acceptableAnswers` JSON.
  - **OPEN:** cannot be auto-graded; receives 0 points until instructor manually grades.
- `score`, `total`, `percentage`, and `passed` are all computed server-side, never accepted from the client.
- Submitted question IDs are validated to belong to the quiz.
- Score is constrained to non-negative values and capped at total points.

### P0-3: Students can self-grade exercise submissions

**Fix applied:** `src/app/api/exercises/submissions/route.ts`

- Students can only set their `answer` and status to `DRAFT` or `SUBMITTED`.
- `score`, `feedback`, `gradedAt`, and status `GRADED`/`RETURNED` are restricted to `ADMIN` or `INSTRUCTOR` roles.
- Fixed dead fallback logic: the exercise code resolution now runs *before* returning "Exercise not found."
- Ownership enforcement remains in place.

### P0-4: Instructors have administrator escalation powers

**Fixes applied:**

**`src/app/api/students/route.ts` (POST):**
- Only `ADMIN` callers may set role to `INSTRUCTOR` or `ADMIN`.
- `INSTRUCTOR` callers always create `STUDENT` accounts regardless of `body.role`.

**`src/app/api/students/[id]/route.ts` (PUT):**
- Only `ADMIN` callers may modify the `role` field.
- `INSTRUCTOR` callers silently ignore any `role` in the request body.
- Users cannot change their own role.

**`src/app/api/students/[id]/route.ts` (DELETE):**
- Restricted to `ADMIN` only (`INSTRUCTOR` no longer allowed).
- Replaced hard `delete` with soft delete (sets `deletedAt`).
- Prevents deletion of the last remaining `ADMIN` user.

### P0-5: Two Prisma schemas describe different applications *(Partial — documented)*

The PostgreSQL schema (`schema.prisma`) and SQLite schema (`schema.sqlite.prisma`) continue to diverge in:
- Phase/curriculum relationships
- Quiz question fields
- Capstone storage models
- Progress structures
- Notification fields
- Cohort fields

**Applied:** Added `sessionVersion` field to both schemas for password-change token revocation.

**Remaining:** Full consolidation is Phase 2 work (see below).

### P0-6: Paid-content boundary *(Not addressed — requires product decisions)*

Moving AMPH v2 content server-side requires:
- Private repository or server-only content service
- Enrollment/entitlement records
- Server-side access enforcement
- Sampler/physical separation

This is Phase 3 work and requires product/architectural decisions beyond code changes.

---

## Phase 1 — Additional P1 fixes

### P1-1: Rate limiting bypass for login/signup

**Fix applied:** `src/middleware.ts`

- Restructured middleware so rate limiting runs *before* the public-routes early return.
- Rate limiting now applies to all API routes including login, signup, and logout.

### P1-2: Logout does not clear the authentication cookie

**Fix applied:** `src/app/api/auth/logout/route.ts` (new)

- Added `POST /api/auth/logout` endpoint.
- Clears the `session` cookie by setting `maxAge: 0`.
- Added `/api/auth/logout` to the middleware's public and JWT-exempt route lists.

### P1-3: Password changes do not revoke existing tokens

**Fixes applied:**

- **`prisma/schema.prisma` + `prisma/schema.sqlite.prisma`:** Added `sessionVersion Int @default(0)` to the `Student` model.
- **`src/app/api/auth/login/route.ts` + `src/app/api/auth/signup/route.ts`:** JWT now includes `sessionVersion` from the student record.
- **`src/app/api/auth/change-password/route.ts`:** Increments `sessionVersion` on the student record when password is changed.
- **`src/lib/auth-server.ts`:** `requireAuth`, `requireRole`, and `getAuthUser` now verify the JWT's `sessionVersion` matches the database, rejecting tokens issued before a password change.

---

## Phase 2: Data-Model Consolidation (Planned)

1. Delete `prisma/schema.sqlite.prisma`
2. Standardize local + CI development on PostgreSQL
3. Reconcile grading and capstone fields between schemas
4. Generate a clean baseline migration
5. Add migration and route integration tests

## Phase 3: Product Boundary (Planned)

1. Split sampler content from AMPH v2
2. Move proprietary content server-side or into a private repository
3. Add explicit entitlement and enrollment records
4. Replace localStorage authorization with server session checks
5. Make the backend the sole source of truth for progress

## Phase 4: Release Hardening (Planned)

1. Add Playwright end-to-end tests
2. Add RBAC and negative security tests
3. Remove duplicate Vercel project configuration
4. Replace placeholders and dead links
5. Validate testimonials and structured claims
6. Align metadata, pricing, product positioning, and version numbers

---

## Files Changed (Phase 1)

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `sessionVersion` field |
| `prisma/schema.sqlite.prisma` | Added `sessionVersion` field |
| `src/middleware.ts` | Rate limiting before public-routes skip; added `/api/auth/logout` to exempt lists |
| `src/lib/auth-server.ts` | `sessionVersion` verification; made auth helpers async |
| `src/app/api/progress/route.ts` | POST disabled (410); GET derives from quiz attempts + capstone |
| `src/app/api/quizzes/attempts/route.ts` | Server-side grading; accepts only answers |
| `src/app/api/exercises/submissions/route.ts` | Students cannot set grading fields; fixed code resolution |
| `src/app/api/students/route.ts` | Role creation restricted; instructors forced to STUDENT |
| `src/app/api/students/[id]/route.ts` | Role update restricted; soft delete; last-admin protection |
| `src/app/api/auth/logout/route.ts` | **New** — clears session cookie |
| `src/app/api/auth/login/route.ts` | JWT includes `sessionVersion` |
| `src/app/api/auth/signup/route.ts` | JWT includes `sessionVersion` |
| `src/app/api/auth/change-password/route.ts` | Increments `sessionVersion` |
| `src/app/api/auth/me/route.ts` | Added `await` for async auth helpers |
| `src/app/api/admin/stats/route.ts` | Added `await` for async auth helpers |
| `src/app/api/audit/route.ts` | Added `await` for async auth helpers |
| `src/app/api/capstones/route.ts` | Added `await` for async auth helpers |
| `src/app/api/cohorts/route.ts` | Added `await` for async auth helpers |
| `src/app/api/cohorts/[id]/route.ts` | Added `await` for async auth helpers |
| `src/app/api/curriculum/route.ts` | Added `await` for async auth helpers |
| `src/app/api/notifications/route.ts` | Added `await` for async auth helpers |
| `src/app/api/quizzes/route.ts` | Added `await` for async auth helpers |
| `src/app/api/tags/route.ts` | Added `await` for async auth helpers |
| `src/app/api/students/[id]/activity/route.ts` | Added `await` for async auth helpers |
| `src/app/api/students/[id]/progress/route.ts` | Added `await` for async auth helpers |
| `src/app/api/exercises/submissions/[id]/grade/route.ts` | Added `await` for async auth helpers |
| `docs/audit-remediation.md` | **New** — this document |

---

## Pre-existing Issues Not Addressed

These are known issues flagged by the audit that remain for future phases:

- **Schema divergence:** PostgreSQL and SQLite schemas differ substantially (P0-5, Phase 2)
- **Paid-content boundary:** Course data in client bundle, localStorage access control (P0-6, Phase 3)
- **Capstone sync broken:** Client fields silently discarded; toggle sends wrong state (P1)
- **User APIs return too much info:** `publicUser` strips only password (P1)
- **API errors expose internal details:** `e.message` returned in several routes (P1)
- **Duplicate Vercel projects:** Build conflict between Turbopack and webpack (P1)
- **Product/public-site positioning:** Mixed messaging across layout and landing (P1)
- **Unsupported structured review claims:** JSON-LD with unverified aggregate rating (P1)
- **Public claims need evidence ledger:** Hardcoded testimonials/statistics (P1)
- **Placeholders and dead controls:** picsum.photos images, dead links (P1)
- **Test coverage gaps:** Auth, RBAC, ownership, grading, schema, enrollment tests needed (P1)

---

## Verification

```bash
# TypeScript check
npx tsc --noEmit

# Lint
bun run lint

# Tests
bun test

# Prisma validation (against PostgreSQL schema for production)
npx prisma validate

# Prisma client generation (required after schema changes)
npx prisma generate

# Prisma validation (against SQLite schema for local dev)
npx prisma validate --schema=prisma/schema.sqlite.prisma

# SQLite client generation
npx prisma generate --schema=prisma/schema.sqlite.prisma

# Full DB verification (validates schema + dry-run push)
bun run db:verify
```
