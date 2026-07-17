# Brand Guidelines — ppc-companion

## Parent Brand

**ProjectAmazonPH** — "Learn • Earn • Empower"

## App Identity

ppc-companion is the **free Amazon PPC sampler** under ProjectAmazonPH — a training companion that lets aspiring Filipino VAs try safe, realistic PPC tasks and then continue into the full **Project Amazon PH Academy** program. It is a learning product, not a seller analytics or campaign-management tool.

## Logo

Primary mark: **Concept 4** — Three ascending white bars with sky blue growth arrow sweep.
Represents data, analytics, and upward trajectory.
Source: `/public/logo.svg`

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

Neutral placeholder icons are bundled so the manifest declares a complete set
of install icons. The bundled set lives at `/public/icons/` and `/public/og/`
and uses the brand `#FF6B35` background with a three-bar chart mark.

| File | Size | Use |
|---|---|---|
| `/public/icons/icon-32.png` | 32×32 | Browser tab favicon |
| `/public/icons/icon-180.png` | 180×180 | Apple Touch / iOS home screen |
| `/public/icons/icon-192.png` | 192×192 | PWA install |
| `/public/icons/icon-512.png` | 512×512 | PWA install high-res |
| `/public/og/ppc-og.png` | 1200×630 | OG social share image |

These are intentionally generic. Replace with the operator's branded
artwork before public launch — keep the same filenames to avoid touching
`layout.tsx` and `public/manifest.json`.

## Metadata

- **Site name:** ppc-companion
- **Author:** Ryan Dabao — ProjectAmazonPH
- **Manifest:** `/public/manifest.json`
