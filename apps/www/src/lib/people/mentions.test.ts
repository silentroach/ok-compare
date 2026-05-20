import { describe, expect, it } from 'vitest';

import {
  createPersonMentionTarget,
  normalizePeopleMentions,
  type PeopleMentionRegistry,
} from './mentions';

const registry = new Map([
  [
    'kschemelinin',
    createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
  ],
  ['apetrov', createPersonMentionTarget('apetrov', 'Андрей Петров')],
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

  it('replaces labelled mention destinations with stable person links', () => {
    expect(
      normalizePeopleMentions({
        markdown:
          'По словам [главного по электричеству](@kschemelinin), работы идут.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        'По словам [главного по электричеству](/people/kschemelinin/), работы идут.',
      mentions: [registry.get('kschemelinin')],
    });
  });

  it('keeps normal links unchanged while normalizing labelled mentions', () => {
    expect(
      normalizePeopleMentions({
        markdown:
          '[канал](https://example.com) подтвердил [главному по электричеству](@kschemelinin) детали.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        '[канал](https://example.com) подтвердил [главному по электричеству](/people/kschemelinin/) детали.',
      mentions: [registry.get('kschemelinin')],
    });
  });

  it('fails on name cases in labelled mention destinations', () => {
    expect(() =>
      normalizePeopleMentions({
        markdown: '[главного по электричеству](@kschemelinin:gen)',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toThrow(
      'news article "2026/05/test" body contains unsupported labelled entity mention "@kschemelinin:gen"; write the needed grammar in the visible link text',
    );
  });

  it('fails on unknown labelled person mentions', () => {
    expect(() =>
      normalizePeopleMentions({
        markdown: 'Текст с [подрядчиком](@unknown) внутри.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toThrow(
      'news article "2026/05/test" body contains unknown entity mention "@unknown"',
    );
  });

  it('dedupes labelled and canonical mentions in metadata', () => {
    expect(
      normalizePeopleMentions({
        markdown:
          '[главный по электричеству](@kschemelinin) сообщил, что @kschemelinin проверил сеть.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        '[главный по электричеству](/people/kschemelinin/) сообщил, что [Кирилл Щемелинин](/people/kschemelinin/) проверил сеть.',
      mentions: [registry.get('kschemelinin')],
    });
  });

  it('skips inline code, images, existing links, and autolink-like urls', () => {
    const markdown =
      'Код `@kschemelinin`, картинка ![@kschemelinin](@kschemelinin), ссылка [@kschemelinin](/docs) и https://example.com/@kschemelinin.\n\n```txt\n@kschemelinin\n```';

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
      'people profile "test" body contains unknown entity mention "@unknown"',
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
