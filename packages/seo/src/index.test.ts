import { describe, expect, it } from 'vitest';

import { collectKeywords, imageMimeType, serializeSchema } from './index';

describe('seo package', () => {
  it('collects unique non-empty keywords while preserving order', () => {
    expect(
      collectKeywords(' alpha ', ['beta', 'alpha', ''], undefined, 'gamma'),
    ).toMatchInlineSnapshot(`
      [
        "alpha",
        "beta",
        "gamma",
      ]
    `);
  });

  it('detects known image mime types from URLs', () => {
    expect([
      imageMimeType('/cover.svg?cache=1'),
      imageMimeType('/cover.jpeg'),
      imageMimeType('/cover.webp'),
      imageMimeType('/cover.txt'),
    ]).toMatchInlineSnapshot(`
      [
        "image/svg+xml",
        "image/jpeg",
        "image/webp",
        undefined,
      ]
    `);
  });

  it('serializes schema docs and escapes html-breaking less-than signs', () => {
    expect(serializeSchema([{ name: '<script>' }, { name: 'safe' }]))
      .toMatchInlineSnapshot(`
      [
        "{\"name\":\"\\u003cscript>\"}",
        "{\"name\":\"safe\"}",
      ]
    `);
  });
});
