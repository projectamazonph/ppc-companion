# Brand Guidelines — ppc-companion

## Parent Brand

**ProjectAmazonPH** — "Learn • Earn • Empower"

## App Identity

ppc-companion is the **free Amazon PPC sampler** under ProjectAmazonPH — a training companion that lets aspiring Filipino VAs try safe, realistic PPC tasks and then continue into the full **AMPH v2** program. It is a learning product, not a seller analytics or campaign-management tool.

## Logo

Primary mark: **Concept 4** — Three ascending white bars with sky blue growth arrow sweep.
Represents data, analytics, and upward trajectory.
Source: `/public/icons/icon-og.png`

## Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | `#FF6B35` | Umbrella brand — all apps share |
| Secondary | `#3B82F6` | Steel blue — tool-specific accents |
| Accent | `#F59E0B` | Amber — warnings, highlights |
| Success | `#22C55E` | Green — positive metrics |
| Error | `#EF4444` | Red — negative metrics |

See `src/styles/design-system.css` for full token system.

## Typography

- **Body:** Inter (Google Fonts) — `--font-sans`
- **Code / Data:** JetBrains Mono — `--font-mono`

## Icon System

Lucide icons (recommended for data/chart themed components).
Currently uses a mix — pending full icon audit.

## Motion

Minimal. Table row transitions, chart draw-in animations only.
Avoid excessive motion — this is a professional analytics tool.

## Favicon & App Icons

| File | Use |
|---|---|
| `/public/icons/icon-32.png` | Browser tab favicon |
| `/public/icons/icon-180.png` | Apple Touch / iOS home screen |
| `/public/icons/icon-192.png` | PWA manifest |
| `/public/icons/icon-512.png` | PWA manifest high-res |
| `/public/icons/icon-og.png` | OG social share image (1200×630) |

## Metadata

- **Site name:** ppc-companion
- **Author:** Ryan Dabao — ProjectAmazonPH
- **OG image:** `/public/og/ppc-og.png` (1200×630 composed — navy + bar chart icon + tagline)
- **Manifest:** `/public/manifest.json`
