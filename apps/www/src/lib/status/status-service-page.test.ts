/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';

// @ts-expect-error Astro page modules are resolved by Astro/Vitest at test time.
import StatusServicePage from '@/pages/status/[service]/index.astro';

describe('/status/[service]/', () => {
  it('renders the service timeline without a DTO mismatch', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(StatusServicePage, {
      params: { service: 'electricity' },
      request: new Request('https://example.com/status/electricity/'),
    });

    expect(html).toContain('data-status-timeline');
  });
});
