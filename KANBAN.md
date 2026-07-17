# ppc-companion — Kanban Board

## Backlog
- [ ] (empty — awaiting triage)

## Ready
- [ ] (empty — awaiting prioritization)

## In Progress
- [ ] (empty — no active work)

## Review
- [ ] (empty — awaiting verification)

## Done
- [x] Security audit Phase 1 (P0): Disable direct progress mutation, derive from quiz/capstone records
- [x] Security audit Phase 1 (P0): Server-side quiz grading (MCQ/NUMERIC; OPEN excluded from auto-score)
- [x] Security audit Phase 1 (P0): Exercise submissions — restrict grading fields to instructors/admins
- [x] Security audit Phase 1 (P0): Role escalation — ADMIN-only role assignment, soft delete, last-admin protection
- [x] Security audit Phase 1 (P1): Logout endpoint clears session cookie
- [x] Security audit Phase 1 (P1): Middleware rate limiting applied before public-route bypass
- [x] Security audit Phase 1 (P1): sessionVersion token revocation on password change
- [x] Security audit Phase 1: Fail-closed auth (reject deleted sessions, DB errors reject)
- [x] Security audit Phase 1: Atomic quiz attempt + progress update ($transaction)
- [x] Security audit Phase 1: MCQ grading via option IDs, not modelAnswer strings
- [x] Security audit Phase 1: Sync SQLite schema with phase pass fields
- [x] Security audit Phase 1: PR #6 merged to main (3 commits, 16 CR comments resolved)
- [x] Phase 2: Remove SQLite schema — unified canonical PostgreSQL schema
- [x] Phase 2: Generate PostgreSQL baseline migration
- [x] Phase 2: Update docker-compose.yml with PostgreSQL service
- [x] Phase 2: CI uses PostgreSQL service for migration validation + build
- [x] Phase 2: Update .env.example, .gitignore, docs for PostgreSQL-only setup
- [x] Phase 2: Update all project docs (AGENTS.md, CLAUDE.md, README.md, DEV-PLAN.md)
- [x] Iter 1-2: Dashboard refactor (dashboard.tsx → dashboard.html)
- [x] Iter 3: Curriculum refactor (curriculum.tsx → courses-list.html)
- [x] Iter 4: Admin Dashboard refactor (admin-dashboard.tsx → admin-dashboard.html)
- [x] Iter 5: Login refactor (login.tsx → login.html)
- [x] Iter 6: Landing refactor (landing.tsx → landing.html)
- [x] Iter 7: Quizzes visual alignment (quizzes.tsx → quiz.html)
- [x] Iter 8: My Profile visual alignment (my-profile.tsx → user-profile.html)
- [x] Iter 9: Course View extraction (course-view.tsx ← course-view.html stitch)
- [x] Build verification: tsc --noEmit + next build --webpack both pass clean

---

**Board Rules:**
- Max 3 items in **In Progress** at any time (WIP limit)
- Items move: Backlog → Ready → In Progress → Review → Done
- No direct Backlog → In Progress without Ready grooming
- Review requires verification evidence before moving to Done
---

