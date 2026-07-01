# Architecture — PPC Companion

**Version:** 1.0 | **Updated:** 2026-07-02

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                         │
├──────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router — Standalone Output                   │
│                                                              │
│  ┌────────────────────┐    ┌────────────────────────────┐    │
│  │   Client (Zustand) │    │  Server (Prisma + SQLite)  │    │
│  │                    │    │                            │    │
│  │ • Auth Store       │    │ • API Routes (REST)        │    │
│  │ • UI Store         │    │ • Server Actions           │    │
│  │ • Admin Store      │    │ • JWT Middleware            │    │
│  │ • Progress Store   │    │ • Role Guards              │    │
│  └────────────────────┘    └────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                 Tailwind CSS v4                       │    │
│  │       shadcn/ui + Custom Design Tokens                │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Route Structure

```
/                           → Landing page (public)
/auth/login                 → Login page
/auth/register              → Registration page

/(student)/
├── dashboard               → Student dashboard (progress, scores)
├── courses/                → Course browser
│   ├── [phaseId]           → Phase view
│   └── [phaseId]/[moduleId] → Module content + exercises
├── exercises/              → Exercise hub
│   └── [exerciseId]        → Individual exercise
├── quizzes/                → Quiz hub
│   └── [quizId]            → Quiz attempt
├── tools/                  → PPC Tools
│   ├── campaign-builder    → Campaign builder
│   ├── search-term-analyzer → Search term analysis
│   └── metrics-calculator  → ACoS/TACoS calculator
├── capstone/               → Capstone project
├── downloads/              → Resource downloads
├── notifications/          → Notification center
└── profile/               → User profile

/(instructor)/
└── dashboard              → Instructor dashboard (cohort view, student progress)

/(admin)/
├── dashboard              → Admin analytics
├── users/                 → User management
├── cohorts/               → Cohort management
├── content/               → Content management
└── settings/              → System settings
```

---

## Database Schema

### Core Entities

| Entity | Key Fields | Relations |
|--------|------------|-----------|
| **User** | id, email, password, role, name, cohortId | → Cohort, → Progress[], → QuizAttempt[] |
| **Cohort** | id, name, startDate, endDate, instructorId | → User[], → Courses[] |
| **Course** | id, title, phase, order, cohortId | → Module[], → Cohort |
| **Module** | id, title, content, order, courseId | → Course, → Progress[], → Exercises[] |
| **Progress** | id, userId, moduleId, completed, score, date | → User, → Module |
| **QuizAttempt** | id, userId, quizId, score, answers, date | → User |
| **Notification** | id, userId, type, message, read, date | → User |

### Auth Flow

```
Login → POST /api/auth/login
  → Validate credentials (bcrypt compare)
  → Generate JWT (jose, 24h expiry)
  → Set HttpOnly cookie (httpOnly, secure, sameSite=lax)
  → Redirect based on role

Middleware → Check cookie on every protected route
  → If invalid/missing → redirect to /auth/login
  → If valid → attach user to request → proceed
```

### State Management (Zustand)

```
Store: AuthStore
  State: user, token, isAuthenticated, isLoading
  Actions: login, logout, refreshSession, updateProfile

Store: UIStore
  State: sidebarOpen, theme, modalState, toastQueue
  Actions: toggleSidebar, setTheme, showToast

Store: AdminStore
  State: selectedCohort, dateRange, filterPresets
  Actions: setCohort, setDateRange, applyFilter
```

---

## Component Tree (Simplified)

```
RootLayout
├── PublicLayout
│   ├── LandingPage
│   ├── LoginPage
│   └── RegisterPage
├── StudentLayout
│   ├── Sidebar (course nav, progress)
│   ├── TopBar (user menu, notifications)
│   └── Main Content
│       ├── DashboardPage
│       ├── CoursePage → ModulePage → ExerciseComponent
│       ├── QuizPage → QuizScoringComponent
│       ├── ToolsPage
│       │   ├── CampaignBuilder
│       │   ├── SearchTermAnalyzer
│       │   └── MetricsCalculator
│       ├── CapstonePage → MilestoneTracker
│       ├── DownloadsPage
│       └── ProfilePage
├── InstructorLayout
│   └── Dashboard (cohort overview, student cards, progress charts)
└── AdminLayout
    ├── AnalyticsDashboard (charts, KPIs, trends)
    ├── UserTable (CRUD, filters, bulk actions)
    ├── CohortManager (create, assign, monitor)
    └── ContentManager (course/module editor)
```

---

## Data Flow

### Exercise Submission
```
User submits exercise → Server Action
  → Validate JWT (middleware)
  → Check exercise rules (Prisma query)
  → Grade automatically (scoring function)
  → Save result to Progress table
  → Return score + feedback
  → UI updates via Zustand progress store
```

### Progress Tracking
```
Course page loads → Server component fetches user progress
  → Renders progress bars (per module, per phase)
  → Zustand store caches progress data
  → On exercise/quiz completion → invalidate cache → re-fetch
  → Real-time updates via polling (planned: WebSocket)
```

---

## Deployment Architecture

```
[Vercel Edge Network]
        ↓
[Next.js Standalone Output]
  - Server-Side Rendering (SSR)
  - API Routes (REST)
  - Static Assets (CDN)
        ↓
[SQLite Database] (local) / [PostgreSQL] (planned: Neon/Supabase)
        ↓
[Local Filesystem] (uploads/downloads) / [S3] (planned)
```
