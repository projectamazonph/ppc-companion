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
- ✅ Zero-config local setup — `bun run db:push` is all that's needed
- ✅ Prisma provides type-safe queries and migrations
- ⚠️ Must avoid SQLite-specific features that don't migrate to PostgreSQL
- ⚠️ Schema changes require migration planning for production data

---

## ADR-003: JWT Auth with HttpOnly Cookies (jose)

**Status:** ✅ ACCEPTED

**Context:** Need secure auth for 3 roles (student, instructor, admin) without external auth providers. Must be secure against XSS and CSRF.

**Decision:**
- Use `jose` library for JWT signing/verification (no jsonwebtoken dependency)
- Store tokens in HttpOnly, Secure, SameSite=Lax cookies
- Role embedded in JWT payload
- Middleware checks cookie on every protected route
- 24-hour token expiry with refresh mechanism

**Consequences:**
- ✅ XSS-safe (JavaScript can't read HttpOnly cookies)
- ✅ CSRF protection via SameSite
- ✅ No external auth dependency
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
