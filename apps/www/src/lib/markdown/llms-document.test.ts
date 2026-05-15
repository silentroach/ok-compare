import { describe, expect, it } from 'vitest';

import { serializeMarkdownLineDocument } from './llms-document';

describe('serializeMarkdownLineDocument', () => {
  it('builds llms documents through mdast while preserving inline Markdown', () => {
    expect(
      serializeMarkdownLineDocument(
        [
          'Agent Surface',
          'Файл: llms.txt',
          'Язык: русский',
          '',
          'Главные URL',
          '- Home: https://example.test/',
          '- Feed: https://example.test/feed.json with `json`',
        ],
        new Set(['Главные URL']),
      ),
    ).toMatchInlineSnapshot(`
      "# Agent Surface

      Файл: llms.txt
      Язык: русский

      ## Главные URL

      - Home: <https://example.test/>
      - Feed: <https://example.test/feed.json> with \`json\`
      "
    `);
  });
});
