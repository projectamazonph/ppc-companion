# Roadmap

## Delivery principle

Deliver risk-reducing vertical slices. Do not complete every layer horizontally before proving an end-to-end workflow.

## Phase 0: Foundation

- Confirm problem, users, success criteria, non-goals, and constraints.
- Make setup reproducible.
- Configure formatting, linting, type checking, tests, and CI.
- Establish environment and secret handling.
- Record the first architecture decisions.

**Exit condition:** a clean checkout can install, validate, test, and build through documented commands.

## Phase 1: Core vertical slice

- Implement the smallest complete user journey.
- Cover validation, authorization, business logic, persistence, feedback, and observability.
- Add unit, integration, and end-to-end tests.

**Exit condition:** the primary workflow works in a production-like environment and its critical failure paths are tested.

## Phase 2: Workflow completeness

- Add the highest-value adjacent workflows.
- Improve recovery, empty states, permissions, and operational visibility.
- Validate usability with representative users.

**Exit condition:** the product supports the agreed initial scope without manual workarounds for critical tasks.

## Phase 3: Hardening

- Resolve reliability, security, accessibility, and performance gaps.
- Verify migration, backup, rollback, and incident procedures where applicable.
- Remove obsolete experiments and dead code.

**Exit condition:** release gates and operational ownership are clear.

## Phase 4: Release and learning

- Release incrementally.
- Measure agreed product and engineering outcomes.
- Compare observed behavior with assumptions.
- Update the roadmap based on evidence rather than feature wishlists.
