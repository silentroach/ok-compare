/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';
import type { ReviewAspect } from '@/lib/reviews/types';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import ReviewAspectList from './ReviewAspectList.astro';

const aspects: readonly ReviewAspect[] = [
  { type: 'management', body: 'Отвечают не всегда быстро.' },
  { type: 'place', rating: 5 },
  { type: 'developer', rating: 3, body: 'Есть нейтральные впечатления.' },
];

describe('ReviewAspectList', () => {
  it('renders aspects in fixed order with independent rating and body', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(ReviewAspectList, {
      props: { aspects },
    });

    expect(html.indexOf('Место и среда')).toBeLessThan(
      html.indexOf('Застройщик'),
    );
    expect(html.indexOf('Застройщик')).toBeLessThan(
      html.indexOf('Обслуживание'),
    );
    expect(html).toContain('5 из 5');
    expect(html).toContain('Есть нейтральные впечатления.');
    expect(html).toContain('Отвечают не\u00A0всегда быстро.');
  });
});
