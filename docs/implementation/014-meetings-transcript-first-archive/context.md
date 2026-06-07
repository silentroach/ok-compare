# Transcript-first архив встреч - контекст реализации

Этот пакет задач реализует ADR-014: `docs/decisions/014-meetings-transcript-first-archive.md`.

Главная цель - добавить на `kpshelkovo.online` минимальный публичный архив встреч, где каноническая поверхность MVP - только HTML-страница конкретной встречи `/meetings/[slug]/` с коротким контекстом и полной транскрипцией.

## Роль supervising agent

Ты работаешь как координатор реализации, а не как один большой исполнитель.

- Перед стартом каждой задачи прочитай этот `context.md`, `memory.md`, нужный task-файл и локальные `AGENTS.md`.
- Если две задачи не зависят друг от друга и не трогают одни и те же файлы, запускай каждую в отдельном subagent через `task` tool.
- Subagent должен делать только одну задачу, не коммитить, не менять `context.md` todo и в финале вернуть список измененных файлов, проверки и все факты для `memory.md`.
- Ты проверяешь результат subagent-а: читаешь diff, запускаешь focused verification, исправляешь мелкие несоответствия сам или отправляешь subagent на доработку.
- Только ты помечаешь задачи выполненными в todo ниже.
- Только ты делаешь git commit после принятой и проверенной задачи или небольшого связанного пакета задач.
- Перед каждым commit выполни `git status`, `git diff` и `git log --oneline -10`; stage только относящиеся к задаче файлы.
- Не amend, не force-push, не трогай чужие незапрошенные изменения.
- После изменений в коде обязательно загрузи skill `code-simplification` и проверь, что решение не сложнее нужного.

## Источники истины

- `docs/decisions/014-meetings-transcript-first-archive.md` - продуктовая и архитектурная рамка MVP.
- `docs/decisions/011-public-surface-registry.md` - регистрация публичных поверхностей.
- `docs/decisions/012-entity-mention-graph.md` - people mentions и граница mention-enabled Markdown body.
- `docs/decisions/013-raw-domain-public-data-boundary.md` - raw DTO, domain model, mapper, public DTO.
- `apps/www/AGENTS.md` - правила Astro app, Markdown pipeline, people mentions, agent-facing surfaces.
- `docs/page-meta.md` - правила `title` и `description`.
- `docs/design/design-code-shelkovo.md` - visual language: полевой журнал, плоские evidence-поверхности, длинная типографика.

## Product Scope

MVP делает только страницу встречи как страницу транскрипции.

Входит в MVP:

- HTML route `/meetings/[slug]/`.
- Название встречи.
- Дата встречи.
- Короткая контекстная фраза.
- Обычная ссылка на источник или запись, если она есть.
- Полная структурированная транскрипция.
- Спикеры у сегментов.
- Стабильные HTML-якоря сегментов, построенные от времени начала.
- Регистрация route pattern в Public Surface Registry.
- Участие страниц встреч в sitemap как канонических detail pages.
- Nginx HTML cache coverage для `/meetings/[slug]/`.

Не входит в MVP:

- `/meetings/` index page.
- Пункт в главном меню.
- Markdown companion для встречи.
- JSON feed встреч.
- `/meetings/llms.txt` и `/meetings/llms-full.txt`.
- API catalog раздела.
- Протокол, решения, action items, открытые вопросы, связанные новости как typed fields.
- iframe/embed записи.
- Поиск по транскриптам.
- Синхронизация транскрипта с видео.
- Mention syntax для встреч.
- Автоматическое добавление transcript speakers в people backlinks.

Если subagent предлагает любой пункт из списка non-goals, останови изменение и верни реализацию к ADR-014.

## Архитектурная форма

Выбранная форма данных:

- Одна встреча живет в директории `apps/www/src/data/meetings/[slug]/`.
- Метаданные встречи живут в `index.yaml`.
- Структурированный transcript companion живет рядом в `transcript.yaml`.
- Astro читает это как две build-time content collections: `meetingEntries` и `meetingTranscripts`.
- `slug` равен имени директории, а URL равен `/meetings/[slug]/`.
- Для первой реальной встречи рекомендуемый slug - `2026-06-13-ok-comfort`, но не создавать публичный материал без настоящего transcript/source.

Минимальный `index.yaml`:

```yaml
title: Встреча ОК Комфорт с жителями КП Шелково
date: 13.06.2026 16:00
context: Встреча управляющей компании с жителями о сезонных работах, тарифе и финансовых вопросах.
source_url: https://example.com/source
```

Минимальный `transcript.yaml`:

```yaml
speakers:
  moderator:
    name: Модератор
  ykizilov:
    person: ykizilov
segments:
  - start: '00:00:00'
    end: '00:00:12'
    speaker: moderator
    text: Добрый день. Начинаем встречу.
  - start: '00:00:12'
    speaker: ykizilov
    text: Спасибо, что пришли.
```

