# AGENTS.md — PPC Companion

> **Free Amazon PPC sampler** by ProjectAmazonPH — a mobile-friendly on-ramp that lets a prospective Filipino VA try a safe, realistic PPC task, then continue into the full **AMPH v2** program.

## Identity

| Field | Value |
|-------|-------|
| **Owner** | Ryan Roland Dabao (Amazon PPC Lead Manager, 10+ yrs) |
| **Purpose** | Free public sampler + companion funnel into the full AMPH v2 curriculum (retail-readiness scorecard, search-term triage, career-path handoff). The legacy full training platform (curriculum, quizzes, exercises, PPC tools, capstone, cohort management) remains as the content source feeding AMPH v2 |
| **Status** | Production (v0.6.0) |
| **Domain** | ppc-companion.vercel.app |

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (App Router) | Latest major |
| **Runtime** | Bun | Package management + scripts |
| **UI** | Tailwind CSS v4 + custom components | PostCSS config |
| **State** | Zustand v5 | Client-side state |
| **Database** | Prisma v6 + PostgreSQL | Canonical schema — all environments |
| **Auth** | JWT (jose) + HttpOnly cookies | Custom session management |
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
│   └── schema.prisma     ← Database schema (PostgreSQL)
├── scripts/              ← Seed scripts, migration helpers
├── docs/
│   └── CREATIVE-TEAM.md  ← Design & content guidelines
├── mini-services/        ← Auxiliary services
├── public/               ← Static assets
└── next.config.ts        ← Next.js config
```

## Conventions

### Code Style
- **TypeScript strict mode** — no `any` unless absolutely required
- **ESLint flat config** — `eslint.config.mjs` at root
- **Prettier** — format on save (config inferred from project)
- **Imports:** Use path aliases (`@/` for `src/`)
- **Components:** PascalCase filenames, default exports
- **Hooks:** camelCase, `use` prefix, named exports

### Database
- **Prisma ORM** — schema in `prisma/schema.prisma` (PostgreSQL)
- **Migrations:** `bun run db:migrate` (dev), `bun run db:migrate:create` (create only), `bun run db:migrate:prod` (deploy)
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
| `prisma/schema.prisma` | Database schema (PostgreSQL) — single source of truth |
| `next.config.ts` | Next.js configuration |
| `src/app/` | All routes and API endpoints |
| `src/components/` | Shared UI components |
| `src/lib/` | Business logic, server actions, utilities |
| `docs/CREATIVE-TEAM.md` | Design system and content guidelines |
| `KANBAN.md` | Project board (WIP: max 3 items) |
| `ProjectSummary.md` | High-level project overview |

---

*Updated: 2026-07-02 | Part of Ryan's Hermes Agent workspace*
