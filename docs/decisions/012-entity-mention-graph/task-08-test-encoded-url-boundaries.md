# Task 08: Добавить тест на labelled mentions с URL-encoded destinations

Статус: реализовано.

## Скилы

- `test-driven-development` — чисто тестовый task.

## Цель

Добавить недостающий тест на boundary replacement при encoded URL в labelled mention, чтобы regression была поймана тестами, а не только при code review.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/mentions/mentions.test.ts`
- `apps/www/src/lib/mentions/normalize.ts`

## Что сделать

- Добавить тест в `mentions.test.ts`, который создаёт mention target с URL, содержащим `%20` или Unicode, и проверяет, что replacement не обрезает соседний markdown-текст.
- Если Task 07 уже внёс fix, этот task добавляет тест, который его покрывает.
- Если Task 07 ещё не выполнен, этот task может идти параллельно: тест сначала будет красным (или skipped), а после Task 07 станет зелёным.

## Важно не делать

- Не менять прод-логику нормализации (это задача Task 07).
- Не добавлять backward compatibility.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/mentions.test.ts`

## Acceptance criteria

- [x] Тест на labelled mention с `%20` или Unicode в URL проходит (replacement не ломает соседний текст).
- [x] Тест на пустой `@` mention (`Текст @.`) добавлен, если такой тест отсутствует.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/mentions`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Добавил тест на encoded URL boundaries.
- [x] Добавил тест на empty mention, если его не было.
- [x] Запустил проверки.
- [ ] Сделал commit.

## Commit message

`Add test for labelled mentions with encoded URL boundaries`
