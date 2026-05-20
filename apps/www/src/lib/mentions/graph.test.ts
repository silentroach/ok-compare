import { describe, expect, it } from 'vitest';

import type { EntityMentionSourceRef } from './types';

import { createEntityMentionGraph, getEntityMentionGraphRefs } from './graph';

const ref = (
  input: Partial<EntityMentionSourceRef> &
    Pick<EntityMentionSourceRef, 'source_section' | 'source_id' | 'title'>,
): EntityMentionSourceRef => ({
  target_type: input.target_type ?? 'person',
  target_slug: input.target_slug ?? 'kschemelinin',
  source_kind: input.source_kind ?? 'article',
  html_url: input.html_url ?? `/${input.source_section}/${input.source_id}/`,
  markdown_url:
    input.markdown_url ??
    `/${input.source_section}/${input.source_id}/index.md`,
  ...input,
});

describe('createEntityMentionGraph', () => {
  it('groups refs by target entity and source section', () => {
    const graph = createEntityMentionGraph([
      ref({ source_section: 'news', source_id: 'a', title: 'Новость' }),
      ref({ source_section: 'status', source_id: 'b', title: 'Инцидент' }),
      ref({
        target_slug: 'apetrov',
        source_section: 'news',
        source_id: 'c',
        title: 'Другая новость',
      }),
    ]);

    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'news'),
    ).toHaveLength(1);
    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'status'),
    ).toHaveLength(1);
    expect(
      getEntityMentionGraphRefs(graph, 'person', 'apetrov', 'news'),
    ).toHaveLength(1);
  });

  it('dedupes repeated refs from one source unit to one target entity', () => {
    const graph = createEntityMentionGraph([
      ref({
        source_section: 'news',
        source_id: 'a',
        title: 'Первый заголовок',
      }),
      ref({
        source_section: 'news',
        source_id: 'a',
        title: 'Второй заголовок',
      }),
    ]);

    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'news'),
    ).toEqual([
      expect.objectContaining({
        source_id: 'a',
        title: 'Первый заголовок',
      }),
    ]);
  });

  it('sorts dated refs first by descending sort key, then ru title, then source id', () => {
    const graph = createEntityMentionGraph([
      ref({ source_section: 'news', source_id: 'z', title: 'Яма' }),
      ref({
        source_section: 'news',
        source_id: 'b',
        title: 'Бета',
        sort_key: 20,
      }),
      ref({
        source_section: 'news',
        source_id: 'a',
        title: 'Альфа',
        sort_key: 20,
      }),
      ref({
        source_section: 'news',
        source_id: 'c',
        title: 'Ремонт',
        sort_key: 30,
      }),
      ref({ source_section: 'news', source_id: 'y', title: 'Яма' }),
    ]);

    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'news').map(
        (item) => item.source_id,
      ),
    ).toEqual(['c', 'a', 'b', 'y', 'z']);
  });

  it('fails defensively on self-link source refs', () => {
    expect(() =>
      createEntityMentionGraph([
        ref({
          source_section: 'people',
          source_kind: 'person',
          source_id: 'kschemelinin',
          source_entity: { type: 'person', slug: 'kschemelinin' },
          title: 'Кирилл Щемелинин',
        }),
      ]),
    ).toThrow('self-link mention ref person:kschemelinin');
  });
});
