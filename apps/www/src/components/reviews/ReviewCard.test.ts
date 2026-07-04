/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';
import type { Review } from '@/lib/reviews/types';
import { visibleWhitespace } from '@/lib/test/visible-whitespace';

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

const visibleText = (html: string): string =>
  html
    .replace(/<[^>]*>/gu, ' ')
    .replace(/&nbsp;|&#160;|&#xA0;/giu, '\u00A0')
    .replace(/[\t\n\r ]+/gu, ' ')
    .trim();

describe('ReviewCard', () => {
  it('renders generated title, anonymous author, area, and aspect rating', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(ReviewCard, {
      props: { review },
    });

    expect(visibleWhitespace(visibleText(html))).toMatchInlineSnapshot(
      `"Отзыв собственника от 25 июня 2026 25 июня 2026 • Анонимный собственник • Шелково Форест Место и среда: 5 из 5"`,
    );
  });
});
