# Progress

## Current Step

All planned steps complete.

## Active Wave

None.

## Verification Notes

- Task 08 active task: `task-1779301044-be81` / `code-assist:012-entity-mention-graph:step-08:test-encoded-url-boundaries`.
- Task 08 intended verification: `pnpm --filter @shelkovo/www test -- src/lib/mentions`.
- Task 08 added focused coverage in `apps/www/src/lib/mentions/mentions.test.ts` only; production normalization logic was not changed.
- Task 08 verification passed: `pnpm --filter @shelkovo/www test -- src/lib/mentions` and `pnpm --filter @shelkovo/www typecheck`.
- Task 08 finalizer re-ran `pnpm --filter @shelkovo/www test -- src/lib/mentions` and `pnpm --filter @shelkovo/www typecheck` before closure.
- Task 01 focused tests and typecheck passed before closure.
- Task 02 focused tests and typecheck passed before closure.
- Task 03 focused tests and typecheck passed before closure.
- Task 04 focused tests, app typecheck and full app tests passed before closure.
- Task 05 boundary cleanup, app tests and app typecheck passed before review.
- Task 05 finalizer re-ran boundary grep, app tests and app typecheck before closure.
- Task 06 final regression passed targeted grep, code review, `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- Planner reopened ADR-012 for post-review tasks 07-13 and queued Step 7 only.
- Task 07 was verified and closed before this planner activation.
- Planner advanced queue to Step 8 and queued only the Step 8 runtime task.
- Task 08 was verified and closed before this planner activation.
- Planner advanced queue to Step 9 and queued only the Step 9 runtime task.
- Task 09 active task: `task-1779301606-aa27` / `code-assist:012-entity-mention-graph:step-09:extract-content-helper`.
- Task 09 intended verification: `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts` and `pnpm --filter @shelkovo/www typecheck`.
- Task 09 RED: `pnpm --filter @shelkovo/www test -- src/lib/markdown` failed because `preprocessSiteMarkdownContent` was not exported yet.
- Task 09 GREEN: added `preprocessSiteMarkdownContent` in `apps/www/src/lib/markdown/render.ts`, removed duplicate loader-local `content` helpers from news/status/people, and verified focused tests plus typecheck passed.
- Task 09 committed as `542ba4d` (`Extract shared content helper from domain loaders`); focused tests and typecheck passed again after commit hook formatting.
- Task 09 finalizer re-ran focused Markdown/news/status/people loader tests, typecheck, and the self-link regression before closure.
- Planner advanced queue to Step 10 and queued only the Step 10 runtime task.
- Task 10 active task: `task-1779302334-2658` / `code-assist:012-entity-mention-graph:step-10:harden-empty-registry`.
- Task 10 RED: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` failed because mocked markdown preprocessing could mutate the shared fallback registry and leak it into the next build.
- Task 10 GREEN: removed shared mutable `EMPTY_MENTION_REGISTRY` from news/status loaders and allocated a fresh fallback `Map` when `mention_registry` is omitted.
- Task 10 verification passed: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` and `pnpm --filter @shelkovo/www typecheck`.
- Task 10 finalizer re-ran focused news/status loader tests, typecheck, and the fallback-registry mutation adversarial test before closure.
- Planner advanced queue to Step 11 and queued only the Step 11 runtime task.
- Task 11 active task: `task-1779302874-f141` / `code-assist:012-entity-mention-graph:step-11:test-empty-registry-mutation`.
- Task 11 added a defensive news loader test proving a mutation of the no-registry fallback after real preprocessing does not make `@leaked` valid in a later no-registry build.
- Task 11 verification passed: `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts` and `pnpm --filter @shelkovo/www typecheck`.
- Task 11 finalizer re-ran focused news/status loader tests, typecheck, and the fallback-registry mutation adversarial test before closure.
- Planner advanced queue to Step 12 and queued only the Step 12 runtime task.
- Task 12 active task: `task-1779303451-8957` / `code-assist:012-entity-mention-graph:step-12:extract-ru-sort-helper`.
- Task 12 RED: `pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts` failed because the shared `./locale` helper did not exist yet.
- Task 12 GREEN: added `compareRuText` in `apps/www/src/lib/locale.ts` and switched direct Russian `localeCompare(..., 'ru')` usage in `apps/www/src` to the shared helper.
- Task 12 verification passed: focused locale/mentions/people/status/news loader tests, `pnpm --filter @shelkovo/www test`, `pnpm --filter @shelkovo/www typecheck`, and grep confirmed `localeCompare(..., 'ru')` remains only in the shared helper.
- Task 12 commits: code in `5801697` (`fixes`, created before manual commit), task artifact in `eb54a99` (`Document Russian text sort helper task`).
- Task 12 finalizer re-ran focused locale/mentions/people/status/news loader tests, full app tests, app typecheck, and grep checks before closure.
- Planner advanced queue to Step 13 and queued only the Step 13 runtime task.
- Task 13 active task: `task-1779304185-21fd` / `code-assist:012-entity-mention-graph:step-13:circular-loader-deps`.
- Task 13 RED: `pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts -t "keeps news and status loaders off"` failed because `news/load.ts` still imported `../people/load`.
- Task 13 GREEN: extracted base people dataset, registry cache, and mention registry loader into `apps/www/src/lib/people/registry.ts`; `people/load.ts` now owns backlinks and re-exports the public base loader API, while `news/load.ts` and `status/load.ts` import the registry loader from the smaller module.
- Task 13 verification passed: focused news/status/people loader tests, app typecheck, `pnpm test`, and `pnpm typecheck`.
- Task 13 committed as `3e35eef` (`Resolve circular loader dependencies`); focused loader tests and app typecheck passed again after commit hook formatting.
- Task 13 finalizer re-ran focused news/status/people loader tests, app typecheck, `pnpm test`, `pnpm typecheck`, `pnpm build`, and the structural cycle-boundary adversarial test before closure.

## Completed Steps

- Step 1 - Neutral mention contracts.
- Step 2 - Markdown pipeline migration.
- Step 3 - Source ref adapters.
- Step 4 - Generic graph migration.
- Step 5 - Boundary cleanup and docs.
- Step 6 - Final regression.
- Step 7 - Labelled mention URL boundary hardening.
- Step 8 - Encoded URL boundary regression test.
- Step 9 - Shared content helper.
- Step 10 - Empty mention registry hardening.
- Step 11 - Empty registry defensive test.
- Step 12 - Russian text sort helper.
- Step 13 - Loader circular dependency boundary.

## Historical Log

## 2026-05-20 Task 01

Active task: `task-1779290934-3710` / `code-assist:012-entity-mention-graph:step-01:neutral-mentions`.

Implemented neutral app-level mention layer in `apps/www/src/lib/mentions`:

- `EntityMentionType`, `EntityMentionTarget`, `SiteMentionRegistry`, `NormalizedEntityMentions`.
- `createSiteMentionRegistry` with duplicate short slug rejection.
- `normalizeEntityMentions` preserving `@slug`, `@slug:case`, `[visible text](@slug)`, unsupported labelled case errors, unknown slug errors, and per-body dedupe.
- `people/mentions.ts` is now a thin adapter around the neutral layer while keeping compatible person fields.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/mentions` failed because `./index` did not exist yet.
- GREEN: `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/people/mentions.test.ts src/lib/markdown/render.test.ts` passed, 85 files / 519 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

