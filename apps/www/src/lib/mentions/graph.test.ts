import { describe, expect, it } from 'vitest';

import type { EntityMentionSourceRef } from './types';

import { createEntityMentionGraph, getEntityMentionGraphRefs } from './graph';

const ref = (
  input: Partial<EntityMentionSourceRef> &
    Pick<EntityMentionSourceRef, 'sourceSection' | 'sourceId' | 'title'>,
): EntityMentionSourceRef => ({
  targetType: input.targetType ?? 'person',
  targetSlug: input.targetSlug ?? 'kschemelinin',
  sourceKind: input.sourceKind ?? 'article',
  htmlUrl: input.htmlUrl ?? `/${input.sourceSection}/${input.sourceId}/`,
  markdownUrl:
    input.markdownUrl ?? `/${input.sourceSection}/${input.sourceId}/index.md`,
  ...input,
});

describe('createEntityMentionGraph', () => {
  it('groups refs by target entity and source section', () => {
    const graph = createEntityMentionGraph([
      ref({ sourceSection: 'news', sourceId: 'a', title: 'Новость' }),
      ref({ sourceSection: 'status', sourceId: 'b', title: 'Инцидент' }),
      ref({
        targetSlug: 'apetrov',
        sourceSection: 'news',
        sourceId: 'c',
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
        sourceSection: 'news',
        sourceId: 'a',
        title: 'Первый заголовок',
      }),
      ref({
        sourceSection: 'news',
        sourceId: 'a',
        title: 'Второй заголовок',
      }),
    ]);

    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'news'),
    ).toEqual([
      expect.objectContaining({
        sourceId: 'a',
        title: 'Первый заголовок',
      }),
    ]);
  });

  it('sorts dated refs first by descending sort key, then ru title, then source id', () => {
    const graph = createEntityMentionGraph([
      ref({ sourceSection: 'news', sourceId: 'z', title: 'Яма' }),
      ref({
        sourceSection: 'news',
        sourceId: 'b',
        title: 'Бета',
        sortKey: 20,
      }),
      ref({
        sourceSection: 'news',
        sourceId: 'a',
        title: 'Альфа',
        sortKey: 20,
      }),
      ref({
        sourceSection: 'news',
        sourceId: 'c',
        title: 'Ремонт',
        sortKey: 30,
      }),
      ref({ sourceSection: 'news', sourceId: 'y', title: 'Яма' }),
    ]);

    expect(
      getEntityMentionGraphRefs(graph, 'person', 'kschemelinin', 'news').map(
        (item) => item.sourceId,
      ),
    ).toEqual(['c', 'a', 'b', 'y', 'z']);
  });

  it('fails defensively on self-link source refs', () => {
    expect(() =>
      createEntityMentionGraph([
        ref({
          sourceSection: 'people',
          sourceKind: 'person',
          sourceId: 'kschemelinin',
          sourceEntity: { type: 'person', slug: 'kschemelinin' },
          title: 'Кирилл Щемелинин',
        }),
      ]),
    ).toThrow('self-link mention ref person:kschemelinin');
  });
});
