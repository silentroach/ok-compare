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

interface BreadcrumbListItem {
  readonly position: number;
  readonly item: string;
  readonly name: string;
}

const href = <T extends { readonly label: string }>(
  item: T,
): string | undefined => ('href' in item ? String(item.href) : undefined);

const schemaItems = (schema: {
  readonly itemListElement?: unknown;
}): readonly BreadcrumbListItem[] => {
  if (!Array.isArray(schema.itemListElement)) {
    throw new Error('Breadcrumb schema must include itemListElement');
  }

  return schema.itemListElement as readonly BreadcrumbListItem[];
};

describe('compare breadcrumbs', () => {
  it('builds visible compare breadcrumbs for index and rating pages', async () => {
    const { compareBreadcrumbs } = await loadBreadcrumbs();

    expect(compareBreadcrumbs().map(href)).toMatchInlineSnapshot(`
        [
          "/",
          "/815/compare/",
        ]
      `);
  });

  it('adds the settlement name only on settlement pages', async () => {
    const { settlementBreadcrumbs } = await loadBreadcrumbs();

    const breadcrumbs = settlementBreadcrumbs('КП Шелково');

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs.map(href)).toMatchInlineSnapshot(`
      [
        "/",
        "/815/compare/",
        undefined,
      ]
    `);
    expect(breadcrumbs.at(-1)?.label).toBe('КП Шелково');
  });

  it('builds schema breadcrumbs with canonical URLs', async () => {
    const { compareBreadcrumbSchema } = await loadBreadcrumbs();

    const schema = compareBreadcrumbSchema([
      {
        name: 'КП Шелково',
        item: 'https://kpshelkovo.online/815/compare/settlements/shelkovo/',
      },
    ]);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schemaItems(schema);

    expect(items.map((item) => item.position)).toMatchInlineSnapshot(`
        [
          1,
          2,
          3,
        ]
      `);
    expect(items.map((item) => item.item)).toMatchInlineSnapshot(`
        [
          "https://kpshelkovo.online/",
          "https://kpshelkovo.online/815/compare/",
          "https://kpshelkovo.online/815/compare/settlements/shelkovo/",
        ]
      `);
    expect(items.at(-1)?.name).toBe('КП Шелково');
  });
});
