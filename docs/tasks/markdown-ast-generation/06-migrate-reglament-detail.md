# Task 06: Перевести детальный Markdown регламента

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести детальные Markdown-файлы регламента на пакетный AST API.

## Контекст

`detail-markdown.ts` генерирует индекс детальной сметы, тематические файлы материалов, машин, труда и проверок. Это самый большой генератор Markdown в регламенте, поэтому задача должна быть выполнена аккуратно и с опорой на существующие тесты.

## Что сделать

- Переписать `apps/www/src/lib/reglament/detail-markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Сохранить grouping по `estimate_row_id`, labels источников, source refs, quote items, суммы, статусы и `needs_check`-маркеры.
- Обновить снимки и точечные assertions под новую нормальную сериализацию.
- При необходимости ввести локальные маленькие вспомогательные функции внутри файла, но не создавать второй сериализатор Markdown вне `@shelkovo/markdown`.

## Чего не делать

- Не менять данные `estimate-details-2026`.
- Не менять расчеты, форматтеры денег и чисел.
- Не мигрировать `llms` регламента. Это Task 09.
- Не добавлять новые публичные поля в JSON.

## Критерии приемки

- Все `buildEstimateDetail*Markdown` используют пакетный AST API.
- Тесты продолжают доказывать, что материалы, машины, труд и checks остаются ответоспособными для агентов.
- Source labels и quote items остаются читаемыми и машинно пригодными.
- Нет локальной ручной сериализации целых Markdown-документов.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/reglament/detail-markdown.test.ts`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/reglament/detail-markdown.ts`
- `apps/www/src/lib/reglament/detail-markdown.test.ts`

## Зависимости

- Task 01
- Task 05 желательно выполнить раньше, чтобы использовать уже сложившийся стиль локальных функций регламента
