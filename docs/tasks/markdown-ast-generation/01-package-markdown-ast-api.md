# Task 01: Добавить AST API в `@shelkovo/markdown`

## Статус

Не начато

## Навыки

- `api-and-interface-design`
- `source-driven-development`
- `test-driven-development`
- `turborepo`

## Цель

Добавить в `@shelkovo/markdown` публичный API для сборки, парсинга и сериализации mdast-документов, чтобы остальные задачи могли мигрировать генераторы без локальных строковых сериализаторов.

## Контекст

ADR-008 выбрал mdast и пакетный слой генерации. Текущий пакет уже содержит Markdown-to-HTML рендер, типографику и извлечение обычного текста. Новый слой должен быть рядом, но не должен ломать ADR-003 и рендер Markdown-тела в `apps/www`.

## Что сделать

- Добавить зависимости, нужные для генерации: `mdast-util-to-markdown`, `mdast-util-from-markdown`, `mdast-util-gfm`, `mdast-util-frontmatter`, `yaml` и типы mdast, если они нужны явно.
- Создать модуль генерации в `packages/markdown/src`, например `generate.ts` или близкое название.
- Экспортировать `serializeMarkdownDocument`, `parseMarkdownFragment`, `createMarkdownDocument` и набор тонких функций для частых mdast-узлов.
- Настроить сериализатор на единый стиль: `-` для ненумерованных списков, `1.` для нумерованных, ATX-заголовки, fenced code blocks, GFM и финальный перевод строки.
- Реализовать YAML frontmatter через `yaml`, без принудительных кавычек у всех строк.
- Обновить `packages/markdown/src/index.ts` и `packages/markdown/README.md`.
- Добавить тесты пакета на frontmatter, GFM-таблицу, вложенный список, Markdown-фрагмент и экранирование небезопасных символов.

## Чего не делать

- Не мигрировать `apps/www` в этой задаче.
- Не менять существующий `render` и типографику, кроме необходимых экспортов или общих типов.
- Не добавлять доменную логику people, news, status, reglament или compare в пакет.
- Не добавлять ограничение импортов против строковых генераторов.

## Критерии приемки

- Пакет экспортирует стабильный API генерации Markdown.
- Frontmatter сериализуется YAML-сериализатором и не оборачивает все строки в кавычки без необходимости.
- `parseMarkdownFragment` возвращает mdast-узлы, которые можно вставить в документ без потери Markdown-семантики.
- Тесты пакета покрывают основные узлы, GFM, frontmatter и экранирование.

## Проверка

- Запустить `pnpm --filter @shelkovo/markdown test`.
- Запустить `pnpm --filter @shelkovo/markdown typecheck`.
- Если менялись зависимости workspace, убедиться, что lock-файл обновлен корректно.

## Вероятно затронутые файлы

- `packages/markdown/package.json`
- `packages/markdown/src/index.ts`
- `packages/markdown/src/*.ts`
- `packages/markdown/src/index.test.ts`
- `packages/markdown/README.md`
- `pnpm-lock.yaml`

## Зависимости

Нет. Это первая задача.
