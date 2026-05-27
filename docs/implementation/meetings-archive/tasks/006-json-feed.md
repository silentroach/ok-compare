---
status: completed
id: 006-json-feed
depends_on:
  - 002-domain-loader-public-dto
parallel_safe: true
---

# 006 JSON Feed

## Цель

Опубликовать `/meetings/data/meetings.json` как public DTO feed для массового чтения встреч и AI-агентов.

## Skills

- `astro`
- `source-driven-development`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/011-public-surface-registry.md`
- `docs/decisions/013-raw-domain-public-data-boundary.md`
- `apps/www/src/pages/news/data/articles.json.ts`
- `apps/www/src/lib/news/discovery.ts`
- `apps/www/src/lib/news/public-dto.ts`
- `apps/www/src/lib/people/public-dto.ts`

## Границы работы

- Create `apps/www/src/pages/meetings/data/meetings.json.ts`.
- Use public DTO adapter from task `002`.
- Add focused tests for payload contract.
- Do not publish schema, OpenAPI or `/meetings/.well-known/api-catalog` in MVP unless the ADR/plan is explicitly updated.

## JSON Contract

- Response body is pretty JSON with final newline.
- Header is `Content-Type: application/json; charset=utf-8`.
- Payload uses `camelCase`.
- Payload includes `schemaVersion`, `generatedAt`, `updatedAt`, `totalCount`, `meetings`.
- Meeting items include `id`, `title`, `date`, `slug`, `htmlUrl`, `markdownUrl`, `summary`.
- Optional fields appear only when meaningful or may be `undefined` before serialization removes them.
- Transcript is included as normalized segments when present.
- Raw `snake_case` frontmatter is not leaked.

## Acceptance Criteria

- JSON route builds from `loadMeetingsData()`.
- Minimal meeting appears with required public fields only.
- Full meeting appears with optional public fields and transcript anchors.
- Tests prove public DTO is stable and camelCase.
- No schema/OpenAPI files are added without updating plan and public surface registry intentionally.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/meetings src/pages/meetings`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Notes

Completed on 2026-05-27:

- Added `/meetings/data/meetings.json` as a prerendered Astro JSON endpoint built from `loadMeetingsData()` and the meetings public DTO adapter.
- Tightened the public DTO feed shape so minimal meetings serialize required fields only, while full meetings include meaningful optional fields and transcript anchors.
- Covered route headers, pretty JSON with final newline, camelCase output, no raw `snake_case` leakage, and no internal `routeId` leakage.
- Verification passed: `pnpm --filter @shelkovo/www test -- src/lib/meetings src/pages/meetings`; `pnpm --filter @shelkovo/www typecheck`; `pnpm --filter @shelkovo/www build` with the known empty meetings collection warning.
