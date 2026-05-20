# Task 12: Вынести shared helper сортировки по-русски

Статус: реализовано.

## Скилы

- `code-simplification` — устранение дублирования `localeCompare`.

## Цель

Устранить дублирование `a.localeCompare(b, 'ru')` в трёх модулях.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/status/load.ts`

## Что сделать

- Вынести `byRuText` / `byText` в общий helper.
- Если в `packages/` или `apps/www/src` уже есть подходящее место для shared utilities (например, `@shelkovo/format` или `apps/www/src/lib/utils/locale.ts`), использовать его.
- Иначе создать локальный helper, например `apps/www/src/lib/locale.ts` или добавить в существующий shared module.
- Обновить `mentions/graph.ts`, `status/load.ts`, `people/load.ts` (и `news/load.ts`, если там есть) на использование общего helper.

## Важно не делать

- Не менять публичные API loaders.
- Не менять порядок сортировки.

## Ожидаемые файлы

- (возможно) Новый shared helper файл
- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/status/load.ts`

## Acceptance criteria

- [x] Русская сортировка (`localeCompare(b, 'ru')`) lives in одном месте.
- [x] Все потребители используют общий helper.
- [x] `pnpm test` и `typecheck` проходят.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/status/load.test.ts`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Вынес helper сортировки.
- [x] Обновил все потребители.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Extract shared Russian text sort helper`
