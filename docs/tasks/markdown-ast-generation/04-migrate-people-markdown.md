# Task 04: Перевести Markdown людей

## Статус

Не начато

## Навыки

- `test-driven-development`
- `incremental-implementation`

## Цель

Перевести Markdown overview и detail Markdown профилей людей на пакетный AST API.

## Контекст

Раздел людей генерирует `/people/index.md` и Markdown detail pages через `buildPersonMarkdown` в `apps/www/src/lib/people/view.ts`. Detail page вставляет редакционный Markdown из `profile.body` и строит списки контактов и обратных ссылок.

## Что сделать

- Переписать `apps/www/src/lib/people/markdown.ts` на mdast-документы через `@shelkovo/markdown`.
- Переписать `buildPersonMarkdown` в `apps/www/src/lib/people/view.ts` на mdast-документ.
- Вставлять `profile.body` через `parseMarkdownFragment`.
- Сохранить ссылки контактов, группы backlinks, summary профилей и публичные URL.
- Обновить тесты людей под новую сериализацию.

## Чего не делать

- Не менять синтаксис people mentions, сбор обратных ссылок или Markdown-to-HTML рендер.
- Не менять данные людей.
- Не переписывать `extractFirstMarkdownText`.
- Не добавлять HTML-индекс `/people/`.

## Критерии приемки

- `buildPeopleHomeMarkdown` и `buildPersonMarkdown` используют пакетный AST API.
- Markdown body профиля сохраняет Markdown-семантику.
- Контакты и обратные ссылки остаются ссылками, а не обычным текстом.
- Тесты людей обновлены под новую сериализацию.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/lib/people`.
- Если точечный запуск неудобен для текущего раннера, запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/lib/people/markdown.ts`
- `apps/www/src/lib/people/view.ts`
- `apps/www/src/lib/people/view.test.ts`
- `apps/www/src/lib/people/*.test.ts`

## Зависимости

- Task 01
