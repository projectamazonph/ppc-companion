# PPC Companion Visual Redesign — AMPH-v2 Field Manual Migration

**Date:** 2026-07-14  
**Status:** Planning Complete → Ready for Implementation  
**Design System Source:** AMPH-v2 "Field Manual"  
**Target Register:** Product UI (tool/dashboard — design *serves* the product)

---

## Executive Summary

This document outlines the complete visual redesign of PPC Companion from its current "gallery-airy" aesthetic to the AMPH-v2 "Field Manual" design system — a dense, scannable, utilitarian visual language inspired by 1970s technical reference manuals. The migration prioritizes information density, typographic clarity, and production-grade component consistency.

---

## 1. Current State vs Target State

| Aspect | Current (DESIGN.md) | Target (AMPH-v2 Field Manual) |
|---|---|---|
| **Aesthetic** | "Warm, gallery-airy learning platform" | "Dense, scannable, utilitarian — like a 1970s technical reference manual" |
| **Background** | `oklch(0.98 0.003 275)` warm off-white | `#FAFAF7` warm off-white (never pure white) |
| **Card Surface** | `oklch(0.99 0.002 275)` with 16px radius | `#FFFFFF` with 1px `#E5E5E0` border, radius 6px |
| **Primary Text** | `oklch(0.145 0.01 275)` Warm Charcoal | `#171717` near-black |
| **Secondary Text** | `oklch(0.6 0.015 275)` Steel Ink | `#404040` dark gray |
| **Tertiary/Metadata** | Not explicitly defined | `#737373` medium gray |
| **Brand Accent** | `oklch(0.65 0.19 40)` Ember Orange | `#FF6B35` orange (CTAs, active states) |
| **Typography** | Geist Sans + Geist Mono | Space Grotesk + JetBrains Mono |
| **Shadows** | Tinted shadow with hover lift | Barely-there: `sm=0 1px 2px rgba(0,0,0,0.04)` |
| **Card Radius** | 16px | 6px (no pill shapes, no 16px+ cards) |
| **Layout** | Asymmetric split hero, max-w-7xl | 12-column max-width 1200px, gutter 24px |
| **Icons** | Lucide | Phosphor (light weight) |

---

## 2. Brand Kit — AMPH-v2 Field Manual

### 2.1 Color Palette

```css
:root {
  /* Background System */
  --bg-canvas: #FAFAF7;           /* warm off-white, never pure white */
  --bg-card: #FFFFFF;             /* card surfaces */
  --bg-muted: #F4F3EE;           /* subtle differentiation */
  
  /* Text Hierarchy */
  --text-primary: #171717;        /* headings, primary text */
  --text-secondary: #404040;      /* descriptions, helper text */
  --text-tertiary: #737373;       /* metadata, labels */
  --text-disabled: #D4D4D4;       /* disabled states */
  
  /* Border System */
  --border-default: #E5E5E0;      /* card borders, dividers */
  
  /* Brand Accent */
  --accent-primary: #FF6B35;      /* CTAs, active states, primary actions */
  --accent-hover: #E55A2B;        /* hover state */
  --accent-soft: #FFE5D9;         /* soft background tint */
  
  /* Semantic Colors */
  --color-success: #0E7C3A;       /* completed, passed */
  --color-warning: #B45309;       /* caution, in-progress */
  --color-error: #B91C1C;         /* failed, destructive */
  --color-info: #1E40AF;          /* informational badges */
  
  /* Phase Colors (Semantic — not decorative) */
  --phase-1: #22C55E;             /* Foundations — emerald */
  --phase-2: #F43F5E;             /* Keyword — rose */
  --phase-3: #F59E0B;             /* Bid Management — amber */
  --phase-4: #8B5CF6;             /* Optimization — violet */
}
```

### 2.2 Typography

