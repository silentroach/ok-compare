import { describe, expect, it } from 'vitest';

import {
  createSiteMentionRegistry,
  normalizeEntityMentions,
  type SiteMentionRegistry,
} from './index';

const targets = [
  {
    type: 'person',
    slug: 'kschemelinin',
    label: 'Кирилл Щемелинин',
    label_cases: {
      gen: 'Кирилла Щемелинина',
    },
    html_url: '/people/kschemelinin/',
    markdown_url: '/people/kschemelinin/index.md',
    link_title: 'депутат, КПРФ',
  },
  {
    type: 'person',
    slug: 'apetrov',
    label: 'Андрей Петров',
    html_url: '/people/apetrov/',
    markdown_url: '/people/apetrov/index.md',
  },
] as const;

const registry = createSiteMentionRegistry(targets);

describe('createSiteMentionRegistry', () => {
  it('rejects duplicate short slugs before body normalization', () => {
    expect(() =>
      createSiteMentionRegistry([
        targets[0],
        {
          type: 'person',
          slug: 'kschemelinin',
          label: 'Другой Кирилл',
          html_url: '/people/other/',
          markdown_url: '/people/other/index.md',
        },
      ]),
    ).toThrow('duplicate entity mention slug "kschemelinin"');
  });
});

describe('normalizeEntityMentions', () => {
  it('replaces canonical mentions with entity labels and stable links', () => {
    expect(
      normalizeEntityMentions({
        markdown:
          'Как отметил @kschemelinin:gen, а позже @apetrov подтвердил вывод.',
        context: 'status incident "2026/04/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        'Как отметил [Кирилла Щемелинина](/people/kschemelinin/ "депутат, КПРФ"), а позже [Андрей Петров](/people/apetrov/) подтвердил вывод.',
      mentions: [targets[0], targets[1]],
    });
  });

  it('replaces labelled mention destinations while preserving visible text', () => {
    expect(
      normalizeEntityMentions({
        markdown:
          'По словам [главного по электричеству](@kschemelinin), работы идут.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        'По словам [главного по электричеству](/people/kschemelinin/), работы идут.',
      mentions: [targets[0]],
    });
  });

  it('fails when canonical mention requests a missing label case', () => {
    expect(() =>
      normalizeEntityMentions({
        markdown: 'По словам @apetrov:gen, работы идут.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toThrow(
      'news article "2026/05/test" body contains entity mention "@apetrov:gen", but entity "person:apetrov" has no "gen" label case',
    );
  });

  it('fails on unknown short slugs', () => {
    expect(() =>
      normalizeEntityMentions({
        markdown: 'Текст с @unknown внутри.',
        context: 'people profile "test" body',
        registry,
      }),
    ).toThrow(
      'people profile "test" body contains unknown entity mention "@unknown"',
    );
  });

  it('keeps labelled mention case modifiers unsupported', () => {
    expect(() =>
      normalizeEntityMentions({
        markdown: '[главного по электричеству](@kschemelinin:gen)',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toThrow(
      'news article "2026/05/test" body contains unsupported labelled entity mention "@kschemelinin:gen"; write the needed grammar in the visible link text',
    );
  });

  it('fails when canonical mentions link the source entity to itself', () => {
    expect(() =>
      normalizeEntityMentions({
        markdown: 'Профиль ведет на @kschemelinin.',
        context: 'people profile "kschemelinin" body',
        registry,
        source_entity: { type: 'person', slug: 'kschemelinin' },
      }),
    ).toThrow(
      'people profile "kschemelinin" body contains self entity mention "person:kschemelinin"',
    );
  });

  it('fails when labelled mentions link the source entity to itself', () => {
    expect(() =>
      normalizeEntityMentions({
        markdown: 'Профиль ведет на [свой профиль](@kschemelinin).',
        context: 'people profile "kschemelinin" body',
        registry,
        source_entity: { type: 'person', slug: 'kschemelinin' },
      }),
    ).toThrow(
      'people profile "kschemelinin" body contains self entity mention "person:kschemelinin"',
    );
  });

  it('dedupes mentions by target type and slug in first appearance order', () => {
    expect(
      normalizeEntityMentions({
        markdown:
          '@kschemelinin согласовал работы, [подрядчик](@apetrov) подтвердил, а @kschemelinin проверил сеть.',
        context: 'news article "2026/05/test" body',
        registry,
      }),
    ).toEqual({
      markdown:
        '[Кирилл Щемелинин](/people/kschemelinin/ "депутат, КПРФ") согласовал работы, [подрядчик](/people/apetrov/) подтвердил, а [Кирилл Щемелинин](/people/kschemelinin/ "депутат, КПРФ") проверил сеть.',
      mentions: [targets[0], targets[1]],
    });
  });

  it('keeps markdown without mention registry matches unchanged', () => {
    const emptyRegistry: SiteMentionRegistry = new Map();
    const markdown = 'Код `@kschemelinin` и https://example.com/@kschemelinin.';

    expect(
      normalizeEntityMentions({
        markdown,
        context: 'news article "2026/05/test" body',
        registry: emptyRegistry,
      }),
    ).toEqual({ markdown, mentions: [] });
  });
});
