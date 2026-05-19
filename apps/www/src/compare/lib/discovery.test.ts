import { beforeAll, describe, expect, it } from 'vitest';

import type { comparePublicSurfaceSlice as comparePublicSurfaceSliceType } from '@/compare/lib/public-surface';
import type { PublicSurfaceSlice } from '@/lib/public-surface';
import type { expectSectionCatalogMatchesRegistry as expectSectionCatalogMatchesRegistryType } from '@/lib/public-surface/catalog-contract.test-helper';

import {
  CATALOG,
  EXPLORER,
  FEED,
  OPENAPI,
  SCHEMA,
  catalog,
  links,
  schema,
} from './discovery';

const root = 'https://example.com';
let comparePublicSurfaceSlice: typeof comparePublicSurfaceSliceType &
  PublicSurfaceSlice;
let expectSectionCatalogMatchesRegistry: typeof expectSectionCatalogMatchesRegistryType;

beforeAll(async () => {
  ({ comparePublicSurfaceSlice } =
    await import('@/compare/lib/public-surface'));
  ({ expectSectionCatalogMatchesRegistry } =
    await import('@/lib/public-surface/catalog-contract.test-helper'));
});

describe('schema', () => {
  it('describes the actual full settlements payload with distance', () => {
    const body = schema(root);
    const props = body.properties as Record<string, unknown>;
    const defs = body.$defs as Record<string, Record<string, unknown>>;
    const settlement = defs.settlement.properties as Record<string, unknown>;

    expect(body.$id).toBe(`${root}${SCHEMA}`);
    expect(Object.keys(props)).toEqual(['settlements', 'stats', 'comparisons']);
    expect(settlement).toHaveProperty('slug');
    expect(settlement).toHaveProperty('location');
    expect(settlement).toHaveProperty('tariff');
    expect(settlement).toHaveProperty('lots');
    expect(settlement).toHaveProperty('website');
    expect(settlement).toHaveProperty('telegram');
    expect(settlement).toHaveProperty('infrastructure');
    expect(settlement).toHaveProperty('distance');
    expect(settlement).toHaveProperty('rating');
  });
});

describe('catalog', () => {
  it('keeps the section API catalog aligned with registry catalog surfaces', () => {
    expectSectionCatalogMatchesRegistry({
      catalog,
      catalogRoot: `${root}/815/compare`,
      siteRoot: root,
      slice: comparePublicSurfaceSlice,
    });
  });

  it('links markdown, feeds, agent docs, schema and openapi from the site root', () => {
    const body = catalog(root);
    const [item] = body.linkset as Array<Record<string, unknown>>;
    const list = item.item as Array<Record<string, unknown>>;
    const desc = item['service-desc'] as Array<Record<string, unknown>>;

    expect(item.anchor).toBe(`${root}/`);
    expect(list.map((row) => row.href)).toEqual([
      `${root}/index.md`,
      `${root}/rating/index.md`,
      `${root}${FEED}`,
      `${root}${EXPLORER}`,
      `${root}/llms.txt`,
      `${root}/llms-full.txt`,
      `${root}/.well-known/agent-skills/index.json`,
    ]);
    expect(desc.map((row) => row.href)).toEqual([
      `${root}${SCHEMA}`,
      `${root}${OPENAPI}`,
    ]);
  });
});

describe('links', () => {
  it('emits discovery link headers for the full settlements feed', () => {
    const body = links(root);

    expect(body).toContain(`${root}${SCHEMA}`);
    expect(body).toContain(`${root}${OPENAPI}`);
    expect(body).toContain(`${root}${CATALOG}`);
    expect(body).toContain('rel="api-catalog"');
  });
});