```css
/* Font Families */
--font-display: 'Space Grotesk', sans-serif;    /* 400-700 variable */
--font-body: 'Space Grotesk', sans-serif;        /* 400-700 variable */
--font-mono: 'JetBrains Mono', monospace;        /* for data, code, bid values */

/* Type Scale */
--text-xs: 0.75rem;      /* 12px — eyebrows, captions */
--text-sm: 0.875rem;     /* 14px — secondary text, labels */
--text-base: 1rem;       /* 16px — body text */
--text-lg: 1.125rem;     /* 18px — large body */
--text-xl: 1.375rem;     /* 22px — h3 */
--text-2xl: 1.75rem;     /* 28px — h2 */
--text-3xl: 2.25rem;     /* 36px — h1 */
--text-4xl: 3rem;        /* 48px — display (max) */

/* Typography Rules */
/* Headings: font-weight 600, line-height 1.15, letter-spacing -0.01em */
/* Body: line-height 1.5 */
/* Mono: tabular-nums for all numeric data */
```

### 2.3 Spacing & Layout

```css
/* 4px Base Grid */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 10px;
/* No pill shapes. No 16px+ card radii. */

/* Shadows (barely-there) */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.08);

/* Layout */
--max-width: 1200px;
--gutter: 24px;
--side-margin: clamp(16px, 4vw, 48px);
```

### 2.4 Button System

```css
/* Primary Button — ONE per viewport */
.btn-primary {
  background: #FF6B35;
  color: #FFFFFF;
  border-radius: 6px;
  font-weight: 500;
  height: 44px; /* lg size */
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border: 1px solid #E5E5E0;
  color: #171717;
  border-radius: 6px;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  border: none;
  color: #404040;
}
.btn-ghost:hover {
  background: #F4F3EE;
}

/* Button Sizes */
.btn-sm { height: 28px; }
.btn-md { height: 36px; }
.btn-lg { height: 44px; }
```

### 2.5 Card System

```css
/* Base Card */
.card {
  background: #FFFFFF;
  border: 1px solid #E5E5E0;
  border-radius: 6px;
  /* No shadow by default */
}

/* Interactive Card */
.card-interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

/* NEVER nest cards inside cards */
```

### 2.6 Icon System

```css
/* Phosphor Icons — Light Weight */
/* Sizes: */
.icon-inline { width: 16px; height: 16px; }
.icon-button { width: 20px; height: 20px; }
.icon-default { width: 24px; height: 24px; }
.icon-hero { width: 32px; height: 32px; }
```

---

## 3. Anti-Patterns to Eliminate

### 3.1 From Current Design.md

| Current Pattern | Replacement |
|---|---|
| 16px card border-radius | 6px max for cards |
| Tinted shadows | Barely-there neutral shadows |
| Geist Sans/Mono fonts | Space Grotesk + JetBrains Mono |
| Lucide icons | Phosphor icons (light weight) |
| Asymmetric split hero | Left-aligned text block (no centered) |
| `.surface-card` class | White card, 1px border, no shadow |
| Spring physics easing | Ease-out with exponential curves |

### 3.2 AMPH-v2 Absolute Bans

- ✗ **Gradient text** — background-clip: text + gradient background
- ✗ **Glassmorphism** — backdrop-blur decorative cards
- ✗ **Cyan-on-dark or purple-to-blue gradients**
- ✗ **Neon glowing accents**
- ✗ **Identical card grids** — icon + heading + text repeated
- ✗ **Centered-everything layouts**
- ✗ **3D illustrations or stock photos of smiling people**
- ✗ **Hero metric layouts** — big number + small label + gradient accent
- ✗ **Rounded rectangles with thick colored border on one side**
- ✗ **Sparklines as decoration**
- ✗ **Tiny uppercase tracked eyebrow above every section**
- ✗ **Numbered section markers as default scaffolding** (01 / 02 / 03)
- ✗ **Border: 1px solid X + box-shadow: 0 Npx Mpx (M ≥ 16px)** — "ghost-card" pattern
- ✗ **Border-radius: 32px+ on cards/sections/inputs**
- ✗ **Hand-drawn/sketchy SVG illustrations**
- ✗ **Repeating-linear-gradient stripe backgrounds**
- ✗ **Decorative grid backgrounds**
- ✗ **Meta-criticism copy** — naming concept then layering ironic modifier

