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
- Builder started `task-1778857949-1033` and migrated `apps/www/src/lib/status/markdown.ts` to `@shelkovo/markdown` AST generation.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/status/markdown.test.ts` failed on nested YAML frontmatter from `incident.body` being emitted by the old string generator.
- GREEN/REFACTOR: status Markdown tests were updated for package serializer output; incident frontmatter uses `createMarkdownDocument` frontmatter, incident bodies use `parseMarkdownFragment`, and service/incident lists preserve public Markdown links as mdast links.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/status/markdown.test.ts` passed; `pnpm --filter @shelkovo/www typecheck` passed.
- Builder started `task-1778857949-2594` and migrated people overview/detail Markdown generation to `@shelkovo/markdown` AST generation.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/people/view.test.ts -t "parses profile body as Markdown fragment without nested frontmatter"` failed on nested YAML frontmatter from `profile.body` being emitted by the old string generator.
- GREEN/REFACTOR: people Markdown tests were updated for package serializer output; profile bodies now use `parseMarkdownFragment`, and overview/detail links are generated as mdast links.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/people` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed and generated people Markdown routes.
- Builder started `task-1778857949-3d69` and migrated reglament overview/full Markdown generation to `@shelkovo/markdown` AST generation.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/reglament/markdown.test.ts` failed because the old string generators emitted bare URLs/source refs instead of mdast-owned Markdown links/autolinks.
- GREEN/REFACTOR: `apps/www/src/lib/reglament/markdown.ts` and `apps/www/src/lib/reglament/full-markdown.ts` now use `createMarkdownDocument`, `md`, and `serializeMarkdownDocument`; source refs, thematic files, status codes, formulas, ids, and public URLs are represented as mdast links/autolinks/inline code.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/reglament` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed and generated reglament Markdown routes.
- Builder started `task-1778857949-527e` and migrated `apps/www/src/lib/reglament/detail-markdown.ts` to `@shelkovo/markdown` AST generation for detail index, materials, machines, labor, and checks Markdown companions.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/reglament/detail-markdown.test.ts` failed because the old detail generator emitted bare detail URLs instead of package serializer-owned autolinks/topic links.
- GREEN/REFACTOR: detail Markdown tests were updated for package serializer output; detail documents now use `createMarkdownDocument`, `parseMarkdownFragment`, and `serializeMarkdownDocument`; source labels, quote items, grouped resources, totals, and `needs_check` markers remain represented in generated output.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/reglament/detail-markdown.test.ts` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed and generated detail Markdown routes.
- Real output spot checks: `dist/www/815/regulation/details.md`, `dist/www/815/regulation/details/materials.md`, `dist/www/815/regulation/details/machines.md`, `dist/www/815/regulation/details/labor.md`, and `dist/www/815/regulation/details/checks.md` preserved public links, source labels, quote items, grouped resources, control totals, and `needs_check` lines under serializer-owned Markdown formatting.
- Builder started `task-1778857949-676e` and migrated `apps/www/src/compare/lib/markdown.ts` to `@shelkovo/markdown` AST generation for home, rating, and settlement Markdown companions.
- RED: `pnpm --filter @shelkovo/www test -- src/compare/lib/markdown.test.ts` failed because the old compare generator emitted bare URLs/manual spacing while the new snapshots expected package serializer-owned Markdown links.
- GREEN/REFACTOR: compare Markdown tests now snapshot home, rating, and settlement detail output; discovery URLs stay under `/815/compare/`, source URLs serialize as package autolinks, and settlement facts/sources remain readable.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/compare/lib/markdown.test.ts` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed and generated Compare Markdown routes.

## Completed Steps

- Step 1 - Add package Markdown AST API.
