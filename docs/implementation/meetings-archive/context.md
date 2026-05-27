# Реализация архива встреч

Статус: план работ для агентной реализации.

Дата плана: 2026-05-26.

## Зачем это нужно

Архив встреч должен стать публичной доказательной поверхностью для поселковых встреч, созвонов, эфиров и письменных ответов. Пользователь сначала получает краткий смысл, решения и открытые вопросы, а затем может проверить запись, расшифровку, документы и устойчивые якоря.

Раздел публичный, но не продвигается через главное меню. Основной редакционный вход для жителей остаются новости. Встречи нужны как источник, на который можно ссылаться из новостей, статуса, документов, Markdown и AI-поверхностей.

## Обязательные источники контекста

- `AGENTS.md`
- `apps/www/AGENTS.md`
- `docs/ideas/meetings-archive.md`
- `docs/decisions/014-meetings-archive-public-surface.md`
- `docs/decisions/008-markdown-ast-generation.md`
- `docs/decisions/011-public-surface-registry.md`
- `docs/decisions/012-entity-mention-graph.md`
- `docs/decisions/013-raw-domain-public-data-boundary.md`
- `docs/design/design-code-shelkovo.md`
- `docs/page-meta.md`

## MVP-контракт

- HTML-индекс: `/meetings/`.
- HTML-страница встречи: `/meetings/YYYY-MM-DD/[slug]/`.
- Markdown-версия встречи: `/meetings/YYYY-MM-DD/[slug]/index.md`.
- JSON-лента: `/meetings/data/meetings.json`.
- Агентские документы: `/meetings/llms.txt` и `/meetings/llms-full.txt`.
- `/meetings/` не попадает в главное меню и sitemap.
- Страницы конкретных встреч попадают в sitemap.
- Полная публичная идентичность встречи: `date + slug`.
- Mention-id встречи: `YYYY-MM-DD-slug`.
- Ссылка на встречу целиком в редакционном Markdown: `@YYYY-MM-DD-slug` или `[видимый текст](@YYYY-MM-DD-slug)`.
- Ссылка на секцию или таймкод: обычная Markdown-ссылка на URL с якорем.

## Исходный формат данных

Планируемый layout исходников:

```text
apps/www/src/data/meetings/
  2026-05-26/
    example-meeting/
      index.md
      transcript.yaml
```

`index.md` хранит frontmatter встречи и optional body. Минимальные поля frontmatter: `title`, `date`, `summary`, `slug`. Все остальные поля опциональны.

`transcript.yaml` хранит полную расшифровку рядом со встречей. Базовый контракт первой версии: optional `speakers[]` и обязательные `segments[]`. Каждый сегмент имеет `start`, optional `end`, optional `speaker`, `text`; якорь строится из `start` как `t-HH-MM-SS`.

Публичные тестовые данные не должны подменять реальную встречу. Для проверки optional-модели использовать unit fixtures, а не фиктивную опубликованную встречу.

## Архитектурные правила

- Следовать ADR-013: raw DTO, domain model, mapper и public DTO разделены по файлам.
- Domain model использует `camelCase`, `readonly`-поля и `readonly`-коллекции.
- Raw/frontmatter может использовать `snake_case` только на внешней границе.
- Новый публичный JSON использует `camelCase`, если нет отдельной причины сделать legacy-формат.
- Markdown и `llms*.txt` генерировать через AST API `@shelkovo/markdown` или app-helper поверх него.
- Не собирать публичный Markdown через общий `lines.join('\n')`.
- Редакционный body встречи должен проходить через `@/lib/markdown/render`, чтобы работали mentions и типографика.
- Встречи подключаются к общему `SiteMentionRegistry`, а не заводят отдельный mention parser.
- `video_embed_url` нельзя рендерить как iframe без allowlist провайдера и проверки CSP.
- Не добавлять `audio_url`, `related_news` и верхнеуровневый `timestamps` в первую версию.
- Не добавлять `/meetings/` в главное меню.
- Не добавлять Markdown-таблицы в публичные Markdown/llms-документы.

## Агентный рабочий процесс

