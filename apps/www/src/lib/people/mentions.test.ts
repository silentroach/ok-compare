import { describe, expect, it } from 'vitest';

import {
  normalizePeopleMentions,
  type PeopleMentionRegistry,
} from './mentions';

const registry = new Map([
  [
    'kschemelinin',
    {
      slug: 'kschemelinin',
      name: 'Кирилл Щемелинин',
      html_url: '/people/kschemelinin/',
      markdown_url: '/people/kschemelinin/index.md',
    },
  ],
  [
    'apetrov',
    {
      slug: 'apetrov',
      name: 'Андрей Петров',
      html_url: '/people/apetrov/',
      markdown_url: '/people/apetrov/index.md',
    },
  ],
]) satisfies PeopleMentionRegistry;

describe('normalizePeopleMentions', () => {
  it('replaces mentions in prose with stable person links', () => {
    expect(
      normalizePeopleMentions({
        markdown:
          'Как отметил @kschemelinin, а позже (@apetrov) подтвердил вывод.',
        context: 'status incident "2026/04/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        'Как отметил [Кирилл Щемелинин](/people/kschemelinin/), а позже ([Андрей Петров](/people/apetrov/)) подтвердил вывод.',
      mentions: [registry.get('kschemelinin'), registry.get('apetrov')],
    });
  });

  it('skips inline code, existing links, and autolink-like urls', () => {
    const markdown =
      'Код `@kschemelinin`, ссылка [@kschemelinin](/docs) и https://example.com/@kschemelinin.\n\n```txt\n@kschemelinin\n```';

    expect(
      normalizePeopleMentions({
        markdown,
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown,
      mentions: [],
    });
  });

  it('fails on unknown person mentions', () => {
    expect(() =>
      normalizePeopleMentions({
        markdown: 'Текст с @unknown внутри.',
        context: 'people profile "test" body',
        registry,
      }),
    ).toThrow(
      'people profile "test" body contains unknown person mention "@unknown"',
    );
  });

  it('keeps repeated links in markdown but dedupes mentions in metadata', () => {
    expect(
      normalizePeopleMentions({
        markdown:
          '@kschemelinin согласовал работы, а позже @kschemelinin подтвердил вывод.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        '[Кирилл Щемелинин](/people/kschemelinin/) согласовал работы, а позже [Кирилл Щемелинин](/people/kschemelinin/) подтвердил вывод.',
      mentions: [registry.get('kschemelinin')],
    });
  });
});
