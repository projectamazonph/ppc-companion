# Changelog

Record user-visible and operationally meaningful changes. Use semantic versioning when the project begins releasing versions.

## Unreleased

### Added

- Project foundation and engineering documentation created on 2026-07-13.
- Dashboard "Continue Learning" section with course cards, phase-colored headers, progress bars, and Resume/Start CTAs.
- Dashboard "Recent Activity" feed showing quiz completions and exercise activity.
- Dashboard "Your Journey" sidebar with 4-phase status list and user highlight card.
- Dashboard stat cards: Course Progress (%), Day Streak, Badges Earned, Total Points (XP).
- Dashboard search bar integrated into hero greeting area.
- `docs/DASHBOARD_REFACTOR_LOG.md` — detailed refactor rationale and stitch-design mapping.

### Changed

- **Dashboard UI completely rebuilt** to match stitch-designs/dashboard.html structure. Replaced 650-line component (hero blobs, shadcn Card/Badge/Progress, Recharts bar charts, roadmap section) with 480-line component matching stitch layout: greeting + search, 4 stat cards, Continue Learning cards, Recent Activity feed, Your Journey sidebar. Brand identity preserved (Ember Orange, Geist Sans, Lucide icons, oklch tokens).
- `package.json`: jsdom downgraded from ^29.1.1 to ^25.0.1 ( bun install fix ).

### Fixed

- Fixed `bun install` failure caused by jsdom@^29.1.1 not resolving.
