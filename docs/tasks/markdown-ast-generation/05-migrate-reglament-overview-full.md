# Task 05: Перевести обзорный и полный Markdown регламента

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести обзорный Markdown регламента и полный регламентный Markdown на пакетный AST API.

## Контекст

Регламент имеет несколько сопровождающих Markdown-страниц: основной обзор по смете 2026 и тематические файлы полного регламента. Эти документы в основном строятся из структурных данных, ссылок, списков и встроенного кода.

## Что сделать

- Переписать `apps/www/src/lib/reglament/markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `apps/www/src/lib/reglament/full-markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Сохранить публичные URL, source refs, id, inline code и смысл списков.
- Обновить или добавить тесты, которые фиксируют важные публичные контракты этих Markdown-файлов без привязки к старой ручной раскладке строк.

## Чего не делать

- Не менять расчеты регламента и structured datasets.
- Не мигрировать `detail-markdown.ts` в этой задаче. Это Task 06.
- Не менять `llms` регламента. Это Task 09.
- Не сохранять старый вид вывода вручную.

## Критерии приемки

- `buildReglamentMarkdown` использует пакетный AST API.
- Все `buildFullReglament*Markdown` используют пакетный AST API.
- Source refs, тематические ссылки, id и inline code остаются пригодными для машинного чтения.
- Тесты покрывают важные URL и стабильные структурные маркеры.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/reglament`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/reglament/markdown.ts`
- `apps/www/src/lib/reglament/full-markdown.ts`
- `apps/www/src/lib/reglament/*.test.ts`

## Зависимости

- Task 01