Notes:

- Existing people-facing tests that asserted old people-specific error text were updated to generic entity-level wording.

## 2026-05-20 Task 02

Active task: `task-1779291674-c365` / `code-assist:012-entity-mention-graph:step-02:markdown-pipeline`.

Implemented app-level Markdown pipeline migration to neutral entity mentions:

- `RenderSiteMarkdownOptions` now uses `mentions: { registry, context, source_entity? }` instead of the people-only option.
- `preprocessSiteMarkdown` calls `normalizeEntityMentions` directly and returns generic `EntityMentionTarget[]` metadata.
- News, status and people loaders pass `SiteMentionRegistry` through `mention_registry`; people profile body passes `source_entity` for self-link validation.
- `NewsArticle.mentions`, `StatusIncident.mentions` and `PersonProfile.mentions` use the generic target type.
- Canonical and labelled self mentions fail during normalization with source context.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/mentions src/lib/people/load.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts` failed because the old pipeline ignored `mentions`, loaders still used `people_registry`, and self-link validation did not exist.
- GREEN: same focused command passed, 85 files / 521 tests.
- `pnpm --filter @shelkovo/www typecheck` initially failed because people discovery still expected `PersonMentionTarget` fields; discovery now serializes mention name from generic `label` and guards optional person context fields.
- Final `pnpm --filter @shelkovo/www typecheck` passed.

## 2026-05-20 Task 03

Active task: `task-1779292290-e963` / `code-assist:012-entity-mention-graph:step-03:source-ref-adapters`.

Implemented source ref adapters for ADR-012 without switching the existing people backlinks graph:

- Added neutral `EntityMentionSourceRef` and shared `createEntityMentionSourceRefs` dedupe helper in `apps/www/src/lib/mentions`.
- Added `createNewsArticleMentionRefs` with news article URLs, body excerpt, `published_iso`, and `published_at.valueOf()` sort key.
- Added `createStatusIncidentMentionRefs` with incident URLs, existing incident excerpt, `started_iso`, and `sort_last_change_at` sort key.
- Added `createPersonProfileMentionRefs` with profile URLs, body excerpt, and `source_entity` for the source person identity.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts src/lib/mentions` failed because the new adapter modules did not exist yet.
- GREEN: same focused command passed, 88 files / 527 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

