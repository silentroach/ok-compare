import { describe, expect, it, vi } from 'vitest';

vi.mock('./site', () => ({
  canon: (path: string) =>
    new URL(
      path.replace(/^\//, ''),
      'https://kpshelkovo.online/815/compare/',
    ).toString(),
}));

vi.mock('./url', () => ({
  withBase: (path: string) =>
    `/815/compare${path.startsWith('/') ? path : `/${path}`}`,
}));

const loadBreadcrumbs = () => import('./breadcrumbs');

describe('compare breadcrumbs', () => {
  it('builds visible compare breadcrumbs for index and rating pages', async () => {
    const { compareBreadcrumbs } = await loadBreadcrumbs();

    expect(compareBreadcrumbs()).toMatchInlineSnapshot(`
      [
        {
          "href": "/",
          "label": "Главная",
        },
        {
          "href": "/815/compare/",
          "label": "Сравнение тарифов",
        },
      ]
    `);
  });

  it('adds the settlement name only on settlement pages', async () => {
    const { settlementBreadcrumbs } = await loadBreadcrumbs();

    expect(settlementBreadcrumbs('КП Шелково')).toMatchInlineSnapshot(`
      [
        {
          "href": "/",
          "label": "Главная",
        },
        {
          "href": "/815/compare/",
          "label": "Сравнение тарифов",
        },
        {
          "label": "КП Шелково",
        },
      ]
    `);
  });

  it('builds schema breadcrumbs with canonical URLs', async () => {
    const { compareBreadcrumbSchema } = await loadBreadcrumbs();

    expect(
      compareBreadcrumbSchema([
        {
          name: 'КП Шелково',
          item: 'https://kpshelkovo.online/815/compare/settlements/shelkovo/',
        },
      ]),
    ).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "https://kpshelkovo.online/",
            "name": "Главная",
            "position": 1,
          },
          {
            "@type": "ListItem",
            "item": "https://kpshelkovo.online/815/compare/",
            "name": "Сравнение тарифов",
            "position": 2,
          },
          {
            "@type": "ListItem",
            "item": "https://kpshelkovo.online/815/compare/settlements/shelkovo/",
            "name": "КП Шелково",
            "position": 3,
          },
        ],
      }
    `);
  });
});
