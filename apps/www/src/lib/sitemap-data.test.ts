import { describe, expect, it } from 'vitest';

import { kbPageSitemapInput } from './sitemap-data';

describe('kbPageSitemapInput', () => {
  it('turns inline noindex flags into sitemap exclusion', () => {
    expect(
      kbPageSitemapInput(
        'court/01/documents',
        'title: Документы\nflags: [noindex]',
      ),
    ).toEqual({
      url: '/kb/court/01/documents/',
      excludeFromSitemap: true,
    });
  });

  it('turns block noindex flags into sitemap exclusion', () => {
    expect(
      kbPageSitemapInput(
        'court/01/documents',
        'title: Документы\nflags:\n  - noindex',
      ),
    ).toEqual({
      url: '/kb/court/01/documents/',
      excludeFromSitemap: true,
    });
  });

  it('reads noindex flags from regular YAML instead of regex-shaped text', () => {
    expect(
      kbPageSitemapInput(
        'court/01/documents',
        'title: Документы\nflags: # sitemap metadata\n  - noindex',
      ),
    ).toEqual({
      url: '/kb/court/01/documents/',
      excludeFromSitemap: true,
    });
  });

  it('keeps regular kb pages in the sitemap', () => {
    expect(kbPageSitemapInput('', 'title: База знаний')).toEqual({
      url: '/kb/',
      excludeFromSitemap: false,
    });
  });
});
