# Task 09: Вынести shared content helper из loaders

Статус: реализовано, ожидает ревью.

## Скилы

- `code-simplification` — устранение дублирования.

## Цель

Устранить дублирование `content` helper в трёх модулях: `news/load.ts`, `status/load.ts`, `people/load.ts`.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Что сделать

- Вынести `content` helper в `apps/www/src/lib/markdown/render.ts`.
- Новый helper принимает `(markdown: string, context: string, registry: SiteMentionRegistry, sourceEntity?)` и возвращает `PreprocessedSiteMarkdown`.
- Экспортировать helper из `render.ts`.
- Обновить все три loaders, чтобы они использовали вынесенный helper.

## Важно не делать

- Не менять публичные типы schema (`NewsArticle`, `StatusIncident`, `PersonProfile`).
- Не менять публичные dataset shapes.
- Не убирать optional `mention_registry` из opts loaders.

## Ожидаемые файлы

- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Acceptance criteria

- [x] `content` helper живёт в одном месте (`markdown/render.ts` или рядом).
- [x] `news/load.ts`, `status/load.ts`, `people/load.ts` используют вынесенный helper.
- [x] `pnpm test` и `typecheck` проходят.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Вынес shared helper.
- [x] Обновил все loaders.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Extract shared content helper from domain loaders`
