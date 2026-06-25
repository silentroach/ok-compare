import { beforeAll, describe, expect, it } from 'vitest';

import type { Review } from './types';

let reviewPageSchema: typeof import('./seo').reviewPageSchema;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ reviewPageSchema } = await import('./seo'));
});

const review = {
  id: '2026-06-25-life-in-shelkovo-forest',
  slug: 'life-in-shelkovo-forest',
  title: 'Год жизни в Шелково',
  author: 'Алексей',
  area: 'forest',
  publishedAt: new Date('2026-06-25T00:00:00.000Z'),
  publishedIso: '2026-06-25',
  url: '/reviews/2026-06-25-life-in-shelkovo-forest/',
  markdownUrl: '/reviews/2026-06-25-life-in-shelkovo-forest/index.md',
  canonical: 'https://example.com/reviews/2026-06-25-life-in-shelkovo-forest/',
  body: 'Основной **текст** отзыва.',
  aspects: [{ type: 'place', rating: 5 }],
  mentions: [],
} satisfies Review;

describe('reviewPageSchema', () => {
  it('publishes a text Review without AggregateRating', () => {
    const schema = reviewPageSchema({ review, breadcrumbs: [] });
    const reviewDoc = schema.find((item) => item['@type'] === 'Review');

    expect(reviewDoc).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Алексей' },
      datePublished: '2026-06-25',
      itemReviewed: { '@type': 'Place', name: 'КП Шелково' },
    });
    expect(JSON.stringify(schema)).not.toContain('AggregateRating');
    expect(JSON.stringify(schema)).toContain('reviewAspect');
  });
});
