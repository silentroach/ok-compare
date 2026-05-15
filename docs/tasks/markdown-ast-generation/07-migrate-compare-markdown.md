# Task 07: Перевести Markdown Compare

## Статус

Выполнено

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести Markdown generators раздела `/815/compare/` на пакетный AST API.

## Контекст

Compare живет внутри `apps/www`, но имеет собственные URL-функции и данные. Markdown-файлы Compare используются для home, rating и detail-страниц поселков.

## Что сделать

- Переписать `apps/www/src/compare/lib/markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Сохранить URL-функции Compare, канонические пути, списки источников, текст рейтинга, факты поселков и навигацию.
- Обновить тесты Compare под новую сериализацию.
- Проверить, что ссылки по-прежнему ведут на `/815/compare/...`, а не на legacy домен или неправильную base path.

## Чего не делать

- Не менять compare данные, рейтинг или расчет расстояний.
- Не менять compare UI и стили.
- Не мигрировать `apps/www/src/compare/lib/llms.ts` в этой задаче. Это Task 09.
- Не запускать `pnpm dev`.

## Критерии приемки

- `buildHomeMd`, `buildRatingMd` и `buildSettlementMd` используют пакетный AST API.
- Markdown home/rating/detail сохраняют публичные discovery-ссылки.
- Списки источников и факты поселков остаются читаемыми.
- Тесты Compare обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare/lib/markdown.test.ts`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/compare/lib/markdown.ts`
- `apps/www/src/compare/lib/markdown.test.ts`

## Зависимости

- Task 01
