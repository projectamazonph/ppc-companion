# Architecture — PPC Companion

**Version:** 1.1 | **Updated:** 2026-07-16

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                         │
├──────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router — Standalone Output                   │
│                                                              │
│  ┌────────────────────┐    ┌────────────────────────────┐    │
│  │   Client (Zustand) │    │  Server (Prisma + DB)      │    │
│  │                    │    │                            │    │
│  │ • useAppStore      │    │ • API Routes (REST)        │    │
│  │   (single store:   │    │ • Edge Middleware           │    │
│  │   auth, section,   │    │   (jose JWT verify, CSRF,   │    │
│  │   exercise/quiz/   │    │    in-memory rate limit)    │    │
│  │   capstone state)  │    │ • Route handlers            │    │
│  │ • persisted to     │    │   (jsonwebtoken via         │    │
│  │   localStorage      │    │    auth-server.ts)          │    │
│  └────────────────────┘    └────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                 Tailwind CSS v4                       │    │
│  │   Mix of shadcn/ui primitives + plain-Tailwind        │    │
│  │   "Field Manual" components (see stitch-designs/)     │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

There is no separate client-side auth/UI/admin store split — `src/lib/store.ts` exports one Zustand store (`useAppStore`) with `persist` middleware, holding auth, active section/module/phase, and all exercise/quiz/capstone/checklist progress.

---

## Route Structure

Routes are real Next.js App Router files, not a client-side single-page router. Every route under the `(app)` group is a thin page component that renders one `*Section` component from `src/components/sections/`:

```
/                           → src/app/page.tsx            → LandingPage (public)
/login                      → src/app/login/page.tsx      → LoginSection
/projectamazonph            → src/app/projectamazonph/page.tsx (standalone page, outside the (app) group)

/(app)/                     → src/app/(app)/layout.tsx — auth guard + AppShell wrapper
                               (see "Auth Guard & Hydration" below)
├── dashboard               → DashboardSection
├── curriculum              → CurriculumSection
├── exercises                → ExercisesSection
├── quizzes                  → QuizzesSection
├── tools                    → ToolsSection
│                              ├── src/components/sections/tools/campaign-builder.tsx
│                              ├── src/components/sections/tools/search-term-analyzer.tsx
│                              ├── src/components/sections/tools/metrics-calculator.tsx
│                              └── src/components/sections/tools/keyword-deep-dive.tsx
├── capstone                 → CapstoneSection
├── downloads                → DownloadsSection
├── reference                 → ReferenceSection (glossary, formulas, checklists)
├── notifications              → NotificationCenterSection
├── my-profile                  → MyProfileSection  (URL is "my-profile"; the Section enum value is "myprofile" — see pathToSection/sectionToPath in store.ts)
├── students                    → StudentsSection    (admin: full CRUD on all students)
├── mystudents                  → MyStudentsSection  (instructor: view/grade own students)
├── cohorts                     → CohortsSection
└── admin-dashboard               → AdminDashboardSection
```

There is no `(student)`/`(instructor)`/`(admin)` route split. All authenticated routes live in the single `(app)` group; each `*Section` component does its own role-based branching internally, and role enforcement for data access happens server-side in the API routes (`requireRole` in `src/lib/auth-server.ts`), not via route structure.

### Auth Guard & Hydration

`src/app/(app)/layout.tsx` (a client component):
1. Uses `useSyncExternalStore` (not an effect) to detect when Zustand's `persist` middleware has hydrated from localStorage — avoids SSR/client flicker and stays React-Compiler-safe.
2. Once hydrated, redirects to `/` if `useAppStore(s => s.user)` is null.
3. Syncs the current pathname into the store's `activeSection` via `pathToSection()`.
4. Renders a loading skeleton pre-hydration, `null` post-hydration-but-unauthenticated, and otherwise wraps `children` in `<ErrorBoundary><AppShell>...</AppShell></ErrorBoundary>`.

`AppShell` (`src/components/layout/app-shell.tsx`) renders the persistent chrome (sidebar via `src/components/layout/sidebar.tsx`, top bar, theme toggle, notifications panel) around every `(app)` page.

---

## Database Schema

Schema lives in `prisma/schema.prisma` (Postgres, production) and a parallel `prisma/schema.sqlite.prisma` (SQLite, local dev) — see `AGENTS.md` for how to switch between them. The central user model is **`Student`**, used for students, instructors, and admins alike (distinguished by `role`).

### Core Entities

| Entity | Key Fields | Relations |
|--------|------------|-----------|
| **Student** | id, email, password, role, status, currentPhase, targetAcos, phase1-4Pass, capstoneDone, deletedAt | → Enrollment[], → ProgressEntry[], → ExerciseSubmission[], → QuizAttempt[], → CapstoneProject[], → Notification[], → Comment[], → AuditEntry[] (actor & target), → SessionLog[] |
| **Cohort** | id, code, name, status, startDate, endDate, maxStudents, deletedAt | → Enrollment[] |
| **Enrollment** | studentId, cohortId, status | → Student, → Cohort (many-to-many join with status) |
| **Phase** | number (1-4), title | → Module[], → Quiz[] |
| **Module** | phaseId, code, title, order | → Phase, → Exercise[], → Quiz[], → ProgressEntry[] |
| **Exercise** | moduleId, code, type (OPEN/CALCULATION/DECISION), content, modelAnswer | → Module, → ExerciseSubmission[] |
| **ExerciseSubmission** | studentId, exerciseId, status, score, deletedAt | → Student, → Exercise, → Comment[] |
| **Quiz** | moduleId, passingScore, timeLimitMin | → Module, → QuizQuestion[], → QuizAttempt[] |
| **QuizAttempt** | studentId, quizId, score, total, percentage, passed | → Student, → Quiz |
| **ProgressEntry** | studentId, moduleId, phaseNumber, exercisesDone/Total, quizScore/Total, capstoneDone | → Student, → Module (unique per studentId+phaseNumber) |
| **CapstoneProject** | studentId, status, deliverables, deletedAt | → Student |
| **Notification** | studentId, type, read, actionUrl | → Student |
| **Comment** | authorId, submissionId, deletedAt | → Student (author), → ExerciseSubmission |
| **AuditEntry** | actorId, action, entityType, entityId | → Student (actor, target) |
| **SessionLog** | studentId, userAgent, ipAddress | → Student |

