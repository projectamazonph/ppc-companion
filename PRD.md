# PRD — PPC Companion (Free Sampler for AMPH v2)

**Version:** 1.0 | **Status:** Approved | **Last Updated:** 2026-07-16

---

## Product Overview

PPC Companion is a **free, mobile-friendly sampler** built by **ProjectAmazonPH** for aspiring Filipino Virtual Assistants. It lets a prospective student try a safe, realistic Amazon PPC task — understand the work an Amazon PPC specialist actually does — and then continue into the appropriate **AMPH v2** course for full training and certification.

PPC Companion is **not** a second complete PPC course. The original full training platform (a structured 4-phase / 10-module curriculum with auto-graded quizzes, interactive exercises, real PPC tools, and a capstone project) is preserved as the underlying content source that feeds AMPH v2. New visitors meet the sampler first; the complete curriculum and certification live in AMPH v2.

**Core Value Proposition:** A no-risk, no-experience-needed taste of real Amazon PPC VA work that converts interested Filipinos into enrolled AMPH v2 students (₱15k → ₱80k+/month career trajectory).

---

## Target Audience

### Primary: Filipino VA Students
- Current VAs earning ₱15k–₱30k/month wanting to upskill into PPC
- No prior PPC experience required
- Self-motivated, tech-literate, English-proficient
- Device: Desktop/laptop primary, mobile secondary

### Secondary: Instructors & Admins
- Ryan (course creator & lead instructor)
- Future certified instructors from alumni pool
- Admins managing cohorts, content, and platform operations

---

## User Stories

### Student
- US-01: I can register with email/password and join a cohort
- US-02: I can browse a structured curriculum of 4 phases × 10 modules
- US-03: I can complete auto-graded exercises with instant feedback
- US-04: I can take checkpoint quizzes at the end of each phase
- US-05: I can track my progress across modules, scores, and completion
- US-06: I can access PPC tools (Campaign Builder, Search Term Analyzer, Metrics Calculator)
- US-07: I can download cheat sheets, templates, and resources
- US-08: I can work on a multi-week capstone project with milestone tracking
- US-09: I can view my profile, activity timeline, and achievement badges
- US-10: I can receive in-app notifications for deadlines and updates

### Instructor
- US-11: I can view all students and their progress in my cohorts
- US-12: I can review quiz scores and exercise completion
- US-13: I can access the audit trail for student activity
- US-14: I can manage cohort membership and student grouping

### Admin
- US-15: I can view platform-wide analytics (enrollment, progress, scores)
- US-16: I can manage users, cohorts, and content
- US-17: I can configure system settings and notification templates

---

## Feature List

### MVP (v1.0 — Current)
| Feature | Description | Status |
|---------|-------------|--------|
| **Auth System** | Email/password registration, login, JWT session management, role-based access (student/instructor/admin) | ✅ Live |
| **Curriculum** | 4 phases · 10 modules · 1,779+ lines of structured course data | ✅ Live |
| **Interactive Exercises** | Auto-graded PPC exercises with real scenarios and instant scoring | ✅ Live |
| **Checkpoint Quizzes** | Phase-end quizzes with instant scoring and review | ✅ Live |
| **Student Dashboard** | Progress tracking, module completion, score overview | ✅ Live |
| **Admin Panel** | Stats dashboard, user management, cohort oversight | ✅ Live |
| **Notification Center** | In-app notifications with filters, mark-read, bulk delete | ✅ Live |
| **Cohort Management** | Class grouping with student assignment | ✅ Live |
| **Capstone Project** | Multi-week milestone-tracked capstone | ✅ Live |
| **PPC Tools** | Campaign Builder, Search Term Analyzer, Metrics Calculator | ✅ Live |
| **Download Center** | Cheat sheets, keyword research templates, campaign blueprints, report templates | ✅ Live |
| **Audit Trail** | Full activity log for instructor monitoring | ✅ Live |
| **User Profiles** | Student + instructor profiles with activity timeline | ✅ Live |
| **PWA Support** | Standalone manifest, apple-web-app capable, install prompt | ✅ Live |

### V2 (Planned)
| Feature | Priority |
|---------|----------|
| PostgreSQL migration (from SQLite) | High |
| Real-time collaboration (live cohorts, group exercises) | Medium |
| Advanced analytics dashboards (student success prediction) | Medium |
| Mobile app (React Native) | Low |
| API for third-party integrations | Low |
| Gamification (badges, leaderboards, XP) | Medium |
| Guided exercise feedback | Medium |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Student enrollment (per cohort) | 25–50 |
| Course completion rate | >70% |
| Average quiz score improvement | >30% (pre→post) |
| Post-program salary increase | ₱15k→₱50k+ (within 6 months) |
| NPS (Net Promoter Score) | >60 |
| Monthly active users | >80% of enrolled |

---

## Technical Constraints

- **Database:** Currently SQLite (local dev). PostgreSQL required for production scale
- **Auth:** JWT-based with HttpOnly cookies. No OAuth providers yet
- **Deployment:** Vercel (standalone output, `next build --webpack`)
- **File Storage:** Local filesystem for downloads. S3/CDN planned
- **Email:** Not yet implemented. Postmark/SendGrid planned for notifications

---

## Glossary

| Term | Definition |
|------|------------|
| ACoS | Advertising Cost of Sale — ad spend ÷ sales |
| TACoS | Total Advertising Cost of Sale — total ad spend ÷ total sales |
| Cohort | A group of students progressing through the program together |
| Capstone | Final multi-week project demonstrating cumulative PPC skills |
| Phase | Major section of curriculum (4 total: Foundations, Ads, Optimization, Portfolio) |
| Module | Unit within a phase (10 total, 2-3 per phase) |
