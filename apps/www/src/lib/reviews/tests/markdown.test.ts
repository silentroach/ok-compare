import { beforeAll, describe, expect, it } from 'vitest';

import type { Review } from '../types';

let buildReviewMarkdown: typeof import('../markdown').buildReviewMarkdown;
let buildReviewsHomeMarkdown: typeof import('../markdown').buildReviewsHomeMarkdown;
let buildReviewsRulesMarkdown: typeof import('../markdown').buildReviewsRulesMarkdown;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({
    buildReviewMarkdown,
    buildReviewsHomeMarkdown,
    buildReviewsRulesMarkdown,
  } = await import('../markdown'));
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
  body: 'Основной текст отзыва.',
  aspects: [
    { type: 'place', rating: 5, body: 'Лес, пруды и тишина.' },
    { type: 'management', rating: 2 },
  ],
  mentions: [],
} satisfies Review;

describe('reviews markdown companions', () => {
  it('renders empty launch home without internal paths', () => {
    const markdown = buildReviewsHomeMarkdown({ reviews: [], byId: new Map() });

    expect(markdown).toContain('# Отзывы собственников Шелково');
    expect(markdown).toContain('https://example.com/reviews/rules/index.md');
    expect(markdown).toContain('Первые отзывы еще не опубликованы.');
    expect(markdown).not.toContain('src/data');
  });

  it('renders rules markdown with Telegram and reaction channel', () => {
    const markdown = buildReviewsRulesMarkdown();

    expect(markdown).toContain('# Правила публикации отзывов');
    expect(markdown).toContain('https://t.me/silentroach');
    expect(markdown).toContain(
      'Если вы считаете, что отзыв нарушает ваши права',
    );
  });

  it('renders review detail markdown with frontmatter, body, and aspects', () => {
    const markdown = buildReviewMarkdown(review);

    expect(markdown).toContain('title: Год жизни в Шелково');
    expect(markdown).toContain('published_at: 2026-06-25');
    expect(markdown).toContain('# Год жизни в Шелково');
    expect(markdown).toContain('Основной текст отзыва.');
    expect(markdown).toContain('Место и среда');
    expect(markdown).toContain('Оценка: 5 из 5');
    expect(markdown).toContain('Обслуживание');
  });
});
