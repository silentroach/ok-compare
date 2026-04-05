import { describe, expect, it } from 'vitest';
import { withBase } from './url';

describe('withBase', () => {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

  it('passes through external and special URLs', () => {
    expect(withBase('https://example.com')).toBe('https://example.com');
    expect(withBase('#map')).toBe('#map');
    expect(withBase('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(withBase('tel:+79990000000')).toBe('tel:+79990000000');
  });

  it('prepends base to relative paths', () => {
    expect(withBase('settlements/lesnoe/')).toBe(`${base}/settlements/lesnoe/`);
  });

  it('prepends base to absolute internal paths', () => {
    expect(withBase('/settlements/usadby/')).toBe(
      `${base}/settlements/usadby/`,
    );
  });
});
