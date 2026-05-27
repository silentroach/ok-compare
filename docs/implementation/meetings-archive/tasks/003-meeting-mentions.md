---
status: completed
id: 003-meeting-mentions
depends_on:
  - 002-domain-loader-public-dto
parallel_safe: conditional
---

# 003 Meeting Mentions

Completion note: implemented meeting mention targets, combined people+meetings registry, meeting body source refs, self-link validation, people backlinks from meetings, and focused tests for news, meetings and people surfaces.

## Цель

Подключить встречи к общему mention-layer: `@YYYY-MM-DD-slug` должен ссылаться на страницу встречи, а Markdown body встреч должен уметь упоминать людей через существующий синтаксис.

## Skills

- `source-driven-development`
- `security-and-hardening`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/012-entity-mention-graph.md`
- `apps/www/src/lib/mentions/types.ts`
- `apps/www/src/lib/mentions/normalize.ts`
- `apps/www/src/lib/people/registry.ts`
- `apps/www/src/lib/meetings/load.ts`
- `apps/www/src/lib/meetings/types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Границы работы

- Extend `EntityMentionType` to include `meeting`.
- Add meeting mention target adapter from meeting identity/frontmatter data.
- Add a combined site mention registry that merges people and meetings and fails on short slug conflicts.
- Update news/status/people loaders to use combined registry where appropriate.
- Add meeting source refs so meeting body mentions can become backlinks.
- If people public backlinks include meetings, update people types, schema, public DTO, discovery schema and tests in the same task.
- Do not add a public generic `/entities` API.

## Registry Rules

- Meeting mention slug is exactly `YYYY-MM-DD-slug`.
- Meeting label is the meeting title.
- Meeting target has HTML URL and Markdown URL.
- Meeting target does not support label cases in MVP.
- If any person slug conflicts with a meeting mention slug, build fails.
- Self-link from a meeting body to the same meeting is an error.

## Backlink Rules

- Meeting body source refs use `section: 'meetings'` and `kind: 'meeting'`.
- If adding meeting backlinks to people profiles, update public people DTO and schemas intentionally.
- Backlinks stay source-level, not occurrence-level.
- Generated Markdown and llms text are not mention-enabled surfaces unless explicitly documented elsewhere.

## Acceptance Criteria

- `@YYYY-MM-DD-slug` in a news Markdown fixture renders as a link to `/meetings/YYYY-MM-DD/slug/`.
- Labelled mention `[видимый текст](@YYYY-MM-DD-slug)` renders with visible text preserved.
- Unknown meeting mention fails build/test with a clear error.
- Self-link in meeting body fails with a clear error.
- Person mention inside meeting body works through the shared registry.
- Tests cover registry conflict between person slug and meeting id.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/meetings src/lib/news src/lib/status src/lib/people`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Coordinate with parallel UI, Markdown or JSON tasks if this task needs to touch `apps/www/src/lib/meetings/load.ts` after they started.
- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.
