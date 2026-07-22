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

describe('BaseLayout markdown discovery', () => {
  it('advertises the markdown companion in HTML', async () => {
    const html = await renderLayout('/815/compare/');

    expect(html).toContain(
      '<link rel="alternate" type="text/markdown" href="https://kpshelkovo.online/815/compare/index.md">',
    );
  });

  it('does not advertise a nonexistent companion for an error page', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(BaseLayout, {
      request: new Request('https://example.com/404.html'),
      props: { robots: 'noindex, nofollow' },
    });

    expect(html).not.toContain('type="text/markdown"');
  });
});
