# Scratchpad

## 2026-05-20 Task 01

Implemented ADR-012 task 01 as a narrow extraction: generic parser/normalizer now lives in `apps/www/src/lib/mentions`, while `people/mentions.ts` maps person data to `EntityMentionTarget` and reuses the generic normalizer. Kept old person-specific fields on `PersonMentionTarget` for current discovery/schema consumers. Focused tests and typecheck pass.

## 2026-05-20 Finalizer Task 01

Re-read ADR-012 implementation context, progress, and task files. Task 01 is marked implemented and its focused verification passes again: `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/people/mentions.test.ts src/lib/markdown/render.test.ts` passed with 85 files / 519 tests, and `pnpm --filter @shelkovo/www typecheck` passed. Runtime task state is already closed/no ready tasks via `ralph tools task ready` and `ralph tools task list --format json`. Whole objective is not complete because Task 02-06 are still `Статус: не начат`, so finalizer should publish `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Task 02

Implemented the app Markdown pipeline part of ADR-012. The app wrapper now takes the neutral `mentions` option and returns generic entity mention targets. News/status loaders use `mention_registry`; people profile body passes `source_entity` so self-links fail in normalization for both canonical and labelled syntax. People discovery was adjusted to read generic `label` while preserving optional person context fields when present. Focused tests and app typecheck pass.

## 2026-05-20 Fresh-Eyes Review Task 02

Reviewed runtime task `task-1779291674-c365`, ADR-012 context, Task 02 artifact, and commit `e66571b`. Static review confirms `preprocessSiteMarkdown` no longer imports people-specific mention normalization, `RenderSiteMarkdownOptions` uses neutral `mentions`, news/status/people schemas expose generic mention targets, people profile normalization passes `source_entity`, and self-link validation runs inside `normalizeEntityMentions` for canonical and labelled replacements. Re-ran `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/mentions src/lib/people/load.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts` (85 files / 521 tests passed) and `pnpm --filter @shelkovo/www typecheck` (passed). No blockers found; publish `review.passed`.

## 2026-05-20 Finalizer Task 02

Handled `review.passed` for runtime task `task-1779291674-c365` at commit `e66571b`. Re-read ADR-012 context/progress and task files: Task 02 is implemented and checked, while Task 03-06 are still `Статус: не начат`, so the whole objective is not complete. Re-ran focused verification for Task 02: `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/mentions src/lib/people/load.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts` passed with 85 files / 521 tests, and `pnpm --filter @shelkovo/www typecheck` passed. Close Task 02 and publish `queue.advance` so Planner can create/advance the next ADR-012 step.

## 2026-05-20 Planner Queue Advance To Task 03

Handled `queue.advance` after Task 02 finalizer. Existing runtime queue had Task 01 and Task 02 closed and no open tasks. Updated implementation progress to Step 3 and ensured one current-wave runtime task: `task-1779292290-e963` / `code-assist:012-entity-mention-graph:step-03:source-ref-adapters`, backed by `docs/decisions/012-entity-mention-graph/task-03-source-ref-adapters.md`. Next event should be `tasks.ready` for Builder to implement source ref adapters only; Task 04-06 remain future steps.

## 2026-05-20 Task 03

Implemented ADR-012 source ref adapters only. `EntityMentionSourceRef` and source-level dedupe helper now live in `apps/www/src/lib/mentions`; news/status/people have local adapters and focused tests for presentation fields and duplicate target suppression. Existing `buildPeopleGraphDataset` remains on old domain backlinks for Task 04. Focused adapter tests and app typecheck pass.

## 2026-05-20 Fresh-Eyes Review Task 03

Reviewed runtime task `task-1779292290-e963`, ADR-012 context, Task 03 artifact, and commit `efb713a`. Static review confirms the generic mention layer only exposes neutral `EntityMentionSourceRef` plus source-level dedupe, while news/status/people own their adapters and presentation fields; the common layer does not import domain datasets; `buildPeopleGraphDataset` and the public people backlink shape remain unchanged for Task 04. Re-ran `pnpm --filter @shelkovo/www test -- src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts src/lib/mentions` (88 files / 527 tests passed), `pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts src/lib/people/discovery.test.ts` (88 files / 527 tests passed), and `pnpm --filter @shelkovo/www typecheck` (passed). No blockers found; publish `review.passed`.

## 2026-05-20 Finalizer Task 03

Handled `review.passed` for runtime task `task-1779292290-e963` at commit `efb713a`. Re-read ADR-012 implementation context, progress, Task 03, and future Task 04-06 files. Task 03 is implemented and checked, while Task 04-06 are still `Статус: не начат`, so the whole objective is not complete. Re-ran focused verification for Task 03: `pnpm --filter @shelkovo/www test -- src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts src/lib/mentions` passed with 88 files / 527 tests, and `pnpm --filter @shelkovo/www typecheck` passed. Runtime queue had only Task 03 in progress and no ready tasks before close. Close Task 03 and publish `queue.advance` so Planner can create/advance Task 04.

## 2026-05-20 Task 04

Implemented ADR-012 generic graph migration for people backlinks. Added `apps/www/src/lib/mentions/graph.ts` with target+section grouping, source-unit dedupe, ADR sorting, and defensive self-link errors. Migrated `buildPeopleGraphDataset` to accept generic `EntityMentionSourceRef[]`; `buildPeopleDataWithBacklinks` now gathers refs through news/status/people adapters and preserves the public `backlinks.news`, `backlinks.status`, and `backlinks.people` shape. Removed old source-specific backlink builders from `people/load.ts`. Focused graph/backlink tests and app typecheck pass.

## 2026-05-20 Fresh-Eyes Review Task 04

Reviewed runtime task `task-1779292897-9a70`, ADR-012 context/progress, Task 04 artifact, plan, and commit `35b3d53`. Static review confirms `EntityMentionGraph` is neutral, groups by target and source section, dedupes source units before inserting, sorts refs by ADR order, and defensively rejects self-link refs. `buildPeopleGraphDataset` now accepts generic `EntityMentionSourceRef[]`; `buildPeopleDataWithBacklinks` gathers refs through news/status/people adapters; `people/load.ts` no longer imports news/status datasets, status route helpers, or old private backlink builders; public `PersonBacklinks` shape is preserved. Re-ran `pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts` (89 files / 531 tests passed), `pnpm --filter @shelkovo/www typecheck` (passed), and `pnpm --filter @shelkovo/www test` (89 files / 531 tests passed). No blockers found; publish `review.passed`.

## 2026-05-20 Finalizer Task 04

Handled `review.passed` for runtime task `task-1779292897-9a70`. Re-read ADR-012 context, plan, progress, Task 04, and future Task 05-06 files. Task 04 is implemented and checked, while Task 05 and Task 06 are still `Статус: не начат`, so the whole objective is not complete. Re-ran finalizer verification for Task 04: `pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts` passed with 89 files / 531 tests, `pnpm --filter @shelkovo/www typecheck` passed, and `pnpm --filter @shelkovo/www test` passed with 89 files / 531 tests. Runtime task `task-1779292897-9a70` was the only open task and is now closed; no ready/open runtime tasks remain. Publish `queue.advance` so Planner can create/advance Task 05.

## 2026-05-20 Planner Queue Advance To Task 05

Handled `queue.advance` after Task 04 finalizer. Re-read ADR-012 context, plan, progress, Task 05 and Task 06. Runtime CLI showed no ready/open tasks, while prior tasks in `tasks.jsonl` were closed. Updated implementation progress to Step 5 and ensured the next current-wave runtime task: `code-assist:012-entity-mention-graph:step-05:cleanup-docs`, backed by `docs/decisions/012-entity-mention-graph/task-05-cleanup-docs.md`. Next event should be `tasks.ready` for Builder to perform boundary cleanup and agent-facing docs updates only; Task 06 remains the final regression step.

## 2026-05-20 Task 05

Implemented ADR-012 cleanup/docs only. Removed unused `normalizePeopleMentions` compatibility wrapper so `people/mentions.ts` is now only the person target/registry adapter. Updated `apps/www/AGENTS.md` to describe generic `src/lib/mentions`, `SiteMentionRegistry`, and source-owned ref adapters while preserving editorial person mention rules. Grep checks for people-only names, `render.ts`, people backlinks imports, and Markdown tables passed. `pnpm --filter @shelkovo/www test` passed with 89 files / 523 tests; `pnpm --filter @shelkovo/www typecheck` passed.

## 2026-05-20 Fresh-Eyes Review Task 05

Reviewed runtime task `task-1779293687-7f41`, ADR-012 context/progress, Task 05 artifact, and commit `f10770f`. Static review confirms `render.ts` imports only the generic mention layer, `people/mentions.ts` only adapts person profile fields to `EntityMentionTarget`, the `normalizePeopleMentions` compatibility wrapper is gone, news/status body mention options use `SiteMentionRegistry`, and `people/load.ts` no longer owns news/status source-ref construction. Grep checks show `PeopleMentionRegistry` and `PersonMentionTarget` remain only in the people adapter/domain loader surface and tests; no Markdown tables were added in the Task 05 docs directory. Re-ran `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/markdown src/lib/people/mentions.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts` (89 files / 523 tests passed), `pnpm --filter @shelkovo/www test` (89 files / 523 tests passed), and `pnpm --filter @shelkovo/www typecheck` (passed). No blockers found; publish `review.passed`.

## 2026-05-20 Finalizer Task 05

Handled `review.passed` for runtime task `task-1779293687-7f41` at commit `f10770f`. Re-read ADR-012 context, plan, progress, Task 05 and Task 06. Task 05 is implemented and checked, while Task 06 remains `Статус: не начат`, so the whole objective is not complete. Re-ran Task 05 finalizer verification: targeted grep confirmed people-only names remain confined to the people adapter/domain loader/tests, `render.ts` does not import `people/mentions`, `people/load.ts` has no news/status dataset or route helper backlink coupling, and no Markdown tables were added in the ADR-012 task docs. `pnpm --filter @shelkovo/www test` passed with 89 files / 523 tests, and `pnpm --filter @shelkovo/www typecheck` passed. Close Task 05 and publish `queue.advance` so Planner can create/advance Task 06 final regression.

## 2026-05-20 Planner Queue Advance To Task 06

Handled `queue.advance` after Task 05 finalizer. Re-read ADR-012 context, plan, progress, Task 06, and runtime task state; no ready/open runtime tasks existed. Updated implementation progress to Step 6 and ensured one current-wave runtime task: `task-1779294265-f2f1` / `code-assist:012-entity-mention-graph:step-06:final-regression`, backed by `docs/decisions/012-entity-mention-graph/task-06-final-regression.md`. Next event should be `tasks.ready` for Builder to perform final regression, targeted grep, review, full workspace checks, minimal fixes if needed, task checklist update, and commit. This is the final numbered step in the plan.

## 2026-05-20 Task 06

Performed ADR-012 final regression for runtime task `task-1779294265-f2f1`. Read ADR/context/task files and apps/www instructions, reviewed commits `8c52aa1` through `f10770f`, and checked targeted grep boundaries. No implementation regressions found: generic mentions stay in `apps/www/src/lib/mentions`, app body markdown uses the generic wrapper, self-link validation is covered at normalization, refs are source-owned, the graph stays dataset-neutral, and public people backlinks shape is preserved. Full workspace verification passed: `pnpm test`, `pnpm typecheck`, and `pnpm build`. Updated Task 06/progress/context docs and committed `Verify entity mention graph implementation`.

## 2026-05-20 Fresh-Eyes Review Task 06

Reviewed runtime task `task-1779294265-f2f1`, ADR-012 context/progress/task files, ADR-001, ADR-003, Task 06 artifact, and commit `6be6ac6`. Static review found no blocking regressions: Task 06 commit only marks final docs/checklists complete, previous task files are checked, recent commits are separate, generic mention code remains in `apps/www/src/lib/mentions`, `render.ts` imports the generic mention layer, source refs are owned by news/status/people adapters, `people/load.ts` builds backlinks from generic refs without news/status dataset or route-helper backlink coupling, and public people backlinks shape is preserved. Targeted grep showed `PeopleMentionRegistry` and `PersonMentionTarget` confined to people adapter/domain/test boundaries; direct `@shelkovo/markdown` app imports are low-level helpers or the app wrapper. Re-ran `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/markdown src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts` (89 files / 523 tests passed), `pnpm test` (passed), `pnpm typecheck` (passed), and `pnpm build` (passed, produced `dist/www`). No blockers found; publish `review.passed`.

## 2026-05-20 Finalizer Task 06

Handled `review.passed` for runtime task `task-1779294265-f2f1` at commit `6be6ac6`. Re-read ADR-012 context, ADR-001, ADR-003, ADR-012, plan, progress, apps/www instructions, and all task files. All six planned steps are complete in `progress.md`; all task files are marked implemented/done with accepted checklists; recent commits contain the six isolated implementation steps. Runtime state had only Task 06 in progress and no ready tasks before closure. Re-ran targeted boundary grep: people-only registry/target names remain in people adapter/domain/tests; `people/load.ts` has no `statusIncidentMarkdownUrl`, `NewsDataset`, or `StatusDataset`; app direct `@shelkovo/markdown` imports are low-level helpers or the app wrapper; no generic entities API/feed was found. Re-ran full verification: `pnpm test` passed, `pnpm typecheck` passed, and `pnpm build` passed producing `dist/www`. Whole objective `Давай реализуем с тобой docs/decisions/012-entity-mention-graph/` is complete, so close Task 06 and publish `LOOP_COMPLETE`.
