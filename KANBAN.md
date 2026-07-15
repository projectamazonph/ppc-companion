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