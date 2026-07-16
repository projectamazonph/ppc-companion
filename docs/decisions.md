# Architecture Decision Records — PPC Companion

**Format:** [Michael Nygard's ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

## ADR-001: Next.js 16 with App Router

**Status:** ✅ ACCEPTED

**Context:** We need a React framework that supports server-side rendering, static generation, API routes, and the latest React features. The training platform needs rich interactivity (exercises, quizzes, tools) alongside content pages.

**Decision:** Use Next.js 16 with the App Router for:
- File-system based routing with nested layouts
- React Server Components for course content (fast, SEO-friendly)
- API Routes for auth and data operations
- Middleware for route protection
- Standalone output for Vercel deployment

**Consequences:** 
- ✅ Latest React features (Server Components, Streaming, Server Actions)
- ✅ Excellent developer experience and ecosystem
- ✅ Built-in optimization (image, font, bundle)
- ⚠️ Learning curve for App Router patterns vs Pages Router
- ⚠️ Some libraries still catching up to React 19

---

## ADR-002: SQLite via Prisma (Local Dev), PostgreSQL (Planned)

**Status:** ✅ ACCEPTED

**Context:** During development, we need fast iteration with zero configuration. For production, we need concurrent access and durability.

**Decision:** 
- **Development:** SQLite via Prisma — no external database server needed
- **Production:** PostgreSQL via Prisma (Neon or Supabase)
- Prisma abstracts the database layer, making migration straightforward

**Consequences:**
- ✅ Zero-config local setup — `bun run db:push` is all that's needed once `prisma/schema.sqlite.prisma` is copied over `prisma/schema.prisma`
- ✅ Prisma provides type-safe queries and migrations
- ⚠️ Must avoid SQLite-specific features that don't migrate to PostgreSQL
- ⚠️ Schema changes require migration planning for production data
- ⚠️ `prisma/schema.prisma` (the file Prisma actually reads) currently defaults to `provider = "postgresql"`; the two schema files are kept in sync by hand, not generated from one another — remember to update both when changing the data model

---

## ADR-003: JWT Auth with HttpOnly Cookies (jose)

**Status:** ✅ ACCEPTED, ⚠️ AMENDED 2026-07-16

**Context:** Need secure auth for 3 roles (student, instructor, admin) without external auth providers. Must be secure against XSS and CSRF.

**Decision:**
- Use `jose` library for JWT signing/verification (no jsonwebtoken dependency)
- Store tokens in HttpOnly, Secure, SameSite=Lax cookies
- Role embedded in JWT payload
- Middleware checks cookie on every protected route
- 24-hour token expiry with refresh mechanism

**Amendment (2026-07-16):** In practice the codebase uses **two** JWT libraries, not one. `src/middleware.ts` (Edge runtime) verifies with `jose` as originally decided. But `src/lib/auth-server.ts` — the helper (`requireAuth`/`requireRole`) called by every route handler in `src/app/api/**/route.ts` — signs and verifies with `jsonwebtoken`, which is a direct dependency. This works because route handlers run on the Node runtime (where `jsonwebtoken` is supported) while middleware runs on the Edge runtime (which requires `jose`). The "no jsonwebtoken dependency" consequence below no longer holds; treat this as accepted current state rather than a bug, but keep it in mind when changing either JWT path — they must stay behaviorally consistent independently.

**Consequences:**
- ✅ XSS-safe (JavaScript can't read HttpOnly cookies)
- ✅ CSRF protection via SameSite
- ⚠️ Two separate JWT libraries/verification paths to keep in sync (see amendment)
- ⚠️ No password reset yet (requires email service)
- ⚠️ Token revocation requires server-side blocklist or short expiry

---

## ADR-004: Zustand v5 for Client State

**Status:** ✅ ACCEPTED

**Context:** Need lightweight state management for client-side state (auth context, UI state, admin filters). Redux is too heavy; Context API has re-render issues.

**Decision:** Use Zustand v5 with:
- Separate stores for auth, UI, and admin state
- No boilerplate — minimal store definitions
- Built-in TypeScript support
- Sync with localStorage for persistence where needed

**Consequences:**
- ✅ Minimal bundle size (~1KB)
- ✅ No provider nesting or context boilerplate
- ✅ Simple API — `useAuthStore(state => state.user)`
- ⚠️ DevTools not as mature as Redux DevTools
- ⚠️ Large stores can cause unnecessary re-renders if not properly sliced

---

## ADR-005: Tailwind CSS v4 with Custom Design System

**Status:** ✅ ACCEPTED

**Context:** Need a consistent, maintainable design system that looks professional across all devices. Must support rapid UI iteration.

**Decision:**
- Tailwind CSS v4 with CSS-first configuration
- shadcn/ui components as base (customized)
- Custom design tokens for PPC brand (colors, spacing, typography)
- Mobile-first responsive design
- Dark mode via Tailwind's `dark:` variant

**Consequences:**
- ✅ Rapid prototyping with utility classes
- ✅ Consistent design via token system
- ✅ Small production CSS (purged unused styles)
- ❌ v4 migration required breaking changes from v3
- ⚠️ Some shadcn/ui components need adaptation for v4 compatibility

---

## ADR-006: Vitest for Testing

**Status:** ✅ ACCEPTED

**Context:** Need a fast, TypeScript-native test runner for unit, component, and API route tests.

**Decision:** Use Vitest with:
- React Testing Library for component tests
- MSW or API route mocking for server tests
- Coverage reporting
- Watch mode for TDD

**Consequences:**
- ✅ Native TypeScript support (no babel/config needed)
- ✅ Fast (uses esbuild under the hood)
- ✅ Jest-compatible API (easy migration)
- ⚠️ Smaller ecosystem than Jest for some niche tools