Design conventions (see header comment in `schema.prisma`): every model has `createdAt`/`updatedAt`; soft-deletable entities have a nullable `deletedAt`; every FK has an explicit `onDelete` (cascade for tightly-owned children, restrict for cohorts); every FK and commonly-filtered column is indexed; fixed-value fields are enums.

### Auth Flow

```
Login → POST /api/auth/login
  → Validate credentials (bcryptjs compare)
  → Sign JWT (jsonwebtoken, in the route handler)
  → Set HttpOnly session cookie
  → Client redirects based on role

Edge Middleware (src/middleware.ts) → on every /api/* request:
  → Skip public routes (login/signup/csrf/health, static assets)
  → In-memory per-instance rate limit check
  → CSRF check for mutating methods with cookie auth (Origin/Referer or X-CSRF-Token;
     Authorization: Bearer requests are exempt)
  → JWT verify with `jose` (Edge-compatible) unless the route is in JWT_EXEMPT_ROUTES

Route handlers (src/app/api/**/route.ts) → independently call
  requireAuth(req) / requireRole(req, ...roles) from src/lib/auth-server.ts,
  which verifies the same JWT with `jsonwebtoken` (Node runtime).
```

Two different JWT libraries are used deliberately: `jose` in the Edge-runtime middleware, `jsonwebtoken` in Node-runtime route handlers. Adding a new route requires updating both the middleware's route lists **and** the route handler's own `requireAuth`/`requireRole` call — they are independent gates.

### State Management (Zustand)

```
useAppStore (src/lib/store.ts) — single store, persisted to localStorage as "ppc-companion-store"
  State: user, activeSection, activeModuleId, activePhaseId,
         exerciseAnswers, decisionSelections, calculationAnswers,
         quizResults, capstoneCompleted, checklistCompleted
  Actions: login, logout, setSection, setUser, setActiveModule,
           setExerciseAnswer, setDecisionSelection, setCalculationAnswer,
           setQuizResult, toggleCapstone, toggleChecklist, resetProgress

Helpers: pathToSection() / sectionToPath() map between URL paths and the
         Section enum; useProgressStats() derives dashboard stats from
         the raw progress maps above.
```

Writes to `exerciseAnswers`, `quizResults`, and `capstoneCompleted` also fire-and-forget a sync call (`src/lib/sync.ts`) to the corresponding API route so instructor-facing views see the same data — these calls fail silently by design; localStorage remains the source of truth for the student's own session.

---

## Component Tree (Simplified)

```
RootLayout (src/app/layout.tsx)
├── / → LandingPage
├── /login → LoginSection
└── (app)/layout.tsx  [auth guard, hydration gate]
    └── AppShell [sidebar, top bar, theme toggle, notifications panel]
        ├── DashboardSection
        ├── CurriculumSection → (course-view.tsx rendering per phase/module)
        ├── ExercisesSection
        ├── QuizzesSection
        ├── ToolsSection
        │   ├── CampaignBuilder
        │   ├── SearchTermAnalyzer
        │   ├── MetricsCalculator
        │   └── KeywordDeepDive
        ├── CapstoneSection
        ├── DownloadsSection
        ├── ReferenceSection
        ├── NotificationCenterSection
        ├── MyProfileSection
        ├── StudentsSection        (admin)
        ├── MyStudentsSection      (instructor)
        ├── CohortsSection
        ├── AuditLogSection        (admin)
        └── AdminDashboardSection  (admin)
```

Sections are being migrated from shadcn/ui primitives to plain-Tailwind components matching the mockups in `stitch-designs/` (a "Field Manual" design system) — see recent commit history. Check `stitch-designs/` for a matching mockup before reintroducing shadcn components in a section that's already been migrated.

---

## Data Flow

### Exercise / Quiz / Capstone Submission
```
User interacts with a Section component
  → useAppStore action updates local state immediately (localStorage-persisted)
  → if the user is logged in and shouldSync(user), src/lib/sync.ts fires a
    fetch() to the matching API route (POST /api/exercises/submissions,
    POST /api/quizzes/attempts, etc.)
  → API route: requireAuth/requireRole → validate body → Prisma write
    → returns JSON; failures are logged client-side and otherwise ignored
```

### Progress Tracking
```
Section component fetches /api/progress (or relies on client-persisted
  exerciseAnswers/quizResults/capstoneCompleted) for the current user
  → useProgressStats() derives dashboard-ready numbers from local state
  → Instructor/admin views (MyStudentsSection, StudentsSection,
    AdminDashboardSection) read the server-persisted ProgressEntry /
    ExerciseSubmission / QuizAttempt rows via the relevant API routes
```

---

## Deployment Architecture

```
[Vercel]
        ↓
[Next.js Standalone Output]  (next build --webpack; `output: "standalone"` in next.config.ts)
  - Server-Side Rendering (SSR)
  - API Routes (REST)
  - Edge Middleware (src/middleware.ts)
  - Static Assets (CDN)
        ↓
[PostgreSQL] (production, via prisma/schema.prisma) / [SQLite] (local dev, via prisma/schema.sqlite.prisma)
        ↓
[public/downloads] (static files served from the repo, not object storage)
```
