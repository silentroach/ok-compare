# Task 02: Перевести Markdown новостей

## Статус

Выполнено

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести генераторы Markdown новостей на пакетный AST API из `@shelkovo/markdown`.

## Контекст

Новости используют сопровождающие Markdown-страницы для главной, архивов, тегов и detail-страниц. Detail-страница содержит YAML frontmatter и вставляет редакционный Markdown из `article.body` и тела дополнений.

## Что сделать

- Переписать `apps/www/src/lib/news/markdown.ts` на создание mdast-документов через `@shelkovo/markdown`.
- Заменить ручную вспомогательную функцию frontmatter на пакетный frontmatter API.
- Вставлять `article.body` и addenda body через `parseMarkdownFragment`, а не как обычный текст.
- Сохранить смысл frontmatter-полей, URL, заголовков, архивов, тегов, фото, вложений и addenda.
- Обновить тесты новостей под новую нормальную сериализацию.

## Чего не делать

- Не менять данные новостей в `apps/www/src/data/news`.
- Не менять Markdown-to-HTML рендер новостей.
- Не удалять общую вспомогательную функцию frontmatter в приложении, пока другие разделы могут ее использовать.
- Не сохранять старый вид вывода вручную.

## Критерии приемки

- Все функции `buildNews*Markdown` используют пакетный AST API.
- Detail Markdown новости сохраняет frontmatter и корректно вставляет body/addenda Markdown.
- Month/year/tag/home Markdown сохраняют публичные ссылки и смысл списков.
- Тесты новостей обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/news/markdown.ts`
- `apps/www/src/lib/news/markdown.test.ts`

## Зависимости

- Task 01
