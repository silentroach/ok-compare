/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import BaseLayout from './BaseLayout.astro';

const renderLayout = async (pathname: string) => {
  const container = await createAstroContainer();

  return container.renderToString(BaseLayout, {
    request: new Request(`https://example.com${pathname}`),
  });
};

describe('BaseLayout site header', () => {
  it('shows the common site header on tariff pages', async () => {
    const html = await renderLayout('/815/compare/');

    expect(html).toContain('<header class="site-header');
  });

  it('keeps the site header out of the home hero', async () => {
    const html = await renderLayout('/');

    expect(html).not.toContain('<header class="site-header');
  });
});
