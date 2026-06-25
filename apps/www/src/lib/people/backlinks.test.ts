import { describe, expect, it } from 'vitest';

import {
  createEntityMentionGraph,
  type EntityMentionSourceRef,
} from '../mentions';
import { createPeopleBacklinksFromGraph } from './backlinks';

const refs: readonly EntityMentionSourceRef[] = [
  {
    target: { type: 'person', slug: 'kschemelinin' },
    source: { section: 'news', kind: 'article', id: '2026/05/power-outage' },
    title: 'Повреждение линии 10 кВ',
    htmlUrl: '/news/2026/05/power-outage/',
    markdownUrl: '/news/2026/05/power-outage/index.md',
    mentionedAt: '2026-05-03T08:00:00.000+03:00',
    sortKey: 1777770000000,
  },
  {
    target: { type: 'person', slug: 'kschemelinin' },
    source: { section: 'reviews', kind: 'review', id: '2026-06-25-test' },
    title: 'Отзыв собственника от 25 июня 2026',
    htmlUrl: '/reviews/2026-06-25-test/',
    markdownUrl: '/reviews/2026-06-25-test/index.md',
    mentionedAt: '2026-06-25T00:00:00.000Z',
    sortKey: 1782345600000,
  },
];

describe('createPeopleBacklinksFromGraph', () => {
  it('adapts domain mention graph refs into domain people backlinks', () => {
    expect(
      createPeopleBacklinksFromGraph(createEntityMentionGraph(refs), {
        slug: 'kschemelinin',
      }),
    ).toMatchInlineSnapshot(`
      {
        "news": [
          {
            "excerpt": undefined,
            "htmlUrl": "/news/2026/05/power-outage/",
            "kind": "article",
            "markdownUrl": "/news/2026/05/power-outage/index.md",
            "mentionedAt": "2026-05-03T08:00:00.000+03:00",
            "section": "news",
            "sortKey": 1777770000000,
            "sourceId": "2026/05/power-outage",
            "title": "Повреждение линии 10 кВ",
          },
        ],
        "people": [],
        "reviews": [
          {
            "excerpt": undefined,
            "htmlUrl": "/reviews/2026-06-25-test/",
            "kind": "review",
            "markdownUrl": "/reviews/2026-06-25-test/index.md",
            "mentionedAt": "2026-06-25T00:00:00.000Z",
            "section": "reviews",
            "sortKey": 1782345600000,
            "sourceId": "2026-06-25-test",
            "title": "Отзыв собственника от 25 июня 2026",
          },
        ],
        "status": [],
      }
    `);
  });
});
