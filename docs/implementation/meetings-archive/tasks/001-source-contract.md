---
status: completed
id: 001-source-contract
depends_on: []
parallel_safe: false
---

# 001 Source Contract

## Цель

Зафиксировать исходный редакционный контракт встреч: layout файлов, route helpers, raw schemas и Astro content collection. После задачи остальные агенты должны иметь стабильные типы входных данных и URL helpers.

## Skills

- `astro`
- `source-driven-development`
- `documentation-and-adrs`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/014-meetings-archive-public-surface.md`
- `docs/decisions/013-raw-domain-public-data-boundary.md`
- `apps/www/AGENTS.md`
- `apps/www/src/content.config.ts`
- `apps/www/src/lib/news/raw-schema.ts`
- `apps/www/src/lib/news/routes.ts`
- `apps/www/src/lib/status/routes.ts`

## Границы работы

- Создать `apps/www/src/lib/meetings/routes.ts`.
- Создать raw schema modules для meeting frontmatter и transcript YAML.
- Обновить `apps/www/src/content.config.ts` новой collection `meetings`.
- Добавить `apps/www/src/data/meetings/AGENTS.md` с короткими редакционными правилами.
- Не добавлять фиктивную публичную встречу.
- Не делать HTML, Markdown, JSON или loader beyond what is needed for raw contract.

## Контракт данных

- Исходный meeting id: `YYYY-MM-DD/slug`.
- Source path: `apps/www/src/data/meetings/YYYY-MM-DD/slug/index.md`.
- Companion transcript path: `apps/www/src/data/meetings/YYYY-MM-DD/slug/transcript.yaml`.
- Frontmatter минимум: `title`, `date`, `summary`, `slug`.
- Optional frontmatter: `format`, `source_url`, `video_url`, `video_embed_url`, `transcript`, `highlights`, `agenda`, `decisions`, `action_items`, `questions`, `participants`, `documents`.
- Не вводить `audio_url`, `related_news`, `timestamps`.
- `date` во frontmatter должен совпадать с date-директорией.
- `slug` во frontmatter должен совпадать со slug-директорией.
- Transcript schema: optional `speakers[]`, required `segments[]`; segment has `start`, optional `end`, optional `speaker`, `text`.
- Timecode format for transcript anchors: `HH:MM:SS`.

## Route helpers

- `meetingsPath()` returns `/meetings/`.
- `meetingPath({ date, slug })` returns `/meetings/YYYY-MM-DD/slug/`.
- `meetingMarkdownPath({ date, slug })` returns `/meetings/YYYY-MM-DD/slug/index.md`.
- `meetingsDataPath()` returns `/meetings/data/meetings.json`.
- `meetingsLlmsPath()` returns `/meetings/llms.txt`.
- `meetingsLlmsFullPath()` returns `/meetings/llms-full.txt`.
- Add URL/canonical variants using existing `withBase` and `canon` patterns.
- Add route pattern helpers for public surface registry tasks.

## Acceptance Criteria

- Content collection accepts only `YYYY-MM-DD/slug/index.md` meeting sources.
- Invalid date directory, slug directory, date mismatch or slug mismatch fails during collection id generation.
- Raw schema enforces nonblank required text and rejects unsupported first-version fields.
- Transcript raw schema validates speaker and segment shape without loading transcript into the domain model yet.
- Route helpers have tests for paths, URLs, canonical URL and blank slug/date failures.
- No public fake meeting content is added.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/meetings`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Note

Implemented the meetings source contract: route helpers, raw frontmatter and transcript schemas, source path/id validation, Astro content collection registration, and local data authoring rules. Verified with focused meetings tests and `@shelkovo/www` typecheck.