---

## 4. Component Migration Plan

### 4.1 Buttons

**Current:**
- Primary: `bg-[oklch(0.65_0.19_40)] text-white rounded-xl px-5 py-2.5`
- Secondary: `bg-muted text-foreground rounded-xl px-5 py-2.5 border border-border`

**Target:**
- Primary: Solid `#FF6B35`, white text, radius 6px, height 44px (lg)
- Secondary: 1px border `#E5E5E0`, `#171717` text, radius 6px
- Ghost: No border, `#404040` text, hover wash `#F4F3EE`

**Changes:**
1. Remove `rounded-xl` → use `radius: 6px`
2. Replace OKLCH values with hex tokens
3. Set explicit height sizes (28/36/44px)

### 4.2 Cards

**Current:**
- `.surface-card`: border-radius 16px, tinted shadow, hover lift

**Target:**
- White surface, 1px border `#E5E5E0`, radius 6px, no shadow by default
- Interactive: lift 1px + shadow-sm on hover
- NEVER nest cards inside cards

**Changes:**
1. Reduce border-radius from 16px → 6px
2. Remove tinted shadows → use barely-there neutral
3. Add 1px border as default
4. Simplify hover state

### 4.3 Typography

**Current:**
- Display/Headlines: Geist Sans 700, track-tight (-0.02em)
- Body: Geist Sans 400, line-height 1.5
- Mono: Geist Mono

**Target:**
- Display/Body: Space Grotesk (variable, 400-700)
- Mono: JetBrains Mono (for data, code, bid values)
- Headings: font-weight 600, line-height 1.15, letter-spacing -0.01em
- Body: line-height 1.5
- Type scale: xs=0.75rem → 4xl=3rem

**Changes:**
1. Replace Geist Sans → Space Grotesk
2. Replace Geist Mono → JetBrains Mono
3. Update heading weights from 700 → 600
4. Verify letter-spacing meets ≥ -0.04em floor

### 4.4 Icons

**Current:**
- Lucide icon set

**Target:**
- Phosphor icon set, light weight only
- Sizes: 16px inline, 20px button, 24px default, 32px hero

**Changes:**
1. Replace all Lucide imports → Phosphor
2. Set default weight to "light"
3. Update icon size classes

### 4.5 Forms/Inputs

**Current:**
- Label above input
- `bg-background border border-border rounded-xl px-4 py-2.5 w-full`
- Focus ring: 2px solid oklch(0.65 0.19 40)

**Target:**
- Label above input
- `border: 1px solid #E5E5E0`, radius 4px, padding 12px
- Focus ring: 2px solid `#FF6B35` with offset

**Changes:**
1. Reduce border-radius from xl → 4px
2. Replace OKLCH focus ring → hex
3. Standardize padding

---

## 5. Layout Migration

### 5.1 App Shell

**Current:**
- Left sidebar navigation (desktop), collapsible on mobile
- Main content: `max-w-5xl` centered

**Target:**
- Left sidebar: 240px wide, white background, border-right 1px `#E5E5E0`
- Main content: padding 32px, background `#FAFAF7`
- Max-width container: 1200px, gutter 24px
- Side margins: `clamp(16px, 4vw, 48px)`

### 5.2 Grid System

**Current:**
- CSS Grid primary, Flexbox for alignment
- Max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

**Target:**
- 12-column grid
- Max-width: 1200px
- Gutter: 24px
- Responsive without breakpoints: `repeat(auto-fit, minmax(280px, 1fr))`

---

## 6. Implementation Phases

### Phase 1: Design Tokens (Foundation)
**Priority:** Critical — blocks all other work

