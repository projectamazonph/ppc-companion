# Development Plan — PPC Companion

**Version:** 1.0 | **Status:** Active Development (v0.5.0) | **Last Updated:** 2026-07-02

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PPC Companion                         │
├─────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router) + TypeScript 5                  │
│  Tailwind CSS v4 + shadcn/ui Components                  │
├───────────────────────┬─────────────────────────────────┤
│   Client (Zustand)    │   Server (Prisma + SQLite)       │
│                       │                                  │
│  • Store: auth, UI,   │  • Schema: Users, Cohorts,       │
│    progress, admin    │    Courses, Modules, Progress,   │
│  • 4 role-based       │    QuizAttempts, Notifications   │
│    layouts            │  • JWT (jose) HttpOnly cookies   │
│  • Mobile-responsive  │  • Server actions + API routes   │
└───────────────────────┴─────────────────────────────────┘
```

### Key Design Decisions

- **Next.js 16 App Router:** Latest stable for React Server Components, layouts, and streaming
- **SQLite (via Prisma):** Zero-config local dev; PostgreSQL planned for production
- **Zustand v5:** Lightweight client state (auth, UI theme, admin filters)
- **JWT (jose):** HttpOnly cookies for session management, role-based guards
- **Tailwind v4 + shadcn/ui:** Consistent design system with CSS-first configuration
- **Vitest:** Fast unit/component/API testing with TypeScript support

---

## Phase 1: Foundation — Auth, Database & Core Layout

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| Next.js 16 project scaffold | App Router, TypeScript, Tailwind v4 |
| Prisma schema | Users, Cohorts, Courses, Modules, Progress, QuizAttempts, Notifications |
| JWT auth system | jose library, HttpOnly cookies, role-based (student/instructor/admin) |
| Auth middleware | Route protection, role redirects, session refresh |
| Core layouts | 4 role-based layouts (public/student/instructor/admin) |
| Zustand stores | Auth store, UI store, admin store |

**Key Files:** `src/lib/auth-server.ts`, `src/lib/db.ts`, `src/lib/store.ts`, `src/middleware.ts`, `prisma/schema.prisma`

---

## Phase 2: Curriculum & Content

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| Course data structure | 4 phases × 10 modules, 1,779+ lines of structured content |
| Course browser | Phase/module navigation, progress indicators |
| Module view | Structured lesson content with embedded exercises |
| Download center | Cheat sheets, templates, resources |

**Key Files:** `src/lib/course-data.ts`, `src/app/(student)/courses/`

---

## Phase 3: Exercises & Quizzes

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| Interactive exercise engine | Scenario-based PPC exercises |
| Auto-grading system | Instant scoring + feedback |
| Checkpoint quizzes | Phase-end assessments, timed or untimed |
| Score tracking | Per-module, per-phase, cumulative |

**Key Files:** `src/app/(student)/exercises/`, `src/app/(student)/quizzes/`

---

## Phase 4: Admin Dashboard

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| Stats dashboard | Enrollment, progress, scores, trends |
| User management | CRUD, role assignment, cohort assignment |
| Cohort oversight | Create/edit/manage cohorts |
| Audit trail | Full activity log |

**Key Files:** `src/app/(admin)/`

---

## Phase 5: PPC Tools

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| Campaign Builder | Visual campaign structure tool |
| Search Term Analyzer | Import, analyze, segment search terms |
| Metrics Calculator | ACoS, TACoS, ROAS, breakeven |
| Capstone project | Multi-week milestone tracking |

**Key Files:** `src/app/(student)/tools/`, `src/app/(student)/capstone/`

---

## Phase 6: Polish, PWA & Deployment

**Status:** ✅ COMPLETE

| Task | Details |
|------|---------|
| PWA manifest | Standalone install, apple-web-app-capable |
| Notification center | In-app notifications with filters |
| User profiles | Activity timeline, progress summary |
| Error handling | Custom 404, error boundaries |
| Vercel deployment | Standalone output config, CI/CD pipeline |
| Performance | Bundle analysis, image optimization, caching |

**Key Files:** `public/manifest.json`, `src/app/error.tsx`, `src/app/not-found.tsx`, `.github/workflows/ci.yml`

---

## Phase 7: Production Scaling (Planned)

**Status:** 📋 PLANNED

| Task | Priority | Notes |
|------|----------|-------|
| PostgreSQL migration | High | Neon or Supabase for production |
| Email service integration | High | Postmark/SendGrid for notifications, password reset |
| Real-time collaboration | Medium | WebSocket for live cohort sessions |
| Advanced analytics | Medium | Student success prediction, engagement metrics |
| Guided feedback | Medium | Structured, rule-based exercise grading and hints |
| Gamification | Low | Badges, leaderboards, XP system |
| Mobile app | Low | React Native companion |
| API layer | Low | Public API for third-party integrations |

---

## Open Questions

1. **Database:** When to migrate from SQLite to PostgreSQL? Before first production cohort or after?
2. **Email:** Which provider? Need transactional + marketing emails
3. **Pricing:** Free during pilot? Subscription model?
4. **Scaling:** How many concurrent cohorts before infrastructure changes needed?
