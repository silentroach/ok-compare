# Scratchpad

## 2026-05-20 Task 08 Finalizer

Finalizer reviewed Task 08 against `docs/decisions/012-entity-mention-graph/task-08-test-encoded-url-boundaries.md` and the current Step 8 plan/progress docs. The diff adds only focused tests in `apps/www/src/lib/mentions/mentions.test.ts`: an encoded target URL labelled mention that preserves adjacent text, plus an empty `@.` canonical mention failure test. Production normalization logic was not changed in this task.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/mentions` passed: 89 files, 527 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

Later planned steps remain: Step 9 through Step 13. Therefore finalizer should close Task 08 and emit `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Task 09 Builder

Active task: `task-1779301606-aa27` / `code-assist:012-entity-mention-graph:step-09:extract-content-helper`.

Implemented the shared loader body helper as `preprocessSiteMarkdownContent` in `apps/www/src/lib/markdown/render.ts`. The helper keeps the existing loader behavior: `trimEnd`, treat whitespace-only body as empty, run app-level entity mention preprocessing for non-empty content, and pass optional `source_entity` for people profile self-link validation.

Updated `news/load.ts`, `status/load.ts`, and `people/load.ts` to call the shared helper and removed their duplicate local `content` helpers.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/markdown` failed because `preprocessSiteMarkdownContent` was missing.
- GREEN: `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` passed, 89 files / 530 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Commit: `542ba4d` (`Extract shared content helper from domain loaders`). Focused tests and typecheck passed again after commit hook formatting.

## 2026-05-20 Task 09 Fresh-Eyes Critic

Reviewed `task-1779301606-aa27` / `code-assist:012-entity-mention-graph:step-09:extract-content-helper` against `docs/decisions/012-entity-mention-graph/task-09-extract-content-helper.md`, `progress.md`, and the changed files in commit `542ba4d`.

Findings: no rejection issues found. The diff is a focused extraction: `preprocessSiteMarkdownContent` lives in `apps/www/src/lib/markdown/render.ts`, keeps previous loader semantics (`trimEnd`, blank bodies become empty mention-free content, non-empty bodies use app-level mention preprocessing), and preserves people profile `source_entity` self-link validation. `news/load.ts`, `status/load.ts`, and `people/load.ts` now use the shared helper without public schema or dataset shape changes.

Verification re-run:

- `ralph tools task show task-1779301606-aa27 --format json` confirmed the runtime task is the expected Task 09 and is in progress.
- `git diff -- apps/www/src/lib/markdown/render.ts apps/www/src/lib/markdown/render.test.ts apps/www/src/lib/news/load.ts apps/www/src/lib/status/load.ts apps/www/src/lib/people/load.ts docs/decisions/012-entity-mention-graph/task-09-extract-content-helper.md` showed no uncommitted changes in the reviewed files.
- `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` passed: 89 files, 530 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/markdown/render.test.ts -t "passes source entity validation"` passed, confirming the extracted helper still routes `source_entity` to self-link rejection coverage.

Decision: publish `review.passed` for Task 09.

## 2026-05-20 Task 09 Finalizer

Finalizer re-read `docs/decisions/012-entity-mention-graph/task-09-extract-content-helper.md`, `context.md`, `plan.md`, and `progress.md`, plus runtime task `task-1779301606-aa27`. Task 09 acceptance criteria are satisfied: `preprocessSiteMarkdownContent` is exported from the app-level Markdown render layer, and `news/load.ts`, `status/load.ts`, and `people/load.ts` use it while preserving public schemas/dataset shapes and optional `mention_registry` opts.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` passed: 89 files, 530 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/markdown/render.test.ts -t "passes source entity validation"` passed, confirming the shared helper preserves `source_entity` validation.
- Grep confirmed `preprocessSiteMarkdownContent` is used from `news/load.ts`, `status/load.ts`, and `people/load.ts`, with no duplicate local `content` helper match in those loaders.

