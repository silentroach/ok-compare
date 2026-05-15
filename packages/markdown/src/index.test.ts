import { describe, expect, it } from 'vitest';

import {
  createMarkdownDocument,
  extractFirstMarkdownText,
  formatDynamicHtml,
  md,
  parseMarkdownFragment,
  render,
  serializeMarkdownDocument,
} from './index';

describe('@shelkovo/markdown', () => {
  it('serializes YAML frontmatter without quoting every string', () => {
    const document = createMarkdownDocument({
      frontmatter: {
        title: 'Новости Шелково',
        draft: false,
        tags: ['новости', 'город'],
      },
      children: [md.heading(1, 'Заголовок')],
    });

    expect(serializeMarkdownDocument(document)).toMatchInlineSnapshot(`
      "---
      title: Новости Шелково
      draft: false
      tags:
        - новости
        - город
      ---

      # Заголовок
      "
    `);
  });

  it('serializes nested lists with package style markers', () => {
    expect(
      serializeMarkdownDocument(
        createMarkdownDocument({
          children: [
            md.list([
              md.listItem([
                md.paragraph('Первый'),
                md.list([md.listItem('Вложенный'), md.listItem('Еще один')]),
              ]),
              md.listItem('Второй'),
            ]),
            md.list(
              [md.listItem('Один'), md.listItem('Два'), md.listItem('Три')],
              { ordered: true },
            ),
          ],
        }),
      ),
    ).toMatchInlineSnapshot(`
      "- Первый
        - Вложенный
        - Еще один
      - Второй

      1. Один
      1. Два
      1. Три
      "
    `);
  });

  it('rejects table nodes in generated Markdown documents', () => {
    expect(() =>
      serializeMarkdownDocument(
        createMarkdownDocument({
          children: [{ type: 'table', children: [] }],
        }),
      ),
    ).toThrow('Markdown tables are not supported; use lists.');
  });

  it('parses Markdown fragments for insertion into generated documents', () => {
    const fragment = parseMarkdownFragment(
      'Авторский **текст** с [ссылкой](https://example.com).',
    );

    expect(
      serializeMarkdownDocument(
        createMarkdownDocument({
          children: [md.heading(2, 'Фрагмент'), ...fragment],
        }),
      ),
    ).toMatchInlineSnapshot(`
      "## Фрагмент

      Авторский **текст** с [ссылкой](https://example.com).
      "
    `);
  });

  it('escapes unsafe Markdown characters when serializing text nodes', () => {
    expect(
      serializeMarkdownDocument(
        createMarkdownDocument({
          children: [md.paragraph('- пункт\n![alt](bad)')],
        }),
      ),
    ).toMatchInlineSnapshot(`
      "\\- пункт
      !\\[alt]\\(bad)
      "
    `);
  });

  it('formats dynamic HTML with project typography rules', () => {
    expect(formatDynamicHtml('Шелково Ривер')).toBe('Шелково\u00A0Ривер');
    expect(formatDynamicHtml('<p>Шелково Парк</p>')).toBe(
      '<p>Шелково\u00A0Парк</p>',
    );
    expect(formatDynamicHtml('Новости Шелково')).toBe('Новости Шелково');
  });

  it('renders markdown and drops raw HTML', () => {
    expect(render('Текст **важный**\n\n<script>alert(1)</script>'))
      .toMatchInlineSnapshot(`
        "<p>Текст <strong>важный</strong></p>"
      `);
  });

  it('rejects tables when rendering Markdown strings', () => {
    expect(() =>
      render('| Ключ | Значение |\n| --- | --- |\n| A | B |'),
    ).toThrow('Markdown tables are not supported; use lists.');
  });

  it('preprocesses markdown before rendering', () => {
    expect(
      render('Привет, @person', {
        preprocess: (markdown) =>
          markdown.replace('@person', '[Анна](/people/anna/)'),
      }),
    ).toBe('<p>Привет, <a href="/people/anna/">Анна</a></p>');
  });

  it('extracts first readable markdown text', () => {
    expect(
      extractFirstMarkdownText(`
\`\`\`ts
const value = 1
\`\`\`

![Река](river.jpg)

Первый **абзац** с [ссылкой](https://example.com).
`),
    ).toBe('Река');

    expect(
      extractFirstMarkdownText('```ts\nconst value = 1\n```'),
    ).toBeUndefined();
  });
});
