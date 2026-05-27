---
status: completed
id: 002-domain-loader-public-dto
depends_on:
  - 001-source-contract
parallel_safe: conditional
---

# 002 Domain Loader And Public DTO

## Цель

Собрать внутреннюю доменную модель встреч, mapper из raw DTO, loader dataset, transcript normalization и public DTO adapter. После задачи UI, Markdown, JSON и llms tasks должны импортировать готовые domain objects.

## Skills

- `astro`
- `source-driven-development`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/013-raw-domain-public-data-boundary.md`
- `apps/www/src/lib/news/types.ts`
- `apps/www/src/lib/news/mapper.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/news/public-dto.ts`
- `apps/www/src/lib/status/load.ts`

## Границы работы

- Создать `apps/www/src/lib/meetings/types.ts`.
- Создать `apps/www/src/lib/meetings/mapper.ts`.
- Создать `apps/www/src/lib/meetings/load.ts`.
- Создать `apps/www/src/lib/meetings/public-dto.ts`.
- Добавить unit tests рядом с этими модулями.
- Не создавать HTML pages, Markdown routes, JSON route или llms routes в этой задаче.

## Domain Model

- Domain поля используют `camelCase`.
- Все domain interfaces пишутся руками и используют `readonly`.
- Встреча имеет `id`, `date`, `slug`, `title`, `summary`, `url`, `markdownUrl`, `canonical`.
- `id` равен `YYYY-MM-DD-slug`.
- `routeId` или source id равен `YYYY-MM-DD/slug`, если нужно отличать от mention id.
- Optional protocol fields остаются пустыми массивами или `undefined` по смыслу, без fake placeholders.
- `body` хранит preprocessed meeting body Markdown, если body есть.
- Transcript хранится как normalized domain object с `segments[]`, anchors and speaker labels.
- Segment anchor строится из `start`, например `00:12:34` -> `t-00-12-34`.

## Loader Requirements

- `loadMeetingsData()` кеширует dataset по существующему app pattern.
- Dataset содержит sorted `meetings`, `byId`, `byRouteId` or equivalent lookup.
- Сортировка списка: новые встречи первыми, затем title по ru compare, затем id.
- Duplicate `id` fails build.
- Missing transcript file fails only when meeting frontmatter explicitly references it.
- Transcript file without meeting reference is not published automatically.
- Body Markdown passes through app-level markdown preprocessing with a `SiteMentionRegistry` argument or safe temporary empty registry until task `003` connects full registry.

## Public DTO

- Public DTO is separate from raw and domain.
- JSON shape uses `camelCase`.
- Payload has `schemaVersion`, `generatedAt`, `updatedAt`, `totalCount`, `meetings`.
- Meeting DTO includes stable URLs, summary, optional editorial structures, source URL, recording URL and transcript segments when present.
- Do not expose raw frontmatter object directly.
- Do not expose arbitrary internal-only fields.

## Acceptance Criteria

- Minimal meeting fixture maps successfully with only `title`, `date`, `summary`, `slug`.
- Full meeting fixture maps protocol fields, participants, documents and transcript segments.
- Mapper rejects impossible invariants with clear errors.
- Public DTO snapshots or focused assertions prove camelCase output and stable URLs.
- Loader tests do not require a fake public data file.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/meetings`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Coordinate with task `003` if both touch meeting registry or markdown preprocessing.
- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Notes

Completed on 2026-05-26:

- Added handwritten readonly meeting domain types, raw-to-domain mapper, cached loader dataset and camelCase public DTO adapter.
- Covered minimal and full fixture mapping, transcript normalization, duplicate ids, missing transcripts, duplicate transcript anchors and public DTO snapshots.
- Verification passed: `pnpm --filter @shelkovo/www test -- src/lib/meetings`; `pnpm --filter @shelkovo/www typecheck` with the known empty meetings glob-loader warning.