Runtime `ready` returned no currently ready tasks, but plan/progress show later steps remain incomplete: Step 10 through Step 13. Therefore close Task 09 and emit `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Step 10 Planner

Handled `queue.advance` after Task 09 closure. Re-read ADR-012 `plan.md`, `progress.md`, `context.md`, runtime tasks, and `task-10-harden-empty-registry.md`. Step 09 was fully closed, while Step 10 through Step 13 remain.

Advanced `progress.md` to Step 10 and ensured one current-step runtime task only:

- `task-1779302334-2658` / `code-assist:012-entity-mention-graph:step-10:harden-empty-registry`
- Artifact: `docs/decisions/012-entity-mention-graph/task-10-harden-empty-registry.md`

Ready queue now contains that single Step 10 task. Emit `tasks.ready` for Builder with the task id/key/artifact.

## 2026-05-20 Task 10 Builder

Active task: `task-1779302334-2658` / `code-assist:012-entity-mention-graph:step-10:harden-empty-registry`.

Implemented the empty registry hardening by removing shared `EMPTY_MENTION_REGISTRY` singletons from `apps/www/src/lib/news/load.ts` and `apps/www/src/lib/status/load.ts`. Each `build*Dataset` now allocates a fresh fallback `Map` only when `mention_registry` is omitted, preserving the public loader options and `SiteMentionRegistry` type.

Added regression tests in the existing news/status loader tests. The tests mock `preprocessSiteMarkdownContent` to mutate the provided fallback registry, then build a second dataset without `mention_registry`; old shared fallback behavior leaked the mutation into the second build, while the fresh fallback keeps the second body unchanged.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` failed on the new fallback-registry leak tests.
- GREEN: same focused command passed, 89 files / 532 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

Used `code-simplification` after implementation; no extra helper was added because direct fresh `new Map()` in each build function is the smallest clear expression of the behavior.

## 2026-05-20 Task 10 Fresh-Eyes Critic

Reviewed `task-1779302334-2658` / `code-assist:012-entity-mention-graph:step-10:harden-empty-registry` against `docs/decisions/012-entity-mention-graph/task-10-harden-empty-registry.md`, current `plan.md` / `progress.md`, and the changed news/status loader files.

Findings: no rejection issues found. The implementation removes the shared mutable `EMPTY_MENTION_REGISTRY` singletons from `apps/www/src/lib/news/load.ts` and `apps/www/src/lib/status/load.ts`, and each dataset builder now creates a fresh fallback `Map` only when `mention_registry` is omitted. Loader public options and `SiteMentionRegistry` remain unchanged. The added tests in `news/load.test.ts` and `status/load.test.ts` directly exercise accidental preprocessor mutation and a second no-registry build, which is the relevant regression risk for the chosen fresh-instance approach.

Verification re-run:

- `ralph tools task show task-1779302334-2658 --format json` confirmed the runtime task is the expected Step 10 task and is in progress.
- Focused diff review confirmed `EMPTY_MENTION_REGISTRY` was removed from news/status loaders and fallback allocation is local to `buildNewsDataset` / `buildStatusDataset`.
- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` passed: 89 files, 532 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: reran the fallback registry mutation test command with `-t "does not reuse the fallback mention registry between builds"`; Vitest still executed the focused loader suite and passed, confirming both mutation-regression tests pass in the current harness.

Decision: publish `review.passed` for Task 10.

## 2026-05-20 Task 10 Finalizer

Finalizer handled `review.passed` for `task-1779302334-2658` / `code-assist:012-entity-mention-graph:step-10:harden-empty-registry`. Re-read `docs/decisions/012-entity-mention-graph/task-10-harden-empty-registry.md`, `context.md`, `plan.md`, `progress.md`, app local instructions, and the runtime task state.

Task 10 acceptance criteria are satisfied: news/status loaders no longer use a shared mutable `EMPTY_MENTION_REGISTRY`, and both builders allocate a fresh fallback `Map` only when `mention_registry` is omitted. Public loader options and `SiteMentionRegistry` type are unchanged.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` passed: 89 files, 532 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts -t "does not reuse the fallback mention registry between builds"` passed, covering both fallback-registry mutation regression tests.
- Runtime ready queue was empty, but `plan.md` / `progress.md` show later planned steps remain: Step 11 through Step 13. Therefore close Task 10 and emit `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Step 11 Planner

