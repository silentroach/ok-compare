# @shelkovo/markdown

Shared markdown rendering and typography helpers.

## Public API

- `render(markdown, options?)`
  Render markdown body into HTML inside a section/app wrapper. Applies GFM, drops raw HTML, and typographs text nodes. In `apps/www`, prefer `@/lib/markdown/render` so app preprocessors can run first.

- `MarkdownPreprocessor`
  Type app-specific markdown preprocessing functions. Preprocessors run before markdown parsing, for cases like `@person:case` mentions.

- `RenderOptions`
  Pass one preprocessor or a preprocessor pipeline to `render`. Keep package options generic; domain logic belongs in the app.

- `extractFirstMarkdownText(markdown)`
  Build excerpts or summaries from markdown source. Does not render HTML. Skips code, raw HTML, yaml and definitions; uses image alt text.

- `formatDynamicHtml(html)`
  Typograph a short ready-made HTML/text string. Use for headlines, labels and tooltip text that should not be parsed as markdown or wrapped in `<p>`.

- `rehypeTypograf()`
  Configure an external markdown pipeline. Exported for framework integrations such as Astro `markdown.rehypePlugins`; do not call it for normal content rendering.

## `apps/www` Usage

- Body markdown in pages/components should use `@/lib/markdown/render`.
- The site wrapper calls package `render` and can attach local preprocessors, currently people mentions from `apps/www/src/lib/people/mentions.ts`.
- Import `render` from `@shelkovo/markdown` directly only when writing a low-level wrapper or package test.
- Import `formatDynamicHtml` directly for non-markdown dynamic snippets.
- Import `extractFirstMarkdownText` directly for excerpts from markdown source.
- Import `rehypeTypograf` directly only in config or custom unified/rehype pipeline setup.