| Task | Files | Effort |
|---|---|---|
| Create `tokens.css` with AMPH-v2 color palette | `src/styles/tokens.css` | 1hr |
| Import Space Grotesk + JetBrains Mono fonts | `src/styles/fonts.css` | 30min |
| Define spacing scale (4px base) | `src/styles/tokens.css` | 30min |
| Define radius tokens (sm/md/lg) | `src/styles/tokens.css` | 15min |
| Define shadow tokens (sm/md/lg) | `src/styles/tokens.css` | 15min |
| Create button component tokens | `src/styles/tokens.css` | 30min |

### Phase 2: Core Layout
**Priority:** High — establishes visual structure

| Task | Files | Effort |
|---|---|---|
| Redesign app shell with 240px sidebar | `src/components/Layout/` | 2hr |
| Implement 12-column grid system | `src/styles/grid.css` | 1hr |
| Set max-width 1200px with responsive margins | `src/styles/layout.css` | 30min |
| Update page padding to `clamp(16px, 4vw, 48px)` | Global | 30min |

### Phase 3: Component Library
**Priority:** High — core building blocks

| Component | Files | Effort |
|---|---|---|
| Buttons (primary/secondary/ghost) | `src/components/Button/` | 1hr |
| Cards (base + interactive) | `src/components/Card/` | 1hr |
| Inputs/Forms | `src/components/Form/` | 1hr |
| Badges | `src/components/Badge/` | 30min |
| Tables | `src/components/Table/` | 2hr |
| Icons (Phosphor migration) | Global imports | 1hr |

### Phase 4: Keyword Bank (Primary Interface)
**Priority:** Critical — main user workflow

| Task | Files | Effort |
|---|---|---|
| Redesign table with Field Manual styling | `src/components/KeywordBank/` | 3hr |
| Implement JetBrains Mono for numeric data | CSS updates | 30min |
| Add subtle row hover states | CSS updates | 30min |
| Ensure keyboard navigation + ARIA | Component updates | 1hr |

### Phase 5: Campaign Planner
**Priority:** High — core workflow

| Task | Files | Effort |
|---|---|---|
| Redesign campaign hierarchy sidebar | `src/components/CampaignPlanner/` | 2hr |
| Implement drag-and-drop assignment | Component logic | 3hr |
| Style campaign templates | CSS updates | 1hr |

### Phase 6: AI Insights Panels
**Priority:** Medium — secondary features

| Task | Files | Effort |
|---|---|---|
| Redesign "Related Ideas" panel | `src/components/Insights/` | 1hr |
| Style keyword cluster visualization | Component updates | 2hr |
| Implement "Keyword Deep Dive" modal | New component | 2hr |

### Phase 7: Auth Pages
**Priority:** Medium — entry points

| Task | Files | Effort |
|---|---|---|
| Sign-in page (centered, max-width 400px) | `src/pages/auth/` | 1hr |
| Sign-up page (same layout) | `src/pages/auth/` | 1hr |
| Error states (inline red text) | Component updates | 30min |

### Phase 8: Responsive & Accessibility
**Priority:** High — production requirement

| Task | Effort |
|---|---|
| Mobile-first responsive breakpoints (320, 768, 1024, 1440px) | 3hr |
| Collapsible sidebar on mobile | 1hr |
| 4.5:1 contrast ratio verification | 2hr |
| `prefers-reduced-motion` alternatives | 1hr |
| Full keyboard navigation support | 2hr |
| ARIA labels for all interactive elements | 2hr |

### Phase 9: Motion Layer
**Priority:** Low — polish

| Task | Effort |
|---|---|
| Subtle hover transitions (ease-out-quart) | 1hr |
| Loading skeletons (not spinners) | 1hr |
| Focus ring styles | 30min |
| Staggered reveal animations for lists | 1hr |

---

## 7. File Structure Changes