Handled `queue.advance` after Task 10 closure. Re-read ADR-012 `context.md`, `plan.md`, `progress.md`, app local instructions, runtime ready/open queue, and `task-11-test-empty-registry-mutation.md`. Step 10 was fully closed, while Step 11 through Step 13 remain.

Advanced `progress.md` to Step 11 and ensured one current-step runtime task only:

- `task-1779302874-f141` / `code-assist:012-entity-mention-graph:step-11:test-empty-registry-mutation`
- Artifact: `docs/decisions/012-entity-mention-graph/task-11-test-empty-registry-mutation.md`

Ready queue now contains that single Step 11 task. Emit `tasks.ready` for Builder with the task id/key/artifact.

## 2026-05-20 Task 11 Builder

Active task: `task-1779302874-f141` / `code-assist:012-entity-mention-graph:step-11:test-empty-registry-mutation`.

Added a defensive regression test in `apps/www/src/lib/news/load.test.ts`. The test mocks the Markdown content helper to mutate the no-registry fallback after running the real preprocessor, then verifies a later no-registry build still treats `@leaked` as an unknown mention instead of seeing the earlier mutation.

Production loader logic was not changed.

Verification:

- Initial focused new-test command failed only because the expected error text omitted the `@` prefix; assertion was corrected.
- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` passed, 89 files / 533 tests.
- `pnpm --filter @shelkovo/www typecheck` passed after typing the intentional mutation test double as a mutable `Map` rather than readonly `SiteMentionRegistry`.

## 2026-05-20 Task 11 Fresh-Eyes Critic

Reviewed `task-1779302874-f141` / `code-assist:012-entity-mention-graph:step-11:test-empty-registry-mutation` against `docs/decisions/012-entity-mention-graph/task-11-test-empty-registry-mutation.md`, current plan/progress, runtime task state, and the changed loader tests.

Findings: no rejection issues found. The Step 11 increment is test-only and adds a defensive news loader regression test that mutates the no-registry fallback after real Markdown mention preprocessing, then proves a later no-registry build still rejects `@leaked` as an unknown mention. This covers the relevant fresh-instance risk without changing production loader logic for this task.

Verification re-run:

- `ralph tools task show task-1779302874-f141 --format json` confirmed the expected Step 11 runtime task is in progress.
- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` passed: 89 files, 533 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts -t "does not let fallback registry mutations make later mentions valid"` passed, confirming the new defensive test catches the intended registry-leak scenario.

Decision: publish `review.passed` for Task 11.

## 2026-05-20 Task 11 Finalizer

Finalizer handled `review.passed` for `task-1779302874-f141` / `code-assist:012-entity-mention-graph:step-11:test-empty-registry-mutation`. Re-read ADR-012 context/plan/progress, task 11 artifact, app local instructions, related ADRs 001/003/012, runtime task state, and the changed news/status loader tests.

Task 11 acceptance criteria are satisfied: the defensive news loader test mutates the no-registry fallback after real Markdown preprocessing and proves a later no-registry build still rejects `@leaked` as unknown. Production loader logic was not changed in this task.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` passed: 89 files, 533 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts -t "does not let fallback registry mutations make later mentions valid"` passed.
- Runtime ready queue was empty, but `plan.md` / `progress.md` show later planned steps remain: Step 12 and Step 13. Therefore close Task 11 and emit `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Step 12 Planner

Handled `queue.advance` after Task 11 closure. Re-read ADR-012 `context.md`, `plan.md`, `progress.md`, app local instructions, runtime ready/open queue, and `task-12-extract-ru-sort-helper.md`. Step 11 was fully closed, while Step 12 and Step 13 remain.

Advanced `progress.md` to Step 12 and ensured one current-step runtime task only:

- `task-1779303451-8957` / `code-assist:012-entity-mention-graph:step-12:extract-ru-sort-helper`
- Artifact: `docs/decisions/012-entity-mention-graph/task-12-extract-ru-sort-helper.md`

