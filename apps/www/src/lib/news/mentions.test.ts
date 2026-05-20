import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import type { NewsArticle } from './schema';

let createNewsArticleMentionRefs: typeof import('./mentions').createNewsArticleMentionRefs;

beforeAll(async () => {
  ({ createNewsArticleMentionRefs } = await import('./mentions'));
});

const target = createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин');

const article = (input?: {
  readonly mentions?: NewsArticle['mentions'];
}): Pick<
  NewsArticle,
  | 'id'
  | 'title'
  | 'url'
  | 'markdown_url'
  | 'body'
  | 'mentions'
  | 'published_iso'
  | 'published_at'
> => ({
  id: '2026/05/electricity',
  title: 'Авария на линии',
  url: '/news/2026/05/electricity/',
  markdown_url: '/news/2026/05/electricity/index.md',
  body: 'Первый абзац про [Кирилл Щемелинин](/people/kschemelinin/).\n\nВторой абзац.',
  mentions: input?.mentions ?? [target],
  published_iso: '2026-05-03T09:00:00+03:00',
  published_at: new Date('2026-05-03T06:00:00.000Z'),
});

describe('createNewsArticleMentionRefs', () => {
  it('creates article source refs with news presentation fields', () => {
    expect(createNewsArticleMentionRefs(article())).toEqual([
      {
        target_type: 'person',
        target_slug: 'kschemelinin',
        source_section: 'news',
        source_kind: 'article',
        source_id: '2026/05/electricity',
        title: 'Авария на линии',
        html_url: '/news/2026/05/electricity/',
        markdown_url: '/news/2026/05/electricity/index.md',
        excerpt: 'Первый абзац про Кирилл Щемелинин.',
        mentioned_at: '2026-05-03T09:00:00+03:00',
        sort_key: new Date('2026-05-03T06:00:00.000Z').valueOf(),
      },
    ]);
  });

  it('dedupes repeated targets inside one article', () => {
    expect(
      createNewsArticleMentionRefs(article({ mentions: [target, target] })),
    ).toHaveLength(1);
  });
});
