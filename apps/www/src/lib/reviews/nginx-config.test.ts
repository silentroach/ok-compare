import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const config = readFileSync(
  new URL('../../../../../ops/nginx/kpshelkovo-online.conf', import.meta.url),
  'utf8',
);

describe('reviews nginx negotiation', () => {
  it('negotiates reviews index and rules HTML routes to Markdown', () => {
    expect(config).toContain('location = /reviews/');
    expect(config).toContain('set $md /reviews/index.md;');
    expect(config).toContain('location = /reviews/rules/');
    expect(config).toContain('set $md /reviews/rules/index.md;');
    expect(
      config.match(
        /location = \/reviews\/[\s\S]*?add_header Vary Accept always;/u,
      )?.[0],
    ).toBeTruthy();
    expect(
      config.match(
        /location = \/reviews\/rules\/[\s\S]*?add_header Vary Accept always;/u,
      )?.[0],
    ).toBeTruthy();
  });

  it('negotiates review detail routes and serves direct Markdown files', () => {
    expect(config).toMatch(
      /location ~ "\^\/reviews\/\[0-9\]\{4\}-\[0-9\]\{2\}-\[0-9\]\{2\}-\[\^\/\]\+\/\$"/u,
    );
    expect(config).toContain('set $md "${uri}index.md";');
    expect(config).toContain(
      '(?:news|status|meetings|people|reviews|815/(?:compare|regulation))',
    );
  });
});