Ready queue now contains that single Step 12 task. Emit `tasks.ready` for Builder with the task id/key/artifact.

## 2026-05-20 Task 12 Builder

Active task: `task-1779303451-8957` / `code-assist:012-entity-mention-graph:step-12:extract-ru-sort-helper`.

Implemented shared Russian text sorting as `compareRuText` in `apps/www/src/lib/locale.ts`. Removed local `byText` / `byRuText` helpers from mention graph, people/status/news sorting, and replaced remaining direct `localeCompare(..., 'ru')` calls in app source so the Russian locale comparator lives in one place.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts` failed because `./locale` did not exist.
- GREEN: `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/status/load.test.ts src/lib/news/load.test.ts` passed, 90 files / 534 tests.
- `pnpm --filter @shelkovo/www test` passed, 90 files / 534 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Grep confirmed `localeCompare(..., 'ru')` remains only inside `apps/www/src/lib/locale.ts`.

Commits:

- `5801697` (`fixes`) contains the code/test changes; it appeared in git history before the manual commit step, so it was not amended.
- `eb54a99` (`Document Russian text sort helper task`) contains the Task 12 artifact checklist.

## 2026-05-20 Task 12 Fresh-Eyes Critic

Reviewed `task-1779303451-8957` / `code-assist:012-entity-mention-graph:step-12:extract-ru-sort-helper` against `docs/decisions/012-entity-mention-graph/task-12-extract-ru-sort-helper.md`, current plan/progress, runtime task state, and the changed code in commits `5801697` and `eb54a99`.

Findings: no rejection issues found. The change adds a single app-level `compareRuText` helper in `apps/www/src/lib/locale.ts`, removes local `byText` / `byRuText` helper duplication, and routes the relevant Russian string tie-breakers through the shared helper without changing loader public APIs or comparator order. The broader compare-section replacements are still consistent with the task's one-place `localeCompare(..., 'ru')` acceptance criterion and introduce no new dependency or public contract.

Verification re-run:

- `ralph tools task show task-1779303451-8957 --format json` confirmed the expected Step 12 runtime task is in progress.
- `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/status/load.test.ts src/lib/news/load.test.ts` passed: 90 files, 534 tests.
- `pnpm --filter @shelkovo/www test` passed: 90 files, 534 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: focused `graph.test.ts` sort test and `locale.test.ts` comparator test commands passed in the current Vitest harness.
- Grep confirmed `localeCompare(..., 'ru')` remains only in `apps/www/src/lib/locale.ts`, and no `byText` / `byRuText` helper matches remain under `apps/www/src`.

Decision: publish `review.passed` for Task 12.

## 2026-05-20 Task 12 Finalizer

Finalizer handled `review.passed` for `task-1779303451-8957` / `code-assist:012-entity-mention-graph:step-12:extract-ru-sort-helper`. Re-read ADR-012 context/plan/progress, Task 12 artifact, app local instructions, and runtime task state.

Task 12 acceptance criteria are satisfied: Russian `localeCompare(..., 'ru')` is centralized in `apps/www/src/lib/locale.ts` as `compareRuText`, old local `byText` / `byRuText` helper matches are gone under `apps/www/src`, and consumers use the shared helper without public loader API changes.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/status/load.test.ts src/lib/news/load.test.ts` passed: 90 files, 534 tests.
- `pnpm --filter @shelkovo/www test` passed: 90 files, 534 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts src/lib/mentions/graph.test.ts -t "sort"` passed in the current Vitest harness.
- Grep confirmed direct `localeCompare(..., 'ru')` remains only in `apps/www/src/lib/locale.ts`, and no `byText` / `byRuText` helper matches remain under `apps/www/src`.

Runtime ready queue is empty, but `plan.md` / `progress.md` show later planned Step 13 remains incomplete. Therefore close Task 12 and emit `queue.advance`, not `LOOP_COMPLETE`.

## 2026-05-20 Step 13 Planner

Handled `queue.advance` after Task 12 closure. Re-read ADR-012 `context.md`, `plan.md`, `progress.md`, app local instructions, runtime ready/open queue, and `task-13-circular-loader-deps.md`. Step 12 was fully closed, while Step 13 remains.

Advanced `progress.md` to Step 13 and ensured one current-step runtime task only:

- `task-1779304185-21fd` / `code-assist:012-entity-mention-graph:step-13:circular-loader-deps`
- Artifact: `docs/decisions/012-entity-mention-graph/task-13-circular-loader-deps.md`

Ready queue now contains that single Step 13 task. Emit `tasks.ready` for Builder with the task id/key/artifact.

## 2026-05-20 Task 13 Builder

Active task: `task-1779304185-21fd` / `code-assist:012-entity-mention-graph:step-13:circular-loader-deps`.

Implemented the preferred cycle break by extracting the base people dataset, registry cache, and `loadPeopleMentionRegistry` into `apps/www/src/lib/people/registry.ts`. `people/load.ts` now owns only backlinks/graph assembly and re-exports the public base loader API, while `news/load.ts` and `status/load.ts` import `loadPeopleMentionRegistry` from the smaller registry module instead of the backlink-enabled loader.

Added a structural regression test in `people/load.test.ts` proving news/status loaders do not import `../people/load`.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts -t "keeps news and status loaders off"` failed because `news/load.ts` still imported `../people/load`.
- GREEN: focused news/status/people loader tests passed.
- `pnpm --filter @shelkovo/www typecheck` passed.
- `pnpm test` passed.
- `pnpm typecheck` passed.
- Post-commit focused loader tests and app typecheck passed after prettier hook formatting.

