# Testing Strategy

## Purpose

Tests protect behavior, shorten feedback loops, and make change safer. They are not a scorekeeping exercise.

## Required loop

1. Define observable behavior.
2. Write or update a failing test.
3. Confirm the failure is meaningful.
4. Implement the smallest passing change.
5. Run targeted tests and then broader checks.
6. Refactor only while green.

For unclear legacy behavior, add characterization tests before changing it.

## Test layers

### Unit tests

Test pure rules, transformations, validation, and small components. Keep them fast and deterministic.

### Integration tests

Test database behavior, service boundaries, authorization, migrations, queues, files, and external adapters using controlled environments.

### End-to-end tests

Cover a small number of critical user journeys and smoke checks. Avoid reproducing the entire unit suite through a browser.

### Contract tests

Use for important internal or external interfaces where independent change can break compatibility.

## Test data

- Use deterministic factories and fixtures.
- Keep production data out of tests.
- Make time, randomness, and external calls controllable.
- Reset or isolate state between tests.
- Keep seed data representative but minimal.

## Commands

- Unit and integration: `npx vitest run`
- End-to-end: `Not yet configured`
- Type checking: `npx tsc --noEmit`
- Linting: `bun run lint`
- Build: `bun run build`

> ⚠️ Use `npx vitest run` (node-based) instead of `bun run test`. The bun test runner has a known jsdom environment incompatibility on some systems. `npx vitest run` is what CI uses and works reliably across all platforms.

## Coverage policy

Prioritize business risk and branch behavior over a universal percentage. Critical rules, authorization, money or irreversible actions, migrations, and failure recovery require direct tests.

## CI behavior

Run cheap deterministic checks first, fail fast, publish useful failure output, and keep local commands aligned with CI.
