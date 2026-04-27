import { describe, expect, it } from 'vitest';

import { telegram, withBase } from './index';

describe('withBase package', () => {
  it('passes through external and special URLs', () => {
    expect(withBase('/base/', 'https://example.com')).toBe(
      'https://example.com',
    );
    expect(withBase('/base/', '#map')).toBe('#map');
    expect(withBase('/base/', 'mailto:test@example.com')).toBe(
      'mailto:test@example.com',
    );
    expect(withBase('/base/', 'tel:+79990000000')).toBe('tel:+79990000000');
  });

  it('prepends normalized base to relative paths', () => {
    expect(withBase('/base/', 'settlements/lesnoe/')).toBe(
      '/base/settlements/lesnoe/',
    );
  });

  it('prepends normalized base to absolute internal paths', () => {
    expect(withBase('/base/', '/settlements/usadby/')).toBe(
      '/base/settlements/usadby/',
    );
  });

  it('works without base', () => {
    expect(withBase(undefined, 'settlements/lesnoe/')).toBe(
      '/settlements/lesnoe/',
    );
  });
});

describe('telegram package', () => {
  it('builds URL from plain channel name', () => {
    expect(telegram('shelkovoecoclub')).toBe('https://t.me/shelkovoecoclub');
  });

  it('strips @ prefix and spaces', () => {
    expect(telegram('  @shelkovoecoclub  ')).toBe(
      'https://t.me/shelkovoecoclub',
    );
  });
});
