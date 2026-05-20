# Progress

## Current Step

Step 8 - Encoded URL boundary regression test.

## Active Wave

- `code-assist:012-entity-mention-graph:step-08:test-encoded-url-boundaries`
  - Artifact: `docs/decisions/012-entity-mention-graph/task-08-test-encoded-url-boundaries.md`
  - Goal: add focused regression coverage for encoded URL boundary behavior and empty mention handling.

## Verification Notes

- Planner read the PDD context and all six task files.
- No code implementation started in planner mode.
- Task 01 was verified by finalizer: focused mention/markdown tests and `pnpm --filter @shelkovo/www typecheck` passed.
- Task 02 was verified by finalizer: focused markdown/mentions/load tests and `pnpm --filter @shelkovo/www typecheck` passed.
- Task 07 investigated `remark-parse`: `%40kschemelinin` remains raw in `node.url`; link node positions cover the whole markdown link, not a dedicated URL span.
- Task 07 RED: encoded labelled mention destination was silently ignored before the fix.
- Task 07 GREEN/REFACTOR: `linkDestinationOffsets` now finds the raw markdown destination end and has a decoded fallback for AST URLs; encoded `@...%...` labelled destinations fail clearly.
- Task 07 verification passed: `pnpm --filter @shelkovo/www test -- src/lib/mentions` and `pnpm --filter @shelkovo/www typecheck`.
- Planner advanced queue after Task 07 closure and created Step 8 wave only.
- Task 08 finalizer confirmed the reviewed tests cover encoded target URLs and empty `@.` mentions, re-ran focused mentions tests and app typecheck, and closed runtime task `task-1779301044-be81`.

## Completed Steps

- Step 1 - Neutral mention layer.
- Step 2 - Markdown pipeline integration.
- Step 3 - Source ref adapters.
- Step 4 - Generic graph and people backlinks migration.
- Step 5 - Boundary cleanup and docs.
- Step 6 - Final regression and hardening.
- Step 7 - Labelled mention URL boundary hardening.
- Step 8 - Encoded URL boundary regression test.
