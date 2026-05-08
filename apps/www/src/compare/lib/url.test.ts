import { describe, expect, it } from 'vitest';
import { telegram, withBase } from './url';

describe('withBase', () => {
  it('passes through external and special URLs', () => {
    expect(withBase('https://example.com')).toBe('https://example.com');
    expect(withBase('#map')).toBe('#map');
    expect(withBase('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(withBase('tel:+79990000000')).toBe('tel:+79990000000');
  });

  it('prepends base to relative paths', () => {
    expect(withBase('settlements/lesnoe/')).toBe(
      '/815/compare/settlements/lesnoe/',
    );
  });

  it('prepends base to absolute internal paths', () => {
    expect(withBase('/settlements/usadby/')).toBe(
      '/815/compare/settlements/usadby/',
    );
  });
});

describe('telegram', () => {
  it('builds URL from plain channel name', () => {
    expect(telegram('shelkovoecoclub')).toBe('https://t.me/shelkovoecoclub');
  });

  it('strips @ prefix and spaces', () => {
    expect(telegram('  @shelkovoecoclub  ')).toBe(
      'https://t.me/shelkovoecoclub',
    );
  });
});
