# Task 09: Унифицировать сортировку по-русски и задокументировать циклические зависимости loaders

Статус: не реализовано.

## Скилы

- `code-simplification` — устранение дублирования `localeCompare`.
- `api-and-interface-design` — разрыв или явное документирование циклической зависимости.

## Цель

Устранить дублирование `a.localeCompare(b, 'ru')` и зафиксировать/разорвать циклические зависимости между `news/load.ts`, `status/load.ts` и `people/load.ts`.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Что сделать

- Вынести `byRuText` / `byText` в общий helper. Если в `packages/` или `apps/www/src` уже есть подходящее место для shared utilities (например, `@shelkovo/format` или `apps/www/src/lib/utils/locale.ts`), использовать его. Иначе создать локальный helper в `apps/www/src/lib/`.
- Обновить `mentions/graph.ts`, `status/load.ts`, `people/load.ts` (и `news/load.ts`, если там есть), чтобы использовали общий helper.
- Проанализировать цикл:
  - `news/load.ts` статически импортирует `loadPeopleMentionRegistry` из `people/load.ts`.
  - `status/load.ts` статически импортирует `loadPeopleMentionRegistry` из `people/load.ts`.
  - `people/load.ts` динамически импортирует `../news/load` и `../status/load` в `buildPeopleDataWithBacklinks`.
- Принять решение:
  - Либо вынести `loadPeopleMentionRegistry` и `buildPeopleDataset` в отдельный модуль (например, `people/registry.ts`), который не тянет backlinks-логику. Тогда `news/load.ts` и `status/load.ts` импортируют его статически без риска цикла, а `people/load.ts` остается владельцем backlinks.
  - Либо, если вынос создаст слишком много diff, добавить явный комментарий в `people/load.ts` рядом с dynamic imports, объясняющий, что они существуют для разрыва цикла.
- Обновить все imports, если был вынесен модуль.

## Важно не делать

- Не превращать `people/load.ts` в giant file.
- Не менять публичные API loaders (export names должны остаться).
- Не добавлять backward compatibility слой без причины.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`
- (возможно) `apps/www/src/lib/people/registry.ts` или shared helper файл

## Acceptance criteria

- [ ] Русская сортировка (`localeCompare(b, 'ru')`) lives in одном месте.
- [ ] Все потребители используют общий helper.
- [ ] Циклическая зависимость либо разорвана выносом registry loader, либо явно задокументирована в коде комментарием у dynamic imports.
- [ ] `pnpm test` и `typecheck` проходят.

## Проверка

- [ ] `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Вынес helper сортировки.
- [ ] Разорвал или задокументировал циклическую зависимость.
- [ ] Запустил проверки.
- [ ] Использовал `code-simplification` после реализации.
- [ ] Сделал commit.

## Commit message

`Unify Russian text sort helper and resolve loader circular deps`