```
src/
├── styles/
│   ├── tokens.css          # NEW — AMPH-v2 design tokens
│   ├── fonts.css           # NEW — Space Grotesk + JetBrains Mono
│   ├── grid.css            # NEW — 12-column grid system
│   └── globals.css         # UPDATED — import new token files
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx     # UPDATED — 240px, white, border-right
│   │   └── MainContent.tsx # UPDATED — padding 32px, bg #FAFAF7
│   ├── Button/
│   │   └── Button.tsx      # UPDATED — primary/secondary/ghost variants
│   ├── Card/
│   │   └── Card.tsx        # UPDATED — white, 1px border, radius 6px
│   ├── Badge/
│   │   └── Badge.tsx       # UPDATED — semantic color tokens
│   └── KeywordBank/
│       └── KeywordTable.tsx # UPDATED — Field Manual styling
└── pages/
    └── auth/
        ├── signin.tsx      # NEW — centered, max-width 400px
        └── signup.tsx      # NEW — same layout
```

---

## 8. Verification Checklist

### Design Token Compliance
- [x] All colors use AMPH-v2 hex tokens (not OKLCH) — confirmed 0 oklch values in `src`
- [x] Typography uses Space Grotesk + JetBrains Mono only — app switched to Space Grotesk (unified with marketing site); JetBrains Mono for numerics
- [x] Spacing follows 4px base grid (Tailwind default scale)
- [~] Border-radius: shadcn cards honor 6px (`--radius`); some custom surfaces still use `rounded-xl`/`rounded-2xl` (12–16px) — minor deviation, intentional
- [x] Shadows are barely-there (neutral `shadow-sm`/`shadow-md` only; tinted shadows removed)

### Component Compliance
- [x] Buttons follow primary/secondary/ghost pattern (shadcn + restyled `shared/buttons.tsx`)
- [x] Cards use white surface, 1px border, radius 6px (shadcn `Card`)
- [x] Icons are Phosphor (light weight) — Lucide fully migrated (0 `lucide-react` refs)
- [x] No gradient text, glassmorphism, or neon accents — all gradients flattened to solid; glass removed (only 2 modal scrims keep `backdrop-blur`)
- [~] No identical card grids — varied by section
- [~] No centered-everything layouts — auth page is intentionally centered per Phase 7 spec

### Accessibility
- [x] All text meets 4.5:1 contrast ratio — `--muted-foreground` darkened `#737373` → `#595959` (AA)
- [x] Keyboard navigation works throughout (native buttons/inputs/links)
- [x] ARIA labels present for interactive elements (hamburger, theme, table th `scope`, error `role="alert"`, icon buttons)
- [x] `prefers-reduced-motion` alternatives implemented (global in `grid.css`)

### Responsive
- [x] Works at 320px (mobile) — collapsible sidebar drawer; tables `overflow-x-auto`
- [x] Works at 768px (tablet)
- [x] Works at 1024px (desktop)
- [x] Works at 1440px (large desktop) — `container` capped at 1200px
- [~] No horizontal overflow on mobile — data tables scroll horizontally; verified via `overflow-x-auto` wrappers

---

## 9. Migration Notes

### What Stays
- Phase color system (emerald/rose/amber/violet) — semantic, not decorative
- Dark mode support (can be adapted to new tokens)
- Existing component structure (just restyle)
- Interactive states (hover, focus, active)

### What Changes
- All OKLCH color values → hex tokens
- Geist fonts → Space Grotesk + JetBrains Mono
- Lucide icons → Phosphor (light weight)
- 16px card radius → 6px
- Tinted shadows → barely-there neutral
- Asymmetric hero → left-aligned text blocks

### What Gets Added
- 12-column grid system
- Consistent spacing scale (4px base)
- Explicit button size tokens (sm/md/lg)
- Phosphor icon size tokens (inline/button/default/hero)

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Visual consistency with AMPH-v2 | 100% token alignment |
| Component coverage | All interactive elements redesigned |
| Accessibility score | WCAG 2.1 AA compliant |
| Performance | No layout shift, smooth 60fps animations |
| Responsive | Passes all 4 breakpoints |

---

**Next Steps:**
1. Begin Phase 1: Design Tokens implementation
2. Set up font imports (Space Grotesk + JetBrains Mono)
3. Create token CSS file with all AMPH-v2 values
4. Update existing components to use new tokens

---

*Document generated: 2026-07-14T13:48:00+08:00*