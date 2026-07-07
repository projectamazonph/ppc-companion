# Design System: ppc-companion

## 1. Visual Theme & Atmosphere

A warm, gallery-airy learning platform that feels like a well-lit architecture studio — clinical precision with organic warmth. The density sits at a confident "Daily App Balanced" (5/10): information-rich enough for a serious training tool, never claustrophobic. Variance is deliberately "Offset Asymmetric" (6/10) — not chaos, but intentional tension in layout rhythms. Motion is "Fluid CSS" (5/10): purposeful spring physics on interactive elements, staggered reveals on lists, but no cinematic choreography — this is a focused learning tool, not a portfolio site.

The orange `#FF6B35` umbrella brand anchors every screen as the single accent thread. Phase categories (emerald/rose/amber/violet) are semantic signals, not decorative — they encode meaning (Foundation/Keyword/Campaign/Optimization) and must never bleed into random decorative use.

---

## 2. Color Palette & Roles

### Brand Palette

| Token | Hex | oklch | Role |
|---|---|---|---|
| **Ember Orange** | `#FF6B35` | `oklch(0.65 0.19 40)` | Umbrella brand — CTAs, active states, focus rings, primary buttons. Single accent. Saturation ~19% C — warm, not garish. |
| **Warm Charcoal** | `#18181B` | `oklch(0.145 0.01 275)` | Primary text on light backgrounds. Near-black with subtle warm undertone — never flat `#000000`. |
| **Steel Ink** | `#3F3F46` | `oklch(0.6 0.015 275)` | Secondary text — descriptions, metadata, helper text. |

### Semantic Phase Colors

| Phase | Hex | oklch | Role |
|---|---|---|---|
| **Phase 1 Emerald** | `#22C55E` | `oklch(0.7 0.17 145)` | Foundations — keyword research, campaign structure |
| **Phase 2 Rose** | `#F43F5E` | `oklch(0.65 0.2 15)` | Keyword targeting — exact/phrase/auto strategies |
| **Phase 3 Amber** | `#F59E0B` | `oklch(0.75 0.17 70)` | Bid management — adjustments, rules, budgeting |
| **Phase 4 Violet** | `#8B5CF6` | `oklch(0.65 0.2 290)` | Optimization — ASIN targeting, negative keywords |

### Surface System

| Token | Light | Dark | Role |
|---|---|---|---|
| **Canvas** | `oklch(0.98 0.003 275)` | `oklch(0.15 0.05 265)` | Page background — warm off-white light, deep navy dark |
| **Card** | `oklch(0.99 0.002 275)` | `oklch(0.17 0.05 265)` | Container fill — slightly brighter than canvas |
| **Muted** | `oklch(0.955 0.005 275)` | `oklch(0.25 0.03 265)` | Subtle surfaces — hover states, badges |
| **Border** | `oklch(0.9 0.005 275)` | `oklch(0.28 0.03 265)` | Structural lines — card borders, dividers |

### Chart Colors

| Token | oklch | Role |
|---|---|---|
| **Chart 1** | `oklch(0.65 0.19 40)` | Orange (Ember) — primary metrics |
| **Chart 2** | `oklch(0.75 0.17 70)` | Amber (Phase 3) — secondary metrics |
| **Chart 3** | `oklch(0.7 0.15 50)` | Light orange — tertiary |
| **Chart 4** | `oklch(0.6 0.12 30)` | Dark orange — quaternary |
| **Chart 5** | `oklch(0.75 0.14 55)` | Yellow-orange — quinary |

### Interaction States

| State | Color | Role |
|---|---|---|
| **Destructive** | `oklch(0.55 0.22 25)` | Error — failed actions, negative metrics |
| **Success** | `#22C55E` | Positive confirmation — pass badges, completed checkpoints |
| **Warning/Accent** | `oklch(0.75 0.17 70)` | Caution — phase amber, warnings |

---

## 3. Typography Rules

- **Display / Headlines:** Geist Sans — track-tight (-0.02em letter-spacing), weight-driven hierarchy (700 for h1, 600 for h2, 500 for h3). Size via `clamp()` for responsive scaling. Never uppercase.
- **Body:** Geist Sans — 400/400 weight, 1.5 line-height, `max-width: 65ch` for readability. Secondary text color (`Steel Ink`) for descriptions.
- **Mono / Data:** Geist Mono — code snippets, quiz answer feedback, metric labels. Tabular-nums for all numeric data (`.stat-value` class).
- **Labels / Badges:** Geist Sans — 500 weight, 0.75rem, tracking +0.02em. Use `.apple-badge` for pill-style labels.

