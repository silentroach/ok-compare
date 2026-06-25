/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';
import type { Review } from '@/lib/reviews/types';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import ReviewCard from './ReviewCard.astro';

const review = {
  id: '2026-06-25-life-in-shelkovo-forest',
  slug: 'life-in-shelkovo-forest',
  area: 'forest',
  publishedAt: new Date('2026-06-25T00:00:00.000Z'),
  publishedIso: '2026-06-25',
  url: '/reviews/2026-06-25-life-in-shelkovo-forest/',
  markdownUrl: '/reviews/2026-06-25-life-in-shelkovo-forest/index.md',
  canonical: 'https://example.com/reviews/2026-06-25-life-in-shelkovo-forest/',
  body: 'Основной текст отзыва.',
  aspects: [{ type: 'place', rating: 5 }],
  mentions: [],
} satisfies Review;

describe('ReviewCard', () => {
  it('renders generated title, anonymous author, area, and aspect rating', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(ReviewCard, {
      props: { review },
    });

    expect(html).toContain('Отзыв собственника от 25 июня 2026');
    expect(html).toContain('Анонимный собственник');
    expect(html).toContain('Шелково Форест');
    expect(html).toContain('Место и среда');
    expect(html).toContain('5 из 5');
    expect(html).not.toContain('проверенный собственник');
  });
});