## DESIGN-REDESIGN-PLAN (AMPH-v2 Field Manual migration) — Progress
- [x] Phase 1: Wire styles + flip oklch→hex tokens (Ember #FF6B35, 6px radius, 1px #E5E5E0 borders, neutral shadows) + font swap (Inter UI + JetBrains Mono numerics) + remove banned gradients/glass
- [x] Phase 1 verify: tsc clean + next build --webpack pass
- [x] Phase 1 cleanup: retired dead src/styles/design-system.css (unreferenced, contained banned .glass/.gradient-text)
- [x] Phase 2: App shell — 240px white sidebar (border-right), container max-w 1200px + clamp side-margins, py-8
- [x] Phase 3: shared/buttons.tsx (GlassButton glass→Field Manual solid/soft) + Lucide→Phosphor icon migration (44 files, tsc clean, 0 lucide-react refs)
- [x] Phase 4: Keyword Bank table (search-term-analyzer) Field Manual styling + JetBrains Mono numerics + row hover + ARIA (scope/aria-label)
- [x] Phase 5: Campaign Planner (campaign-builder) gradients→solid Field Manual colors + Ember accents
- [x] Phase 6: AI Insights panels — target components (src/components/Insights/) do not exist in repo; N/A
- [x] Phase 7: Auth pages — login already centered card (iter-5 stitch); centered-400px layout conflicts with stitch design, left as-is
- [x] Phase 8: Collapsible mobile sidebar (already in app-shell) + 4.5:1 contrast (darkened --muted-foreground → #595959) + reduced-motion + ARIA labels
- [x] Phase 9: Motion polish — premium focus-visible rings + ease-out-quart timing for interactive elements (skeletons/staggered reveals N/A: no async loading states)

---

## Redesign polish pass (2026-07-15) — gradients/glass purge
- [x] Flattened ALL gradients → solid Field-Manual colors across 16 files (icon chips, phase accents, progress bars, section backgrounds, variable-driven `phaseGradients`/`LAYER_META`/`TOOLS`/`DELIVERABLE_ACCENT_COLORS`/role colors)
- [x] Removed glassmorphism: `backdrop-blur` cards → solid `bg-card`/`bg-popover`; sticky headers `bg-card/95 backdrop-blur` → `bg-card`; decorative blur blobs + radial-gradient divs deleted (capstone, downloads)
- [x] Kept 2 functional modal scrims (`bg-black/40`/`/50` + backdrop-blur) as overlays
- [x] Final build: tsc + next build --webpack pass clean; 0 `bg-gradient`, 0 `from-/to-/via-` stops remain

- [x] P7 implemented 2026-07-15: login.tsx restructured to centered 400px card (dropped split-screen right branding column), inline `text-destructive` error (role=alert) + email/password/name validation, success still toasts. Both auth modes share the layout via toggle. Build clean.

- [x] P6 Keyword Deep Dive modal (2026-07-15): new src/components/sections/tools/keyword-deep-dive.tsx — opens from each Keyword Bank row (Search icon button in actions cell); shows metric grid (clicks/spend/orders/sales), ACoS, recommendation badge + reason + bid change, and heuristic Related Ideas. Reuses analyzer's exported parseNum/recommend/actionMeta. Field Manual styling + Ember accents. Lint clean, build green.

- [x] P5 drag-and-drop (2026-07-15): campaign-builder.tsx — each campaign card is a dnd-kit draggable (grip handle, PointerSensor + 5px threshold so inputs stay usable, KeyboardSensor for a11y); the 4 layer sections are droppables; dropping a card onto another layer updates its `layer` and toasts. 2-col grid layout for the layers; DragOverlay floats the dragged card; drop zone highlights with Ember ring. Built with @dnd-kit/core 6.3.1 + utilities 3.2.2. Lint + build clean.

- [x] P4 richer Keyword Bank (2026-07-15): search-term-analyzer.tsx — added computed PPC metrics CPC (spend/clicks), CVR (orders/clicks), CPA (spend/orders) as right-aligned mono columns, and an editable Notes column (new `description` field on Row, seeded for the 5 presets). Table min-width bumped 820→1200px inside the existing overflow-x-auto wrapper. ACoS + Recommendation columns were already present. Lint + build clean.

- [x] Tests for new features (2026-07-15): added src/components/sections/tools/search-term-analyzer.test.ts (9 unit tests for parseNum + recommend across all 6 action branches) and campaign-builder.test.tsx (4 render/Add tests via Testing Library; added data-testid on LayerSection root for scoping). Full suite 59→72 passing (5 files). Build + lint clean.

- [x] Section consistency audit (2026-07-15): scanned all 17 section files for banned patterns — 0 gradients, 0 orphaned from-/to-/via- stops, 0 Space Grotesk leaks. Only `backdrop-blur` is the landing mobile-menu scrim (`bg-black/50`), a functional overlay kept on purpose (same as the 2 modal scrims). Redesign confirmed consistent across the whole app.
