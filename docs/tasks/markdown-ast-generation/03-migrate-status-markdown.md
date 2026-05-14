# Task 03: Перевести Markdown статуса

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести сопровождающие Markdown-страницы раздела статуса на пакетный AST API.

## Контекст

Статус генерирует Markdown для главной, страниц сервисов и detail-страниц incidents. Detail incident содержит YAML frontmatter и вставляет редакционный Markdown из `incident.body`.

## Что сделать

- Переписать `apps/www/src/lib/status/markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Заменить ручную вспомогательную функцию frontmatter на пакетный frontmatter API.
- Вставлять `incident.body` через `parseMarkdownFragment`.
- Сохранить смысл сводок сервисов, active/planned/history списков, source links и incident frontmatter.
- Обновить тесты статуса под новую сериализацию.

## Чего не делать

- Не менять данные статуса.
- Не менять цепочку загрузки статуса, mentions или Markdown-to-HTML рендер.
- Не удалять общую вспомогательную функцию frontmatter в приложении, пока другие разделы могут ее использовать.
- Не добавлять ограничение импортов.

## Критерии приемки

- Все функции `buildStatus*Markdown` используют пакетный AST API.
- Detail incident Markdown сохраняет frontmatter и корректно вставляет Markdown-тело.
- Списки статуса сохраняют публичные ссылки и смысл метаданных.
- Тесты статуса обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/status/markdown.test.ts`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/status/markdown.ts`
- `apps/www/src/lib/status/markdown.test.ts`

## Зависимости

- Task 01
