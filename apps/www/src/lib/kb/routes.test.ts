import { beforeAll, describe, expect, it } from 'vitest';

let routes: typeof import('./routes');

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  routes = await import('./routes');
});

describe('kb route helpers', () => {
  it('builds root and nested detail paths', () => {
    expect(routes.kbPath()).toBe('/kb/');
    expect(routes.kbDetailPath('services/internet')).toBe(
      '/kb/services/internet/',
    );
  });

  it('builds canonical URLs through the site canonical helper', () => {
    expect(routes.kbCanonical()).toBe('https://example.com/kb/');
    expect(routes.kbDetailCanonical('services/internet')).toBe(
      'https://example.com/kb/services/internet/',
    );
  });

  it('exposes a rest-style route pattern for nested pages', () => {
    expect(routes.kbDetailPattern()).toBe('/kb/:slug.../');
  });
});
