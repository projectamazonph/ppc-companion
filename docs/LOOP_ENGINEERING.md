# Loop Engineering

## Purpose

Use bounded build-test-observe-adjust loops to move **PPC Companion** forward without losing evidence, repeating failed guesses, or expanding scope accidentally.

## Required loop

1. Inspect the relevant requirement, code, tests, commands, and recent failures.
2. Define one observable objective and explicit acceptance criteria.
3. State the smallest testable hypothesis.
4. Write or update a failing test for behavioral changes. For documentation, configuration, or CI work, run the smallest relevant validator instead of inventing a meaningless unit test.
5. Make the smallest change that can satisfy the test or validator.
6. Run targeted checks and record the observation.
7. Run broader verification before declaring completion.
8. Refactor only while the relevant checks remain green.
9. Record the outcome, learning, blocker, and next action.

## Stop conditions

Stop and review instead of continuing blindly when:

- the configured iteration limit is reached
- the same failure signature appears three times
- a required dependency, credential, environment, or decision is unavailable
- the proposed change expands beyond the accepted scope
- a regression appears outside the intended behavior
- verification evidence conflicts with the current hypothesis

## Loop Orchestrator integration

When the Loop Orchestrator Skill is installed, initialize a resumable loop from the repository root:

```bash
python scripts/loopctl.py init \
  --target . \
  --objective "Implement the first verified vertical slice" \
  --acceptance "The primary workflow succeeds end to end" \
  --acceptance "Important failure paths return useful feedback" \
  --mode feature \
  --max-iterations 6 \
  --test-command "bun run test"
```

The companion skill stores machine-readable state in `.loop/` and a human-readable history in `docs/LOOP_LOG.md`.

## Evidence rules

- Never mark an unexecuted command as passed.
- Record the exact command when possible.
- Distinguish `passed`, `failed`, `blocked`, and `not applicable`.
- Preserve failure evidence that changes the next hypothesis.
- Do not use loop activity as proof of product value; acceptance criteria remain the completion boundary.
