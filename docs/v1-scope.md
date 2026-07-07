# ppc-companion v1 — Scope

**v1 is the core training loop.** One student signs up, works through 4 phases, passes checkpoints, finishes a capstone. That's the entire product.

**What ships in v1:**
- Email/password auth (no OAuth, no magic links)
- 4 phases with modules and checkpoint quizzes
- Phase gate: 70% required on checkpoint to unlock next phase
- Capstone project as final deliverable
- ACoS calculator tool
- Completion state when all 4 phases + capstone are done
- Local progress persistence (Zustand + localStorage)

**What does NOT ship in v1:**
- Student management / instructor dashboards
- Cohort tracking
- Server-synced progress (DB backend) — progress is local-only
- Notification system
- Payment / enrollment / pricing pages
- Admin / audit / reference sections

---

## User Flow

1. Land on page → see landing with auth form
2. Sign up with name + email + password → cookie set, redirected to dashboard
3. Dashboard shows "Phase 1: Foundations" ring
4. Click "Continue" → Curriculum section → Phase 1 modules listed
5. Read module content → do exercises (open-ended, no grading)
6. Last module → "Take Checkpoint" button appears
7. Pass checkpoint (≥70%) → Phase 2 unlocks on dashboard
8. Fail checkpoint → retry allowed, no lockout
9. Complete all 4 checkpoints → Capstone section unlocks
10. Finish capstone → Completion state shown (graduation card)

---

## Auth

- `POST /api/auth/signup` — creates student record in DB, returns JWT cookie
- `POST /api/auth/login` — verifies password, returns JWT cookie
- `GET /api/auth/me` — returns current user info from JWT cookie
- `POST /api/auth/logout` — clears cookie
- JWT stored in `HttpOnly` cookie named `session`
- No role system — every v1 user is a "student"
- No guest mode in v1 — must sign up to access curriculum

---

## Progress Gate Logic

```
canAccessPhase(n):
  if n == 1: return true
  score = getCheckpointScore(n - 1)
  return score !== null AND score >= 70
```

- Phase 1 is always open
- Phase 2+ requires ≥70% on previous checkpoint
- Checkpoint score stored in Zustand (`quizResults`)
- No server-side enforcement in v1 (UI-only gate — student can theoretically bypass via API)

---

## Components (v1 subset)

| Component | File | Notes |
|---|---|---|
| AuthCard | `landing.tsx` | Login/signup form, already built |
| Dashboard | `dashboard.tsx` | Simplified: rings per phase, no admin |
| Curriculum | `curriculum.tsx` | Phase list → module list → content |
| Exercise | `exercises.tsx` | Open-ended + calculation questions |
| Checkpoint | `quizzes.tsx` | MCQ quiz, auto-graded, 70% gate |
| Capstone | `capstone.tsx` | Checklist of deliverables |
| Calculator | `tools.tsx` | ACoS / ROAS / profit calculator |
| Completion | — | Shown in dashboard when all done |

---

## API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/signup` | POST | — | Create account |
| `/api/auth/login` | POST | — | Sign in |
| `/api/auth/me` | GET | Cookie | Get current user |
| `/api/auth/logout` | POST | — | Clear cookie |
| `/api/quizzes` | GET | Cookie | List quizzes (for checkpoints) |

---

## Data Model

**Student** (Prisma)
- `id`, `email`, `passwordHash`, `name`
- `role` = "STUDENT" for all v1 signups
- `createdAt`, `updatedAt`

Progress is stored **client-side only** in v1 (Zustand persist).
Server-side progress sync is v2.

---

## Design

Orange brand (#FF6B35) throughout.
No blue/violet except semantic phase colors (rose/emerald/violet).
Same glass-morphism design language as current app.

---

## Build & Deploy

```bash
npm install
npm run db:push   # creates SQLite DB + tables
npm run db:generate
npm run build
```

No separate migration needed — `db push` creates tables from schema.
Vercel GitHub App auto-deploys on push to main.