### Font Bans
- **Inter** — BANNED. Replaced by Geist Sans (already in globals.css as `--font-sans`).
- **Generic serifs** (Times New Roman, Georgia, Garamond) — BANNED. This is a dashboard/learning tool. No serif anywhere.
- **System-ui defaults** — BANNED in premium contexts.

### Type Scale
```
Display:  clamp(2.5rem, 5vw, 4rem)   / 700 weight
H1:       clamp(2rem, 4vw, 3rem)     / 700 weight
H2:       clamp(1.5rem, 3vw, 2rem)   / 600 weight
H3:       clamp(1.25rem, 2vw, 1.5rem) / 600 weight
Body:     1rem                        / 400 weight
Small:    0.875rem                    / 400 weight
Caption:  0.75rem                     / 500 weight
Mono:     0.875rem                    / 400 weight
```

---

## 4. Component Stylings

### Buttons
- **Primary:** `bg-[oklch(0.65_0.19_40)] text-white rounded-xl px-5 py-2.5 font-medium`. Active: `-1px translateY` tactile press, no glow. Hover: `brightness-110` subtle lift.
- **Secondary/Ghost:** `bg-muted text-foreground rounded-xl px-5 py-2.5 font-medium border border-border`. Active: same -1px press.
- **Destructive:** `bg-[oklch(0.55_0.22_25)] text-white rounded-xl px-5 py-2.5 font-medium`.
- **Never:** neon outer glow, gradient fills, custom mouse cursors, AI copywriting labels ("Unlock Now", "Supercharge").

### Cards
- Use `.surface-card` class (already in globals.css): `border-radius: 16px`, tinted shadow, hover lift `-1px translateY`.
- Use ONLY when elevation communicates hierarchy. For dense data tables, replace with border-top dividers.
- Phase-specific cards: phase color tint on left border (`border-l-4 border-[phase-color]`).

### Phase Lock Overlay
- Locked phase header: `bg-black/30 backdrop-blur-sm` overlay spanning the phase banner.
- Lock icon: `Lock` from Lucide, `w-5 h-5 text-foreground`.
- "Locked" badge: `apple-badge` with `.apple-badge` styling — subtle pill.
- "Complete Phase N-1 checkpoint to unlock" — body text in `Steel Ink`.
- "Take checkpoint →" CTA: ember orange link, no button styling.

### Quiz Cards
- Pass result: `bg-emerald-500/10 border-emerald-200 text-emerald-700` — subtle green tint, not garish.
- Fail result: `bg-red-500/10 border-red-200 text-red-700` — subtle red tint.
- Score display: mono font, large `stat-value`.

### Progress Badges (Dashboard "Your Journey")
- **Passed:** `bg-emerald-500/10 text-emerald-700 border border-emerald-200` with `CheckCircle2` icon — soft green pill.
- **Locked:** `bg-muted text-muted-foreground border border-border` with `Lock` icon — neutral gray pill.
- Phase card background: phase color at 5% opacity (`bg-[phase-color]/5`).

### Inputs / Forms
- Label above input, never floating labels.
- `bg-background border border-border rounded-xl px-4 py-2.5 w-full`.
- Focus ring: `2px solid oklch(0.65 0.19 40)` ring offset.
- Error: red border + inline error text below field.

### Loaders
- Skeletal shimmer matching exact layout dimensions — no circular spinners.
- Shimmer animation: `background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.4), transparent)` with 1.5s infinite.

### Empty States
- Centered composition with contextual icon + headline + description + CTA.
- Never: "No data available" plain text only.

---

## 5. Layout Principles

### Grid Architecture
- CSS Grid primary, Flexbox for alignment only.
- Max-width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- No flexbox percentage math (`flex-1 min-w-0 calc(50% - 1rem)` — never do this).

### Section Rhythm
- Vertical section gaps: `clamp(3rem, 8vw, 6rem)` — generous breathing room.
- Dense sections (quiz results, data tables): `gap-8` or `gap-6`.
- Light sections (hero, CTA): `gap-12` or `gap-16`.

### Hero / Landing Layout
- Asymmetric split: left text column (60%) + right visual column (40%).
- Centered Hero is BANNED — variance exceeds 4.
- Inline image typography: small contextual visuals embedded within headline text zones — NOT floating overlapping elements.
- Max 1 primary CTA. No secondary "Learn more" links.

