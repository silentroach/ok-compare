# Task 11: Добавить defensive тест на immutability empty registry

Статус: реализовано.

## Скилы

- `test-driven-development` — чисто тестовый task.

## Цель

Добавить тест, доказывающий, что empty mention registry защищён от accidental mutation и что изменения в одном вызове не влияют на другой.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/news/load.test.ts`
- `apps/www/src/lib/status/load.test.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`

## Что сделать

- Добавить тест в `news/load.test.ts` или `status/load.test.ts`, который:
  - Вызывает `buildNewsDataset` (или `buildStatusDataset`) без явного `mention_registry`.
  - Пытается мутировать возвращённый dataset или внутренний registry (через недокументированный путь, если возможно).
  - Проверяет, что последующий вызов `buildNewsDataset` с теми же данными не видит mutation.
- Если Task 10 использовал `Object.freeze`, тест может проверять, что `.set()` бросает TypeError.
- Если Task 10 использовал fresh instance, тест может проверять, что два последовательных вызова без registry получают независимые Map-ы.

## Важно не делать

- Не менять прод-логику (это задача Task 10).
- Не добавлять backward compatibility.

## Ожидаемые файлы

- `apps/www/src/lib/news/load.test.ts`
- (или) `apps/www/src/lib/status/load.test.ts`

## Acceptance criteria

- [x] Тест на immutability/fresh instance проходит.
- [x] Тест не ломается после выполнения Task 10.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Добавил defensive тест.
- [x] Запустил проверки.
- [ ] Сделал commit.

## Commit message

`Add defensive test for empty mention registry immutability`
