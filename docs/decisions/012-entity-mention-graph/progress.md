# Progress

## Current Step

Complete.

## Active Wave

- `code-assist:012-entity-mention-graph:step-06:final-regression` backed by `docs/decisions/012-entity-mention-graph/task-06-final-regression.md`.

## Verification Notes

- Task 01 focused tests and typecheck passed before closure.
- Task 02 focused tests and typecheck passed before closure.
- Task 03 focused tests and typecheck passed before closure.
- Task 04 focused tests, app typecheck and full app tests passed before closure.
- Task 05 boundary cleanup, app tests and app typecheck passed before review.
- Task 05 finalizer re-ran boundary grep, app tests and app typecheck before closure.
- Task 06 final regression passed targeted grep, code review, `pnpm test`, `pnpm typecheck`, and `pnpm build`.

## Completed Steps

- Step 1 - Neutral mention contracts.
- Step 2 - Markdown pipeline migration.
- Step 3 - Source ref adapters.
- Step 4 - Generic graph migration.
- Step 5 - Boundary cleanup and docs.
- Step 6 - Final regression.

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