### Dashboard Layout
- Left sidebar navigation (desktop), collapsible on mobile.
- Main content area: `max-w-5xl` centered.
- "Your Journey" section: 4-column grid on desktop → 2-column on tablet → 1-column on mobile.
- Phase cards maintain visual hierarchy through color tinting, not card elevation.

### Responsive Collapse
- Below 768px: all multi-column layouts collapse to single column. No exceptions.
- Mobile-first: design mobile first, add desktop complexity as enhancement.
- Touch targets: all interactive elements minimum `44px × 44px`.
- Horizontal overflow on mobile = critical failure.

---

## 6. Motion & Interaction

### Spring Physics (Default)
- Primary curve: `cubic-bezier(0.32, 0.72, 0, 1)` — weighty, premium feel. Defined as `--ease-spring`.
- Exit curve: `cubic-bezier(0.19, 1, 0.22, 1)` — `--ease-out-expo`.
- All interactive elements: `transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1)`.

### Page-Level Animations
- Sections use `.apple-fade-in` class (globals.css): `translateY(24px) scale(0.98) → translateY(0) scale(1)`, 0.8s spring.
- Staggered delays: `.apple-fade-in-d1` (0.1s) through `.apple-fade-in-d5` (0.5s) on sibling elements.

### Interactive Micro-Interactions
- Button press: `-1px translateY` + shadow reduction on `:active`.
- Card hover: `-1px translateY` + shadow increase (`.surface-card:hover`).
- Sidebar nav item: background color fade + left border accent slide.
- Phase card unlock: subtle scale `1.02` pulse when newly unlocked.

### List Reveals
- Never mount lists instantly — stagger with `animation-delay` cascade (50ms between items).
- Use `animation-fill-mode: both` so items start invisible before animation begins.

### Performance Rules
- Animate ONLY `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`, `margin`, `padding`.
- Grain overlay uses `position: fixed` pseudo-element with `animation: grain-shift 8s steps(6) infinite` — GPU-accelerated, isolated.
- Mobile: respect `prefers-reduced-motion`. Use `@media (prefers-reduced-motion: reduce)` to disable non-essential animations.

---

## 7. Anti-Patterns (Banned)

### Typography
- No `Inter` font anywhere in the codebase — Geist Sans is the established replacement.
- No generic serif fonts (Times New Roman, Georgia, Garamond, Palatino).
- No pure black `#000000` — use `oklch(0.145 0.01 275)` Warm Charcoal.
- No excessive gradient text on large headers — single color only.
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Supercharge", "Unlock Your Potential".
- No `LABEL // YEAR` formatting ("METRICS // 2025", "SYSTEM // 2024").

### Visual
- No emojis in UI — use Lucide icons exclusively.
- No neon/outer glow shadows on buttons or cards.
- No oversaturated accent colors — Ember Orange is `oklch(0.65 0.19 40)` (saturation 19%), not screaming bright.
- No purple/blue neon aesthetic — purple reserved only for Phase 4 semantic role.
- No 3-column equal card feature rows — use asymmetric grids or 2-column zig-zag.
- No grain overlays outside of the `.grain-overlay` class — and that class uses SVG data URI only.

### Data / Content
- No fabricated data or statistics — if real data is not available, use `[metric]` placeholder labels. Never invent "99.9% uptime", "124ms avg response", "18.5k deploy cycles".
- No fake system metric dashboards — "KEY STATISTICS", "BY THE NUMBERS" sections filled with invented numbers are BANNED.
- No broken Unsplash images — use `picsum.photos` for placeholder images.
- No generic placeholder names — "John Doe", "Acme Corp", "Nexus Solutions".

### Navigation / UX
- No centered Hero sections — asymmetric split required (variance > 4).
- No "Scroll to explore", "Swipe down" filler text or bouncing chevron icons.
- No overlapping elements — every element occupies its own clear spatial zone.
- No horizontal scroll on mobile — hard failure.
- No secondary "Learn more" CTAs — maximum one primary CTA per section.
- No floating navigation overlap on content — use proper stacking context / z-index.

### Motion
- No linear easing anywhere — always spring or ease-out-expo.
- No animations on `top`, `left`, `width`, `height` — GPU-accelerated transforms only.
- No custom mouse cursors.
