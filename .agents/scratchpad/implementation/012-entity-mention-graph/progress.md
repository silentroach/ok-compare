# Progress

## Current Step

Step 3 - Source ref adapters.

## Active Wave

- `code-assist:012-entity-mention-graph:step-03:source-ref-adapters`
  - Artifact: `docs/decisions/012-entity-mention-graph/task-03-source-ref-adapters.md`
  - Goal: add neutral `EntityMentionSourceRef` plus source adapters and focused tests for news, status, and people mention sources.

## Verification Notes

- Planner read the PDD context and all six task files.
- No code implementation started in planner mode.
- Task 01 was verified by finalizer: focused mention/markdown tests and `pnpm --filter @shelkovo/www typecheck` passed.
- Task 02 was verified by finalizer: focused markdown/mentions/load tests and `pnpm --filter @shelkovo/www typecheck` passed.

## Completed Steps

- Step 1 - Neutral mention layer.
- Step 2 - Markdown pipeline integration.
