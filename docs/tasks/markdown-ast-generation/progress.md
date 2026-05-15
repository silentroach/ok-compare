# Progress

## Current Step

Step 2 - Migrate section companion Markdown.

## Active Wave

- `code-assist:markdown-ast-generation:step-02:migrate-news-markdown` -> `docs/tasks/markdown-ast-generation/02-migrate-news-markdown.md`
- `code-assist:markdown-ast-generation:step-02:migrate-status-markdown` -> `docs/tasks/markdown-ast-generation/03-migrate-status-markdown.md`
- `code-assist:markdown-ast-generation:step-02:migrate-people-markdown` -> `docs/tasks/markdown-ast-generation/04-migrate-people-markdown.md`
- `code-assist:markdown-ast-generation:step-02:migrate-reglament-overview-full` -> `docs/tasks/markdown-ast-generation/05-migrate-reglament-overview-full.md`
- `code-assist:markdown-ast-generation:step-02:migrate-reglament-detail` -> `docs/tasks/markdown-ast-generation/06-migrate-reglament-detail.md`
- `code-assist:markdown-ast-generation:step-02:migrate-compare-markdown` -> `docs/tasks/markdown-ast-generation/07-migrate-compare-markdown.md`

## Verification Notes

- Planner read ADR-008, task README, and task files 01-10.
- `ralph tools task ready --format json` returned no ready runtime tasks before this wave was created.
- Builder started `task-1778857254-ea15` and implemented `docs/tasks/markdown-ast-generation/01-package-markdown-ast-api.md`.
- RED: `pnpm --filter @shelkovo/markdown test` failed on missing AST API exports after adding package tests.
- Dependency install initially hit `ERR_PNPM_NO_MATURE_MATCHING_VERSION` from workspace `minimumReleaseAge`; reran the add command with `--config.minimum-release-age=0` and recorded a fix memory.
- GREEN/REFACTOR: `pnpm --filter @shelkovo/markdown test` passed with 9 tests.
- Typecheck initially caught readonly extension arrays and an unused import; fixed them and recorded a fix memory.
- Final focused checks: `pnpm --filter @shelkovo/markdown typecheck` passed; `pnpm --filter @shelkovo/markdown test` passed.
- Reviewer verified Step 1 and published `review.passed`; Finalizer chose `queue.advance` because task files 02-10 remain incomplete.
- Planner advanced to Step 2 because the Step 1 runtime task is closed and no open runtime tasks remain.
- Builder started `task-1778857949-fa3c` and migrated `apps/www/src/lib/news/markdown.ts` to `@shelkovo/markdown` AST generation.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts` failed on nested YAML frontmatter from article/addendum Markdown fragments being emitted by the old string generator.
- GREEN/REFACTOR: news Markdown tests were updated for package serializer output; body and addenda now use `parseMarkdownFragment`, article frontmatter uses `createMarkdownDocument` frontmatter, and section Markdown uses mdast nodes.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts` passed; `pnpm --filter @shelkovo/www typecheck` passed.

## Completed Steps

- Step 1 - Add package Markdown AST API.
