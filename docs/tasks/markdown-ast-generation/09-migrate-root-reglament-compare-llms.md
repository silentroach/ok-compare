# Task 09: Перевести корневые, регламентные и compare llms

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести оставшиеся `llms.txt` и `llms-full.txt` генераторы на пакетный AST API.

## Контекст

После Task 08 остаются корневые агентские тексты сайта, регламентные агентские тексты и Compare llms. Они агрегируют много URL и должны сохранить смысл маршрутов и discovery, но не обязаны сохранять старую строковую раскладку.

## Что сделать

- Переписать `apps/www/src/lib/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `apps/www/src/lib/reglament/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `apps/www/src/compare/lib/llms.ts` на mdast-документы через `@shelkovo/markdown`.
- Сохранить `.txt` маршруты, content type, публичные URL, названия файлов и агентский смысл.
- Обновить тесты discovery/llms, которые завязаны на эти тексты.

## Чего не делать

- Не менять контракты JSON feed, OpenAPI, schema или skills output.
- Не менять сопровождающие Markdown-страницы Compare. Они должны быть мигрированы в Task 07.
- Не менять регламентные сопровождающие Markdown-страницы. Они должны быть мигрированы в Tasks 05-06.
- Не добавлять отдельный сериализатор для `.txt`.

## Критерии приемки

- Корневые, регламентные и compare llms-генераторы используют пакетный AST API.
- `.txt` файлы остаются Markdown-совместимыми и пригодными для агентов.
- Сохраняются ключевые маршруты, feed, schema, OpenAPI, skills и примерные URL.
- Тесты, которые проверяют discovery-поверхности, обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/llms.test.ts src/lib/reglament src/compare/lib`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/llms.ts`
- `apps/www/src/lib/reglament/llms.ts`
- `apps/www/src/compare/lib/llms.ts`
- `apps/www/src/lib/llms.test.ts`
- `apps/www/src/lib/reglament/*.test.ts`
- `apps/www/src/compare/lib/*.test.ts`

## Зависимости

- Task 01
- Task 05
- Task 06
- Task 07
- Task 08 желательно выполнить раньше, чтобы все llms использовали один стиль
