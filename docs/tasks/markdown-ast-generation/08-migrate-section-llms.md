# Task 08: Перевести llms новостей, статуса и людей

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести `llms.txt` и `llms-full.txt` генераторы новостей, статуса и людей на пакетный AST API.

## Контекст

ADR-008 включает `llms.txt` и `llms-full.txt` в миграцию, потому что эти `.txt` файлы фактически используют Markdown-структуру: заголовки, разделы, списки, ссылки и inline code.

## Что сделать

- Переписать `apps/www/src/lib/news/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `apps/www/src/lib/status/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `apps/www/src/lib/people/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Сохранить `.txt` маршруты, content type, публичные URL, названия файлов и агентский смысл.
- Обновить тесты discovery/llms, которые завязаны на эти тексты.

## Чего не делать

- Не менять JSON feed contracts.
- Не менять сопровождающие Markdown-страницы разделов. Они уже должны быть мигрированы задачами 02-04.
- Не менять фактический текст ради редакционной правки.
- Не добавлять отдельный сериализатор для `.txt`.

## Критерии приемки

- News, status и people llms generators используют пакетный AST API.
- `.txt` файлы остаются Markdown-совместимыми и пригодными для агентов.
- Сохраняются ключевые route, feed, schema, OpenAPI и example URL.
- Тесты, которые проверяют discovery surfaces, обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/news src/lib/status src/lib/people`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/news/llms.ts`
- `apps/www/src/lib/status/llms.ts`
- `apps/www/src/lib/people/llms.ts`
- `apps/www/src/lib/*/*.test.ts`

## Зависимости

- Task 01
- Tasks 02-04 желательно выполнить раньше, чтобы section Markdown и section llms использовали один стиль генерации
