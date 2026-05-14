# @shelkovo/markdown

Общий пакет для Markdown-рендера и типографики.

## Публичный API

- `render(markdown, options?)`
  Рендерит body markdown в HTML внутри обертки раздела или приложения. Применяет GFM, отбрасывает raw HTML и типографирует текстовые узлы. В `apps/www` нужно использовать `@/lib/markdown/render`, чтобы сначала сработали preprocessors приложения.

- `MarkdownPreprocessor`
  Тип для Markdown preprocessors приложения. Preprocessors выполняются до Markdown parsing, например для упоминаний вида `@person:case`.

- `RenderOptions`
  Позволяет передать в `render` один preprocessor или pipeline preprocessors. Options пакета должны оставаться универсальными; доменная логика живет в приложении.

- `extractFirstMarkdownText(markdown)`
  Достает excerpt или summary из Markdown source. Не рендерит HTML. Пропускает code, raw HTML, YAML и definitions; использует image alt text.

- `formatDynamicHtml(html)`
  Типографирует короткую готовую HTML/text-строку. Использовать для заголовков, labels и tooltip text, которые не нужно парсить как Markdown или оборачивать в `<p>`.

- `rehypeTypograf()`
  Настраивает внешний Markdown pipeline. Экспортируется для интеграций с framework, например Astro `markdown.rehypePlugins`; не вызывать для обычного рендера контента.

## Использование в `apps/www`

См. [ADR-003](../../docs/decisions/003-markdown-pipeline-layering.md) про слоистую модель Markdown-рендера.

- Body markdown в pages/components должен идти через `@/lib/markdown/render`.
- Обертка сайта вызывает пакетный `render` и держит локальные preprocessors, сейчас упоминания людей из `apps/www/src/lib/people/mentions.ts`.
- Если app-loader заранее сохраняет подготовленный body markdown для mentions/backlinks, он должен брать этот результат из той же обертки сайта, а не вызывать domain preprocessor напрямую.
- Импортировать `render` из `@shelkovo/markdown` напрямую можно только для низкоуровневой обертки или теста пакета.
- Импортировать `formatDynamicHtml` напрямую можно для non-markdown dynamic snippets.
- Импортировать `extractFirstMarkdownText` напрямую можно для excerpt из Markdown source.
- Импортировать `rehypeTypograf` напрямую можно только в config или custom unified/rehype pipeline setup.
