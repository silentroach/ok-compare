# Progress

## Current Step

Step 1 - Add package Markdown AST API.

## Active Wave

- `code-assist:markdown-ast-generation:step-01:package-markdown-ast-api` -> `docs/tasks/markdown-ast-generation/01-package-markdown-ast-api.md`

## Verification Notes

- Planner read ADR-008, task README, and task files 01-10.
- `ralph tools task ready --format json` returned no ready runtime tasks before this wave was created.
- Builder started `task-1778857254-ea15` and implemented `docs/tasks/markdown-ast-generation/01-package-markdown-ast-api.md`.
- RED: `pnpm --filter @shelkovo/markdown test` failed on missing AST API exports after adding package tests.
- Dependency install initially hit `ERR_PNPM_NO_MATURE_MATCHING_VERSION` from workspace `minimumReleaseAge`; reran the add command with `--config.minimum-release-age=0` and recorded a fix memory.
- GREEN/REFACTOR: `pnpm --filter @shelkovo/markdown test` passed with 9 tests.
- Typecheck initially caught readonly extension arrays and an unused import; fixed them and recorded a fix memory.
- Final focused checks: `pnpm --filter @shelkovo/markdown typecheck` passed; `pnpm --filter @shelkovo/markdown test` passed.

## Completed Steps

- None.