## 2026-05-20 Task 04

Active task: `task-1779292897-9a70` / `code-assist:012-entity-mention-graph:step-04:generic-graph`.

Implemented generic graph migration for people backlinks:

- Added `EntityMentionGraph` and `createEntityMentionGraph` in `apps/www/src/lib/mentions`.
- Graph groups refs by `target_type + target_slug` and `source_section`, dedupes source-unit refs, sorts by ADR-012 order, and rejects defensive self-link refs.
- `buildPeopleGraphDataset` now accepts `readonly EntityMentionSourceRef[]` instead of news/status datasets.
- `buildPeopleDataWithBacklinks` now gathers refs via news, status and people source adapters before attaching current public `PersonBacklinks` shape.
- Removed old news/status/person backlink construction helpers from `people/load.ts`.

Verification:

- RED: focused command failed because `src/lib/mentions/graph.ts` did not exist and `buildPeopleGraphDataset` still expected `related.news.articles`.
- GREEN: `pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts` passed, 89 files / 531 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

## 2026-05-20 Task 05

Active task: `task-1779293687-7f41` / `code-assist:012-entity-mention-graph:step-05:cleanup-docs`.

Implemented ADR-012 boundary cleanup and agent-facing docs update:

- Confirmed `render.ts` imports only the generic mention layer.
- Confirmed news/status body mentions use `SiteMentionRegistry` and do not import people-only registry or target types.
- Removed the unused `normalizePeopleMentions` compatibility wrapper and left `people/mentions.ts` as the person target/registry adapter.
- Kept source ref construction in source-owned adapters and confirmed `people/load.ts` imports only news/status mention adapters, not their schemas/routes.
- Updated `apps/www/AGENTS.md` to describe the generic app-level mention layer, `SiteMentionRegistry`, and source ref adapter naming.

Verification:

- Grep checks passed for people-only names, `render.ts` imports, people backlinks imports, and Markdown tables in touched docs.
- `pnpm --filter @shelkovo/www test` passed, 89 files / 523 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

## 2026-05-20 Task 06

Active task: `task-1779294265-f2f1` / `code-assist:012-entity-mention-graph:step-06:final-regression`.

Final regression review for ADR-012 found no implementation regressions:

- Previous task files are marked complete with separate commits in history.
- Generic mention layer lives in `apps/www/src/lib/mentions`; app body markdown uses `@/lib/markdown/render` and generic `mentions` options.
- Self-link validation is covered in normalization tests for canonical and labelled mentions.
- News, status and people source adapters publish `EntityMentionSourceRef[]` while the generic graph stays independent from real domain dataset shapes.
- People backlinks still expose `backlinks.news`, `backlinks.status` and `backlinks.people`; no public generic entities API/feed was added.

Targeted grep:

- `PeopleMentionRegistry` remains confined to the people adapter/domain loader boundary; news/status only load the registry provider.
- `PersonMentionTarget` remains confined to the people adapter and tests/fixtures.
- `people/load.ts` contains no `statusIncidentMarkdownUrl`, `NewsDataset` or `StatusDataset` backlink coupling.
- Direct app imports from `@shelkovo/markdown` are low-level helpers or the allowed app wrapper `render.ts`; no new body-render bypass was found.

Verification:

- `pnpm test` passed, including `@shelkovo/www` 89 files / 523 tests.
- `pnpm typecheck` passed.
- `pnpm build` passed and produced `dist/www`.
