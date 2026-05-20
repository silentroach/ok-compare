# Progress

## Current Step

Step 7 - Labelled mention URL boundary hardening.

## Active Wave

- `code-assist:012-entity-mention-graph:step-07:label-mention-url-encoding`
  - Artifact: `docs/decisions/012-entity-mention-graph/task-07-label-mention-url-encoding.md`
  - Goal: harden labelled mention URL replacement boundaries around URL-encoded destinations.

## Verification Notes

- Planner read the PDD context and all six task files.
- No code implementation started in planner mode.
- Task 01 was verified by finalizer: focused mention/markdown tests and `pnpm --filter @shelkovo/www typecheck` passed.
- Task 02 was verified by finalizer: focused markdown/mentions/load tests and `pnpm --filter @shelkovo/www typecheck` passed.
- Task 07 investigated `remark-parse`: `%40kschemelinin` remains raw in `node.url`; link node positions cover the whole markdown link, not a dedicated URL span.
- Task 07 RED: encoded labelled mention destination was silently ignored before the fix.
- Task 07 GREEN/REFACTOR: `linkDestinationOffsets` now finds the raw markdown destination end and has a decoded fallback for AST URLs; encoded `@...%...` labelled destinations fail clearly.
- Task 07 verification passed: `pnpm --filter @shelkovo/www test -- src/lib/mentions` and `pnpm --filter @shelkovo/www typecheck`.

## Completed Steps

- Step 1 - Neutral mention layer.
- Step 2 - Markdown pipeline integration.
- Step 7 - Labelled mention URL boundary hardening.
