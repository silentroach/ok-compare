# Progress

## Current Step

Step 3 - Migrate llms generators.

## Active Wave

- `code-assist:markdown-ast-generation:step-03:migrate-section-llms` -> `docs/tasks/markdown-ast-generation/08-migrate-section-llms.md`
- `code-assist:markdown-ast-generation:step-03:migrate-root-reglament-compare-llms` -> `docs/tasks/markdown-ast-generation/09-migrate-root-reglament-compare-llms.md` (blocked by Task 08 to preserve README order)

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
- Finalizer closed `task-1778857949-676e` and emitted `queue.advance` because Step 3 and Step 4 remain.
- Planner advanced to Step 3 because all Step 2 runtime tasks are closed and no open Step 2 work remains.
- Builder started `task-1778863094-8544` and migrated news, status, and people `llms.txt` / `llms-full.txt` generators to `@shelkovo/markdown` AST serialization via `createMarkdownDocument`, `parseMarkdownFragment`, and `serializeMarkdownDocument`.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/news/llms.test.ts src/lib/status/llms.test.ts src/lib/people/llms.test.ts` failed because old string generators emitted plain headings and bare URLs instead of serializer-owned headings/autolinks.
- GREEN/REFACTOR: added focused llms snapshots for section short agent overviews; full and short section llms outputs now share AST parse/create/serialize generation while preserving text and public URLs.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/news src/lib/status src/lib/people` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed.
- Real output spot checks read `dist/www/news/llms.txt`, `dist/www/status/llms.txt`, and `dist/www/people/llms.txt`; confirmed section headings, public feed/schema/OpenAPI/llms URLs, and no section-local `undefined`, `localhost`, `apps/www`, or `src/` leaks in changed llms outputs.
- Builder started `task-1778863102-179e` and migrated root, reglament, and Compare `llms.txt` / `llms-full.txt` generators to `@shelkovo/markdown` AST serialization via `createMarkdownDocument`, `parseMarkdownFragment`, and `serializeMarkdownDocument`.
- RED: `pnpm --filter @shelkovo/www test -- src/lib/llms.test.ts src/lib/reglament/llms.test.ts src/compare/lib/llms.test.ts` failed because old string generators emitted plain headings and bare URLs instead of serializer-owned headings/autolinks.
- GREEN/REFACTOR: added focused short llms snapshots for root, reglament, and Compare; kept `.txt` routes, content type, public feed/schema/OpenAPI/skills/example URLs, and agent-facing text semantics unchanged aside from serializer-owned formatting.
- Final focused checks: `pnpm --filter @shelkovo/www test -- src/lib/llms.test.ts src/lib/reglament src/compare/lib` passed; `pnpm --filter @shelkovo/www typecheck` passed; `pnpm --filter @shelkovo/www build` passed.
- Real output spot checks read `dist/www/llms.txt`, `dist/www/llms-full.txt`, `dist/www/815/regulation/llms.txt`, `dist/www/815/regulation/llms-full.txt`, `dist/www/815/compare/llms.txt`, and `dist/www/815/compare/llms-full.txt`; confirmed serializer-owned headings/autolinks and public discovery URLs. Leak check for `undefined`, `localhost`, `apps/www/src`, `http://`, and `legacy` in changed llms outputs found no matches.

## Completed Steps

- Step 1 - Add package Markdown AST API.
- Step 2 - Migrate section companion Markdown.
