# Handoff: Next Revision Phases

> **Branch:** `main` (post Phase 1 merge, commit `e6c5831`)
> **Created:** 2026-07-17
> **Prior docs:** `docs/audit-remediation.md` (Phase 1 complete, Phase 2–4 planned)

---

## What was done (Phase 1 — merged)

All critical security fixes are live on `main`. See `docs/audit-remediation.md` for the full breakdown. Summary:

- Progress is derived server-side from quiz attempts and capstone status (no client mutation)
- Quiz answers graded server-side against question bank
- Exercise grading fields restricted to instructors/admins
- Role management locked to ADMIN only; soft delete; last-admin protected
- Logout clears session cookie; rate limiting applies to all API routes
- sessionVersion enforces token revocation on password change
- Auth rejects deleted sessions and fails closed on DB errors

---

## Phase 2: Data-Model Consolidation

**Goal:** One canonical Prisma schema. Both local dev and production use PostgreSQL.

### 2a. Reconcile the two schemas

The PostgreSQL schema (`prisma/schema.prisma`) and SQLite schema (`prisma/schema.sqlite.prisma`) diverge on many models. The codebase is written against the PostgreSQL schema (e.g. `module.phase`, `exercise` relation on submissions, `actionUrl` on Notification).

**Tasks:**
1. Audit every model/field in `schema.sqlite.prisma` against `schema.prisma`
2. Identify fields present in PostgreSQL but missing from SQLite (and vice versa)
3. Add missing fields/relations to the SQLite schema, or remove the SQLite schema entirely
4. Run `bun run db:verify` on both schemas
5. Run `npx prisma generate` on both schemas and confirm zero new TypeScript errors

### 2b. Standardize on PostgreSQL for all environments

**Tasks:**
1. Update `.env.example` to use a PostgreSQL `DATABASE_URL` as the default
2. Update CI (`ci.yml`) to spin up a PostgreSQL service container (or use a managed DB)
3. Delete `prisma/schema.sqlite.prisma` once all environments use PostgreSQL
4. Add a migration baseline: `bun run db:migrate:create` to generate an initial migration
5. Update seed scripts to work with PostgreSQL
6. Document the database setup in `AGENTS.md` or `CLAUDE.md`

### 2c. Add migration and route integration tests

**Tasks:**
1. Write a test that runs `prisma migrate deploy` against a clean PostgreSQL database
2. Write route-level integration tests for auth, progress, quiz grading, and submissions
3. Wire into CI so migration tests run on every PR

---

## Phase 3: Product Boundary

**Goal:** AMPH v2 content is not exposed through the client bundle or localStorage.

### 3a. Content separation

**Tasks:**
1. Identify all curriculum/course data imported directly into client components
2. Move proprietary content to a server-only content service or private repository
3. The sampler content (free, public) stays in this repo
4. Create an explicit content manifest listing what is public vs. private

### 3b. Server-side access enforcement

**Tasks:**
1. Add `entitlement` or `enrollment` records to the database schema
2. Create authenticated server endpoints that return only authorized module content
3. Replace the Zustand/localStorage access check in the app layout with a server session check
4. Remove the "free signup unlocks all modules" messaging from the client

### 3c. Sampler separation

**Tasks:**
1. Make the sampler route (`/sampler`) fully independent from the course view
2. Ensure sampler state (`sampler-store`) does not import or reference AMPH v2 data
3. Add a clear boundary comment in the codebase separating sampler from curriculum

---

## Phase 4: Release Hardening

**Goal:** Production-ready for real student enrollment and certification.

### 4a. Testing

**Tasks:**
1. Add Playwright end-to-end tests for: signup, login, quiz flow, exercise submission, capstone
2. Add RBAC negative tests: student cannot access admin routes, instructor cannot promote, etc.
3. Add ownership tests: student A cannot view student B's data
4. Add grading tests: quiz auto-grade, instructor manual grade, grade persistence

### 4b. Infrastructure cleanup

**Tasks:**
1. Delete or disconnect the duplicate Vercel project (`ppc-companion-new2`)
2. Ensure `next.config.ts` build command is `next build --webpack` (not Turbopack)
3. Remove all picsum.photos placeholder images
4. Replace dead social/blog/privacy/terms links with real pages or remove them
5. Fix mobile navigation buttons

### 4c. Product compliance

**Tasks:**
1. Remove the unsupported JSON-LD aggregate rating (4.9/127 reviews) unless verified
2. Add an evidence ledger for all measurable claims (500+ VAs, ₱50M ad spend, etc.)
3. Align global layout messaging with the landing page (sampler vs. full platform)
4. Remove PapHeader links to `/interviews` and `/resume` if those routes don't exist
5. Add terms of service and privacy policy pages

### 4d. Observability

**Tasks:**
1. Add structured logging (not just `console.error`)
2. Add error monitoring (e.g. Sentry integration)
3. Add analytics for key events: signup, quiz attempt, exercise submission
4. Set up uptime monitoring for `/api/health`

---

## Priority Order

| Phase | Effort | Risk if skipped |
|-------|--------|-----------------|
| **Phase 2** | Medium | Schema drift causes silent data bugs in production |
| **Phase 3** | High | AMPH v2 content leaks; intellectual property exposure |
| **Phase 4** | Medium | No blocking risk but required before paid enrollment |

**Recommended next step:** Start with Phase 2b (standardize PostgreSQL) since it unblocks Phase 2a and Phase 2c, and is a prerequisite for reliable CI.

---

## How to pick this up

1. Create a new branch from `main`: `git checkout -b feat/phase2-schema-consolidation`
2. Read `docs/audit-remediation.md` for Phase 2 details
3. Read this handoff for the full task list
4. Start with Phase 2b — it has the smallest blast radius and highest leverage
5. Open a PR with CI validation for each phase
