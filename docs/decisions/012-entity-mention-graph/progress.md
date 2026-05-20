# Progress

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