- Прочитай этот файл и task-файл, который берешь.
- Проверь зависимости task-файла; не начинай задачу, если зависимость не завершена.
- Если запускаешь subagent, передай ему этот `context.md`, конкретный task-файл и список обязательных источников из task-файла.
- Перед работой в `apps/www` прочитай `apps/www/AGENTS.md`.
- Загрузи skills, перечисленные в task-файле.
- Не трогай чужие незакоммиченные изменения, если они не блокируют задачу.
- После реализации загрузи `code-simplification` и упрости без смены поведения.
- Перед коммитом загрузи `code-review-and-quality` и проведи review своих изменений.
- Запусти проверки из task-файла.
- Обнови статус в task-файле и в списке ниже.
- Если задача завершена и проверки прошли, сделай отдельный commit только со своими файлами.
- Перед commit обязательно выполнить `git status`, `git diff` и `git log --oneline -10`.
- Stage только файлы этой задачи; не stage чужие изменения.

## Статусы задач

Используем статусы `pending`, `in_progress`, `blocked`, `completed`. Источник истины для краткого обзора - список ниже. Подробности, блокеры и completion notes живут в task-файлах.

- [x] `tasks/001-source-contract.md` - source layout, raw schemas, routes, Astro collection.
- [x] `tasks/002-domain-loader-public-dto.md` - domain model, mapper, loader, transcript normalization, public DTO.
- [x] `tasks/003-meeting-mentions.md` - mention target встреч, общий registry, backlinks refs.
- [x] `tasks/004-html-pages.md` - HTML индекс и detail page с optional-секциями.
- [x] `tasks/005-markdown-companions.md` - per-meeting Markdown companion через AST.
- [x] `tasks/006-json-feed.md` - `/meetings/data/meetings.json` и public DTO checks.
- [x] `tasks/007-llms-surfaces.md` - `/meetings/llms*.txt` и корневые AI-тексты.
- [x] `tasks/008-public-surface-and-nginx.md` - public surface registry, discovery coverage, nginx headers.
- [x] `tasks/009-sitemap-and-navigation.md` - sitemap rule and no-main-menu invariant.
- [ ] `tasks/010-video-embed-csp.md` - iframe provider allowlist and CSP; starts as `blocked` until provider is selected.
- [x] `tasks/011-final-integration-review.md` - full build, review pass, status cleanup.

## Параллельность

- `001` выполняется первым и не параллелится.
- После `001` сначала делать `002`.
- После `002` задачи `003`, `004`, `005` и `006` можно выполнять параллельно, если `003` не меняет уже занятый другим агентом `lib/meetings/load.ts`.
- `007` ждет `005` и `006`.
- `008` ждет `004`, `005`, `006` и `007`.
- `009` ждет `002` и `004`.
- `010` ждет `001` и `004`, но остается `blocked` до выбора первого реального iframe-провайдера.
- `011` выполняется последней.
- Не запускать параллельно задачи, которые одновременно меняют `apps/www/src/content.config.ts`, `apps/www/src/lib/llms.ts`, `apps/www/src/lib/public-surface/index.ts` или `ops/nginx/*`.

## Готовность MVP

- Все task-файлы имеют статус `completed` или осознанный `blocked` только для провайдера видео.
- `pnpm --filter @shelkovo/www typecheck` проходит.
- `pnpm --filter @shelkovo/www test` проходит.
- `pnpm build` проходит.
- Detail-страницы встреч есть в sitemap, `/meetings/` отсутствует.
- `/meetings/` отсутствует в главном меню.
- Публичные Markdown и `llms*.txt` собраны через AST.
- JSON feed отдает public DTO, а не raw/frontmatter и не domain model напрямую.
- Iframe не рендерится без allowlist и CSP.

## Открытые вопросы

- Первый реальный iframe-провайдер видео пока не выбран. До выбора провайдера задача `010` должна оставаться blocked или рендерить только обычную ссылку на запись.
- Первый реальный материал встречи не задан. MVP может быть реализован без фиктивной опубликованной встречи, если тесты покрывают optional-модель fixtures.