Transcript text is plain text, not Markdown. Do not run entity mention normalization on transcript text. Person links are resolved only through speaker definitions with `person`.

## Anchor Rules

- Segment anchor is based on `start`.
- `00:12:34` becomes `t-00-12-34`.
- First segment with a start time has no suffix.
- Repeated start times get deterministic suffixes in input order: `t-00-12-34-2`, `t-00-12-34-3`.
- Changing segment `start` may change the anchor; this is allowed by ADR-014.
- Links from news use normal Markdown URLs like `/meetings/2026-06-13-ok-comfort/#t-00-12-34`.

## Public Surface Rules

- Register only `meetings:detail` with `routePattern: '/meetings/:slug/'`.
- Do not add `catalogRole` for meetings in MVP.
- Do not add root `llms`, root Markdown, root API catalog items, section API catalog, JSON, schema or OpenAPI for meetings.
- Root API catalog generation must ignore slices with no catalog surfaces, otherwise a detail-only meetings slice can create an empty linkset object.

## UI Rules

- Use `BaseLayout`, `Breadcrumbs`, `ui-page`, `ui-page-header`, `ui-page-title` and existing typography tokens.
- Page should feel like a source document, not a media page.
- Show date/context/source above transcript.
- Transcript should be a readable long document with service timestamps, speaker label and text.
- Time anchors should look like utility links, not CTA buttons.
- Do not embed external media in MVP; source is a normal link.
- Transcript text must be escaped before any typograf HTML formatting.
- Test responsive behavior at 320px, 768px, 1024px and 1440px if browser/devtools verification is used.

## Memory Protocol

Use `memory.md` as append-only implementation memory.

- Add only facts that will definitely help later tasks.
- Good memory: chosen data shape, invariant, route helper name, exact blocker, commit hash, known failing test and fix.
- Bad memory: noisy command output, opinions, transient todo, speculation.
- When a subagent returns a durable fact, the supervising agent copies it into `memory.md` before committing.

## Todo

- [ ] Task 001 - Public catalog supports detail-only registry slices: `tasks/001-registry-catalog-foundation.md`.
- [ ] Task 002 - Meeting route helpers and Public Surface Registry slice: `tasks/002-meetings-routes-public-surface.md`.
- [ ] Task 003 - Meetings content collections and raw schemas: `tasks/003-content-collections-raw-schemas.md`.
- [ ] Task 004 - Meetings domain model, transcript mapper and loader: `tasks/004-domain-mapper-loader.md`.
- [ ] Task 005 - Transcript view helpers and safe typography: `tasks/005-transcript-view-helpers.md`.
- [ ] Task 006 - `/meetings/[slug]/` Astro detail page: `tasks/006-meeting-html-page.md`.
- [ ] Task 007 - Sitemap and page metadata contract: `tasks/007-sitemap-seo-contract.md`.
- [ ] Task 008 - Nginx cache coverage for meetings HTML: `tasks/008-nginx-cache-coverage.md`.
- [ ] Task 009 - First real meeting transcript data: `tasks/009-first-real-meeting-data.md`.
- [ ] Task 010 - News links to meeting and transcript anchors: `tasks/010-news-links-to-anchors.md`.
- [ ] Task 011 - Full verification, simplification and final commit hygiene: `tasks/011-final-verification-cleanup.md`.

## Suggested Parallelization

Sequential foundation:

- Task 001 before Task 002.
- Task 002 before public contract tests that expect meetings registry.
- Task 003 before Task 004.
- Task 004 before Task 005 and Task 006.

Safe parallel work after foundations:

- Task 007 can start after Task 003 and Task 002 define routes/data shape.
- Task 008 can start after Task 006 creates the Astro page route.
- Task 009 can be prepared by an editorial subagent only after Task 004 and Task 006 exist and a real transcript/source is available.
- Task 010 depends on Task 009 because news must link to real anchors.

Final sequencing:

- Task 011 runs after all implemented tasks and all blockers are resolved.

## Verification Baseline

Focused checks during tasks:

- `pnpm --filter @shelkovo/www test -- src/lib/meetings`
- `pnpm --filter @shelkovo/www test -- src/lib/public-surface/index.test.ts src/lib/discovery.test.ts`
- `pnpm --filter @shelkovo/www test -- src/lib/sitemap.test.ts src/lib/route-cache-coverage.test.ts`

Final checks:

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Do not run `pnpm dev` unless the user explicitly asks.

## Blockers And Open Questions

- First real transcript/source is not present in this planning package. Do not fabricate transcript content.
- If the first meeting slug should differ from `2026-06-13-ok-comfort`, write the chosen slug to `memory.md` before adding data.
