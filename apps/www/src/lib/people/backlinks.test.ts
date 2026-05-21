import { describe, expect, it } from 'vitest';

import {
  createEntityMentionGraph,
  type EntityMentionSourceRef,
} from '../mentions';
import { createPeopleBacklinksFromGraph } from './backlinks';

const refs: readonly EntityMentionSourceRef[] = [
  {
    targetType: 'person',
    targetSlug: 'kschemelinin',
    sourceSection: 'news',
    sourceKind: 'article',
    sourceId: '2026/05/power-outage',
    title: 'Повреждение линии 10 кВ',
    htmlUrl: '/news/2026/05/power-outage/',
    markdownUrl: '/news/2026/05/power-outage/index.md',
    mentionedAt: '2026-05-03T08:00:00.000+03:00',
    sortKey: 1777770000000,
  },
];

describe('createPeopleBacklinksFromGraph', () => {
  it('adapts domain mention graph refs into domain people backlinks', () => {
    expect(
      createPeopleBacklinksFromGraph(createEntityMentionGraph(refs), {
        slug: 'kschemelinin',
      }).news[0],
    ).toMatchObject({
      sourceId: '2026/05/power-outage',
      mentionedAt: '2026-05-03T08:00:00.000+03:00',
      sortKey: 1777770000000,
    });
  });
});
