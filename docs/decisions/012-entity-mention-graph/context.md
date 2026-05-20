# Контекст реализации ADR-012

Эта папка нужна для пошаговой реализации [ADR-012: Единый граф упоминаний сущностей в Markdown](../012-entity-mention-graph.md).

Каждому агенту выдавать этот `context.md` и один конкретный `task-XX-*.md`. Агент выполняет только свой task, отмечает чекбоксы в task-файле, запускает проверки из task-файла и делает отдельный commit.

## Обязательное чтение

- `AGENTS.md`
- `apps/www/AGENTS.md`
- `docs/decisions/001-markdown-slug-mentions.md`
- `docs/decisions/003-markdown-pipeline-layering.md`
- `docs/decisions/012-entity-mention-graph.md`
- Свой `docs/decisions/012-entity-mention-graph/task-XX-*.md`

## Цель

Перевести текущие people-only упоминания на общий app-level слой `apps/www/src/lib/mentions`, не меняя публичную поверхность раздела `people`.

После реализации:

- редакционный синтаксис остается коротким: `@slug`, `@slug:case`, `[видимый текст](@slug)`;
- общий слой знает нейтральные сущности и source refs, но не формы `NewsArticle`, `StatusIncident` или `PersonProfile`;
- источники `news`, `status` и `people` сами публикуют `EntityMentionSourceRef[]`;
- общий graph индексирует refs по `type + slug`, дедуплицирует source-level refs, группирует по source section и сортирует;
- `people` продолжает отдавать `backlinks.news`, `backlinks.status` и `backlinks.people` в прежней доменной форме;
- публичный generic `/entities` API не появляется.

## Текущая картина

- `apps/www/src/lib/people/mentions.ts` содержит parser и normalizer для people mentions.
- `apps/www/src/lib/markdown/render.ts` подключает только people preprocessor через option `people`.
- `apps/www/src/lib/news/load.ts` и `apps/www/src/lib/status/load.ts` получают `PeopleMentionRegistry` и сохраняют `mentions` в body units.
- `apps/www/src/lib/people/load.ts` строит backlinks сам и знает детали новостей, статуса, excerpt, URLs и sort keys.
- `people/load.ts` сейчас молча фильтрует self-link в graph, а ADR-012 требует падать на build во время normalization Markdown body.

## Целевая архитектура

- `apps/www/src/lib/mentions` содержит нейтральные типы и функции.
- `EntityMentionType` сначала имеет только `person`, но тип и registry должны быть расширяемыми.
- `EntityMentionTarget` хранит `type`, `slug`, `label`, optional `label_cases`, `html_url`, `markdown_url` и optional link title/context.
- `SiteMentionRegistry` собирается до обработки Markdown body из identity/frontmatter данных сущностей.
- People adapter мапит `name` и `name_cases` в `label` и `label_cases`.
- `preprocessSiteMarkdown` и `renderMarkdown` принимают общий mention registry и optional `source_entity`.
- Если body сущности упоминает саму себя той же парой `type + slug`, normalizer падает с ошибкой рядом с source context.
- `EntityMentionSourceRef` строят source adapters рядом с `news`, `status` и `people`.
- `EntityMentionGraph` принимает уже готовые refs и не импортирует доменные schema/load modules источников.

## Инварианты ADR-012

- Не вводить namespace syntax вроде `@person:slug`.
- Если несколько реестров дают одинаковый short slug, сборка должна падать.
- `@slug:case` использует `label_cases`; отсутствие явно запрошенной формы является ошибкой build.
- `[видимый текст](@slug:case)` остается ошибкой.
- Упоминания работают только в явно обработанном редакционном Markdown body.
- Заголовки, summary, подписи, URL, frontmatter-строки, generated Markdown, `llms.txt` и plain-text поля не становятся mention-enabled surfaces.
- Дополнения к новостям не входят в новый контракт source units.
- Backlinks строятся на уровне source unit, не occurrence-level.
- Один source unit дает не больше одного ref для одной target entity.
- Сортировка backlinks внутри группы: сначала `sort_key` по убыванию, затем `title` по `ru`, затем `source_id`; отсутствующий `sort_key` ниже источников с датой.

## Общие правила для агентов

- Не запускать `pnpm dev` без явной просьбы.
- Не добавлять backward-compatibility слой без явной причины: это внутренний app-level API.
- Не переносить site-specific mention logic в `@shelkovo/markdown`.
- Не добавлять публичный generic API или feed.
- Не менять визуальный UI, если task явно не просит.
- Не менять generated Markdown/llms контракты без необходимости.
- Не использовать `null`, только `undefined` и optional properties.
- По возможности использовать `readonly` в новых TypeScript типах.
- Для тривиальных helpers с одним return предпочитать однострочные `const`-стрелки.
- После правок в коде использовать skill `code-simplification` перед финальной проверкой.

## Глобальная проверка

Минимум для каждого coding task:

- `pnpm --filter @shelkovo/www test`
- `pnpm --filter @shelkovo/www typecheck`

Финальный task дополнительно гоняет:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Если проверка не запускается из-за внешнего окружения, агент должен описать причину в task-файле и в commit message не скрывать частичную проверку.

## Порядок задач

- [x] [Task 01: Нейтральные mention-типы, registry и normalizer](task-01-neutral-mentions.md)
- [x] [Task 02: App markdown pipeline и self-link validation](task-02-markdown-pipeline.md)
- [x] [Task 03: Source refs adapters для news, status и people](task-03-source-ref-adapters.md)
- [x] [Task 04: Generic mention graph и миграция people backlinks](task-04-generic-graph.md)
- [x] [Task 05: Cleanup доменных границ и документации](task-05-cleanup-docs.md)
- [x] [Task 06: Финальная регрессия и hardening](task-06-final-regression.md)

## Зависимости задач

- Task 01 должен идти первым: он создает базовые нейтральные contracts.
- Task 02 зависит от Task 01: он подключает contracts к app-level Markdown pipeline.
- Task 03 зависит от Task 02: source adapters используют generic mentions, сохраненные в body units.
- Task 04 зависит от Task 03: graph получает готовые refs от adapters.
- Task 05 зависит от Task 04: cleanup имеет смысл после миграции graph.
- Task 06 должен идти последним.

## Нерешенные вопросы

Нерешенных продуктовых вопросов нет. Если агент обнаружит конфликт между ADR-012 и текущим кодом, он должен зафиксировать его в своем task-файле и остановиться только при невозможности выбрать безопасное минимальное изменение.