Commit: `3e35eef` (`Resolve circular loader dependencies`).

## 2026-05-20 Task 13 Fresh-Eyes Critic

Reviewed `task-1779304185-21fd` / `code-assist:012-entity-mention-graph:step-13:circular-loader-deps` against `docs/decisions/012-entity-mention-graph/task-13-circular-loader-deps.md`, current plan/progress, runtime task state, and commit `3e35eef`.

Findings: no rejection issues found. The implementation uses the preferred cycle break: base people dataset construction, registry cache, `buildPeopleDataset`, `loadPeopleData`, and `loadPeopleMentionRegistry` now live in `apps/www/src/lib/people/registry.ts`; `people/load.ts` keeps backlink/graph assembly and re-exports the existing public loader API names. `news/load.ts` and `status/load.ts` import `loadPeopleMentionRegistry` from `../people/registry`, so they no longer statically depend on the backlink-enabled people loader.

Verification re-run:

- `ralph tools task show task-1779304185-21fd --format json` confirmed the expected Step 13 runtime task is in progress.
- Diff/static review confirmed `people/registry.ts` does not import `people/load.ts`, while `news/load.ts` and `status/load.ts` no longer import `../people/load`.
- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` passed: 90 files, 535 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- Workspace `pnpm test` passed: 7 packages successful, including `@shelkovo/www` 90 files / 535 tests.
- Workspace `pnpm typecheck` passed.

Decision: publish `review.passed` for Task 13.

## 2026-05-20 Task 13 Finalizer

Finalizer handled `review.passed` for `task-1779304185-21fd` / `code-assist:012-entity-mention-graph:step-13:circular-loader-deps`. Re-read ADR-012 context/plan/progress, Task 13 artifact, required ADRs 001/003/012, app local instructions, and runtime task state.

Task 13 acceptance criteria are satisfied: `news/load.ts` and `status/load.ts` import `loadPeopleMentionRegistry` from `people/registry.ts`, `people/load.ts` keeps backlink assembly and re-exports public loader API names, and static checks show no `../people/load` imports from news/status loaders.

Verification re-run before closure:

- `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` passed: 90 files, 535 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.
- `pnpm test` passed: 7 packages successful.
- `pnpm typecheck` passed.
- `pnpm build` passed and produced `dist/www`.
- Adversarial path: `pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts -t "keeps news and status loaders off"` passed.
- Runtime ready/open queues are empty and `plan.md` has no later numbered steps after Step 13.

Decision: close Task 13 and emit `LOOP_COMPLETE`.
