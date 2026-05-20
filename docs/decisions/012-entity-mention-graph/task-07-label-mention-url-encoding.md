# Task 07: Защитить linkDestinationOffsets от URL-encoded символов

Статус: реализовано.

## Скилы

- `test-driven-development` — сначала зафиксировать поведение boundary тестами.
- `code-simplification` — после реализации перед финальной проверкой.

## Цель

Устранить хрупкость `linkDestinationOffsets` в `normalize.ts` при наличии URL-encoded символов в labelled-mention destination.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/mentions/normalize.ts`
- `apps/www/src/lib/mentions/mentions.test.ts`

## Что сделать

- Исследовать, как `remark-parse` хранит `node.url` для labelled mentions: содержит ли он raw encoded URL или decoded строку.
- Исправить `linkDestinationOffsets`, чтобы end-граница replacement точно совпадала с URL-диапазоном в исходном markdown, даже если `node.url` содержит decoded символы.
- Варианты исправления:
  - Найти raw URL в исходном тексте через `source.indexOf(node.url, destinationStart)` с fallback, если URL содержит encoded последовательности.
  - Использовать AST position fields для `url`, если `remark-parse` их предоставляет.
  - Иначе задокументировать ограничение, что labelled-mention destinations не должны содержать encoded символов, и добавить defensive assertion.

## Важно не делать

- Не менять синтаксис mentions (`@slug`, `@slug:case`, `[текст](@slug)`).
- Не добавлять новые mention-enabled surfaces.
- Не переносить логику в `@shelkovo/markdown`.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/normalize.ts`
- `apps/www/src/lib/mentions/mentions.test.ts`

## Acceptance criteria

- [x] `linkDestinationOffsets` корректно обрабатывает labelled mentions с URL-encoded символами, либо явно падает с понятной ошибкой.
- [x] Replacement не наезжает на соседний markdown-текст.
- [x] Старые canonical и labelled mention tests остаются зелеными.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/mentions`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Исследовал поведение `remark-parse` для URL с encoded символами.
- [x] Исправил boundary calculation.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Harden linkDestinationOffsets against URL-encoded characters`
