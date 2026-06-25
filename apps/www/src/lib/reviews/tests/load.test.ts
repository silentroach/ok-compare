import { beforeAll, describe, expect, it } from 'vitest';

import type { ReviewEntry } from '../load';

let buildReviewsDataset: typeof import('../load').buildReviewsDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildReviewsDataset } = await import('../load'));
});

const entry = (input: {
  readonly id: string;
  readonly body?: string;
  readonly data: ReviewEntry['data'];
}): ReviewEntry => ({
  id: input.id,
  body: input.body ?? 'Основной текст отзыва.',
  data: input.data,
});

describe('buildReviewsDataset', () => {
  it('accepts an empty launch dataset', () => {
    const data = buildReviewsDataset([]);

    expect(data.reviews).toEqual([]);
    expect(data.byId.size).toBe(0);
  });

  it('maps raw review entries to readonly camelCase domain reviews sorted newest first', () => {
    const data = buildReviewsDataset([
      entry({
        id: '2026-06-24-older-review',
        data: {
          published_at: '2026-06-24',
          slug: 'older-review',
          area: 'river',
        },
      }),
      entry({
        id: '2026-06-25-life-in-shelkovo-forest',
        body: 'Основной текст отзыва с @kschemelinin.',
        data: {
          published_at: '2026-06-25',
          slug: 'life-in-shelkovo-forest',
          area: 'forest',
          title: 'Год жизни в Шелково',
          aspects: [
            { type: 'place', rating: 5, body: 'Лес, пруды и тишина.' },
            { type: 'management', rating: 2 },
          ],
        },
      }),
    ]);

    expect(data.reviews.map((item) => item.id)).toEqual([
      '2026-06-25-life-in-shelkovo-forest',
      '2026-06-24-older-review',
    ]);
    expect(data.byId.get('2026-06-25-life-in-shelkovo-forest')).toMatchObject({
      slug: 'life-in-shelkovo-forest',
      title: 'Год жизни в Шелково',
      area: 'forest',
      publishedIso: '2026-06-25',
      url: '/reviews/2026-06-25-life-in-shelkovo-forest/',
      markdownUrl: '/reviews/2026-06-25-life-in-shelkovo-forest/index.md',
      canonical:
        'https://example.com/reviews/2026-06-25-life-in-shelkovo-forest/',
      aspects: [
        { type: 'place', rating: 5, body: 'Лес, пруды и тишина.' },
        { type: 'management', rating: 2 },
      ],
    });
  });

  it('fails when entry id does not match published_at and slug', () => {
    expect(() =>
      buildReviewsDataset([
        entry({
          id: '2026-06-25-wrong-id',
          data: {
            published_at: '2026-06-25',
            slug: 'real-slug',
            area: 'forest',
          },
        }),
      ]),
    ).toThrow(
      'review "2026-06-25-wrong-id" id must equal "2026-06-25-real-slug"',
    );
  });

  it('fails on blank markdown body', () => {
    expect(() =>
      buildReviewsDataset([
        entry({
          id: '2026-06-25-blank-body',
          body: '   ',
          data: {
            published_at: '2026-06-25',
            slug: 'blank-body',
            area: 'park',
          },
        }),
      ]),
    ).toThrow('review "2026-06-25-blank-body" body is required');
  });
});
