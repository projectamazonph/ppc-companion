# Build Specification

## Objective

Translate the product requirements for **PPC Companion** into small, testable implementation units.

## First vertical slice

Complete the primary user action through validation, business logic, persistence, feedback, logging, and automated tests.

Build one complete workflow that crosses the real system:

1. user or caller initiates the primary action
2. input is validated
3. identity and permissions are checked
4. business rules execute
5. data is read or written
6. the result is returned and displayed
7. meaningful failures are logged and recoverable
8. automated tests verify the happy path and important failure paths

## Acceptance criteria

- The primary user can complete the core job from start to finish.
- Invalid input produces specific, actionable feedback.
- Unauthorized actions are rejected server-side.
- Duplicate or retried requests do not create unintended results where applicable.
- Success and failure states are observable.
- Unit, integration, and end-to-end tests cover the slice proportionally.
- Documentation and commands match the implementation.

## Implementation units

### Interface

Define screens, routes, commands, events, or API entry points. Include loading, empty, error, disabled, and permission states where applicable.

### Validation

Define schemas, required fields, allowed values, limits, normalization, and user-facing error messages.

### Business logic

Keep rules explicit and independently testable. Separate policy from transport and persistence concerns.

### Data

Define entities, relationships, indexes, migrations, constraints, transaction boundaries, retention, and seed data.

### Integrations

Define contract, authentication, timeout, retry, idempotency, rate-limit, mock, and failure behavior for each external dependency.

### Observability

Define structured logs, metrics, traces, health checks, and alerts required to understand the workflow.

## Test-first sequence

1. Write acceptance criteria.
2. Add the smallest failing unit or integration test that proves the next behavior.
3. Implement the minimum passing change.
4. Run targeted tests and then the relevant suite.
5. Refactor while green.
6. Record the loop in `docs/LOOP_LOG.md` and `docs/BUILD_LOG.md` when it changes project understanding.
