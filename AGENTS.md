# AGENTS.md — PPC Companion

> **Amazon PPC Manager training platform** — interactive companion app for the 8–12 week Amazon PPC Manager program.

## Identity

| Field | Value |
|-------|-------|
| **Owner** | Ryan Roland Dabao (Amazon PPC Lead Manager, 10+ yrs) |
| **Purpose** | Student training platform with curriculum, quizzes, exercises, PPC tools, capstone project, cohort management |
| **Status** | Production (v0.6.0) |
| **Domain** | ppc-companion.vercel.app |

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (App Router) | Latest major |
| **Runtime** | Bun | Package management + scripts |
| **UI** | Tailwind CSS v4 + custom components | PostCSS config |
| **State** | Zustand v5 | Client-side state |
| **Database** | Prisma v6 | `schema.prisma` defaults to PostgreSQL (prod); `schema.sqlite.prisma` is a parallel copy for local SQLite dev — copy it over `schema.prisma` to develop locally |
| **Auth** | JWT + HttpOnly cookies | `jose` in Edge middleware (`src/middleware.ts`), `jsonwebtoken` in Node route handlers (`src/lib/auth-server.ts`) — two libraries, by design |
| **Deploy** | Vercel (standalone output) | `next build --webpack` |
| **Testing** | Vitest | Unit + component + API tests |
| **Lint** | ESLint (flat config) | `eslint.config.mjs` |

## Code Organization

```
ppc-companion/
├── src/
│   ├── app/              ← App Router pages (routes, layouts, API)
│   ├── components/       ← React components (shared + feature)
│   ├── hooks/            ← Custom React hooks
│   ├── lib/              ← Utilities, helpers, server actions
│   ├── styles/           ← Global styles
│   └── test/             ← Test helpers/fixtures
├── prisma/
│   └── schema.prisma     ← Database schema (SQLite)
├── scripts/              ← Seed scripts, migration helpers
├── docs/
│   └── CREATIVE-TEAM.md  ← Design & content guidelines
├── mini-services/        ← Auxiliary services
├── public/               ← Static assets
└── next.config.ts        ← Next.js config
```

## Conventions

### Code Style
- **TypeScript** — `tsconfig.json` has `strict: true` but also `noImplicitAny: false`; `eslint.config.mjs` explicitly turns off `no-explicit-any`, `no-unused-vars`, and most other strictness rules on top of `eslint-config-next`. `any` is used freely in the existing codebase — don't assume a stricter policy than the configs enforce.
- **ESLint flat config** — `eslint.config.mjs` at root
- **Prettier** — format on save (config inferred from project)
- **Imports:** Use path aliases (`@/` for `src/`)
- **Components:** PascalCase filenames, default exports
- **Hooks:** camelCase, `use` prefix, named exports

### Database
- **Prisma ORM** — schema in `prisma/schema.prisma`
- **Migrations:** `bun run db:migrate:create` (dev), `bun run db:migrate:prod` (deploy)
- **Seed:** `bun run db:seed` (full) or `bun run db:seed-students`
- **Verify:** `bun run db:verify` before committing schema changes
- Design principles: timestamps on every entity, soft-delete with `deletedAt`

### State Management
- **Zustand v5** for shared client state
- **Server actions** for mutations where possible
- **JWT** for auth, stored in HttpOnly cookies

## Guardrails

### DO NOT
- ❌ Commit secrets or API keys — use `.env` (in `.gitignore`)
- ❌ Hardcode ports, URLs, or tokens — use environment variables
- ❌ Skip `prisma generate` after schema changes
- ❌ Use `any` type — prefer `unknown` + narrow
- ❌ Commit to `main` directly — use feature branches

### DO
- ✅ Run `bun run db:verify` before committing Prisma changes
- ✅ Run `bun test` before opening PRs
- ✅ Write Vitest tests for new features (unit + API)
- ✅ Use `bun run build` to verify production build locally
- ✅ Document new environment variables in `.env.example`

## Build & Deploy

```bash
# Development
bun dev                    # http://localhost:3000

# Database
bun run db:generate        # Prisma client generation
bun run db:migrate:create  # Create new migration
bun run db:push            # Push schema (dev only)
bun run db:seed            # Seed database
bun run db:verify          # Validate + dry-run

# Testing
bun test                   # All tests
bun run test:coverage      # With coverage

# Production
bun run build              # Prisma generate + next build
                      
# Deploy
git push                    # Auto-deployed via Vercel
```

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema — source of truth for data model |
| `next.config.ts` | Next.js configuration |
| `src/app/` | All routes and API endpoints |
| `src/components/` | Shared UI components |
| `src/lib/` | Business logic, server actions, utilities |
| `docs/CREATIVE-TEAM.md` | Design system and content guidelines |
| `KANBAN.md` | Project board (WIP: max 3 items) |
| `ProjectSummary.md` | High-level project overview |

---

*Updated: 2026-07-16 | Part of Ryan's Hermes Agent workspace*
