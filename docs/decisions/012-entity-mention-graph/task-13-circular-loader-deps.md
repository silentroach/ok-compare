# Task 13: Разрешить или задокументировать циклические зависимости loaders

Статус: реализовано.

## Скилы

- `api-and-interface-design` — разрыв или явное документирование циклической зависимости.

## Цель

Разорвать или явно задокументировать циклические зависимости между `news/load.ts`, `status/load.ts` и `people/load.ts`.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Что сделать

- Проанализировать цикл:
  - `news/load.ts` статически импортирует `loadPeopleMentionRegistry` из `people/load.ts`.
  - `status/load.ts` статически импортирует `loadPeopleMentionRegistry` из `people/load.ts`.
  - `people/load.ts` динамически импортирует `../news/load` и `../status/load` в `buildPeopleDataWithBacklinks`.
- Принять решение:
  - **Предпочтительно:** вынести `loadPeopleMentionRegistry` и `buildPeopleDataset` в отдельный модуль (например, `people/registry.ts`), который не тянет backlinks-логику. Тогда `news/load.ts` и `status/load.ts` импортируют его статически без риска цикла, а `people/load.ts` остаётся владельцем backlinks.
  - **Альтернатива:** если вынос создаёт слишком много diff, добавить явный комментарий в `people/load.ts` рядом с dynamic imports, объясняющий, что они существуют для разрыва цикла, и зачем.
- Обновить все imports, если был вынесен модуль.

## Важно не делать

- Не превращать `people/load.ts` в giant file.
- Не менять публичные API loaders (export names должны остаться).
- Не добавлять backward compatibility слой без причины.

## Ожидаемые файлы

- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`
- (возможно) `apps/www/src/lib/people/registry.ts`

## Acceptance criteria

- [x] Циклическая зависимость либо разорвана выносом registry loader, либо явно задокументирована в коде комментарием у dynamic imports.
- [x] `pnpm test` и `typecheck` проходят.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Разорвал или задокументировал циклическую зависимость.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Resolve or document circular loader dependencies`
