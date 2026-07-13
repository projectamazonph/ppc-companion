# Amazon PPC Manager — Companion App

> Interactive training platform for Amazon PPC Manager program. Companion portal for students, instructors, and admins.

**v0.5.0** · Next.js 16 · React 19 · TypeScript 5 · Tailwind v4 · Prisma

---

## Overview

A production-grade **8–12 week** training companion built for the Amazon PPC Manager program. Students get a structured curriculum with auto-graded quizzes, interactive exercises, PPC tools, and a capstone project. Instructors and admins get cohort management, progress tracking, and dashboards.

---

## Features

| Area | Capabilities |
|------|-------------|
| **Curriculum** | 4 phases · 10 modules · structured learning path · 1,779 lines of course data |
| **Exercises** | Auto-graded interactive exercises with real PPC scenarios |
| **Quizzes** | Checkpoint quizzes per phase with instant scoring |
| **Dashboard** | Student progress tracking, module completion, score overview |
| **Admin Panel** | Stats dashboard, user management, cohort oversight |
| **Notification Center** | In-app notifications with filters, mark-read, delete |
| **Cohorts** | Class management with student grouping |
| **Capstone** | Multi-week capstone project with milestone tracking |
| **PPC Tools** | Campaign Builder, Search Term Analyzer, Metrics Calculator |
| **Downloads** | Cheat sheets, templates (keyword research, campaign blueprint, reports) |
| **Audit Trail** | Full activity log for instructor monitoring |
| **Profiles** | Student + instructor profiles with activity timeline |
| **Auth** | bcrypt hashing · JWT tokens · role-based access (student/instructor/admin) |
| **PWA** | Standalone manifest · apple-web-app capable |

---

## Curriculum — 4 Phases

| Phase | Focus | Modules |
|-------|-------|---------|
| 🟦 **1 — Foundations** | How Amazon works, PPC metrics, ACoS, TACoS | 3 |
| 🟥 **2 — Amazon Ads Deep Dive** | Ad types, match types, bidding strategies, negatives | 3 |
| 🟩 **3 — Advanced Optimization** | Keyword research, campaign structure, data-driven optimization | 3 |
| 🟪 **4 — Portfolio & Client Management** | Reporting, client communication, capstone project | 2 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + shadcn/ui (Radix primitives) |
| **Styling** | Tailwind CSS v4 + Geist font |
| **Language** | TypeScript 5 (strict mode) |
| **Database** | PostgreSQL via Prisma ORM (SQLite for local dev) |
| **Auth** | bcryptjs + JWT |
| **State** | Zustand (persisted localStorage) |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Rate Limiting** | Persistent SQLite (Node 22 `node:sqlite`) |
| **Runtime** | Node.js 22+ / Bun 1.3+ |

---

## Quick Start
```bash
# Install dependencies
bun install

# Set up env
cp .env.example .env
# Edit .env with your JWT_SECRET and DATABASE_URL

# Generate Prisma client
bunx prisma generate
# Push schema to database
bunx prisma db push
# Bootstrap admin account
ADMIN_PASSWORD=your-secret bunx tsx scripts/seed-students.ts

# Run dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
├── src/
│   ├── app/                   # App Router pages + API routes
│   │   ├── api/               # 21 REST endpoints (auth, students, cohorts, etc.)
│   │   ├── globals.css        # Tailwind + design system
│   │   ├── layout.tsx         # Root layout with app shell
│   │   └── page.tsx           # Section routing
│   ├── components/
│   │   ├── layout/            # App shell, sidebar
│   │   ├── sections/          # 17 feature sections (dashboard, admin, etc.)
│   │   ├── shared/            # Shared UI components
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/                 # Custom hooks (use-mobile, use-toast)
│   ├── lib/
│   │   ├── auth-server.ts     # JWT utilities (requireAuth, requireRole)
│   │   ├── course-data.ts     # Full curriculum content (~1,779 lines)
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── db-queries/        # Database query helpers
│   │   ├── design-tokens.ts   # Design system tokens
│   │   ├── env-validate.ts    # Startup env validation
│   │   ├── rate-limit.ts      # Persistent SQLite rate limiter
│   │   ├── store.ts           # Zustand state management
│   │   └── utils.ts           # Misc utilities
│   ├── middleware.ts          # JWT auth + CSRF + rate limiting
│   └── styles/                # Design system CSS
├── prisma/
│   ├── schema.prisma          # PostgreSQL schema
│   ├── schema.sqlite.prisma   # SQLite dev schema
│   └── migrations/            # Database migrations
├── public/downloads/          # Cheat sheets, templates, PDFs
├── scripts/                   # Seed scripts
├── stitch-designs/            # UI design references
└── .env.example               # Environment template
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | Public | Login |
| `/api/auth/signup` | POST | Public | Register |
| `/api/auth/me` | GET | JWT | Current user |
| `/api/auth/change-password` | POST | JWT | Password change |
| `/api/students` | GET | JWT | Student list |
| `/api/students/[id]` | GET/PUT | JWT | Student detail/update |
| `/api/students/[id]/progress` | GET | JWT | Student progress |
| `/api/students/[id]/activity` | GET | JWT | Student activity |
| `/api/cohorts` | GET/POST | JWT | Cohort management |
| `/api/cohorts/[id]` | GET/PUT/DELETE | JWT | Cohort detail |
| `/api/exercises` | GET | JWT | Exercise list |
| `/api/exercises/submissions` | GET/POST | JWT | Exercise submissions |
| `/api/exercises/submissions/[id]/grade` | POST | JWT | Grade submission |
| `/api/quizzes` | GET | JWT | Quiz list |
| `/api/quizzes/attempts` | POST | JWT | Quiz attempts |
| `/api/capstones` | GET/POST | JWT | Capstone projects |
| `/api/notifications` | GET/POST/PUT/DELETE | JWT | Notifications |
| `/api/audit` | GET | Admin | Audit trail |
| `/api/tags` | GET | JWT | Tags |
| `/api/admin/stats` | GET | Admin | Admin dashboard stats |
| `/api/health` | GET | Public | Health check |

---

## Security

- **Server-side JWT** — All protected routes verify tokens via `requireAuth()`/`requireRole()`
- **CSRF protection** — Origin/Referer check on cookie-authenticated mutating requests; Bearer token auth bypasses
- **Persistent rate limiting** — SQLite-backed (Node 22 `node:sqlite`), survives restarts, in-memory fallback
- **Env validation** — Startup check for `JWT_SECRET`, `DATABASE_URL`
- **Ownership enforcement** — Users can only access their own data (admins/instructors bypass)
- **Password hashing** — bcryptjs

---

## Production

```bash
# Build
bun run build

# Deploy to Vercel
vercel --prod
```

**Requirements:**
- `JWT_SECRET` — Strong random secret (64+ chars)
- `DATABASE_URL` — PostgreSQL connection string
- `APP_URL` — Deployed app URL (for CORS/CSRF)

---

## License

Internal training program. Proprietary.
