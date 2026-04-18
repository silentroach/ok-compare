import { describe, expect, it } from 'vitest';
import {
  CATALOG,
  DOCS,
  EXPLORER,
  FEED,
  OPENAPI,
  SCHEMA,
  catalog,
  links,
  schema,
} from './discovery';

const root = 'https://example.com';

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
    expect(settlement).toHaveProperty('website');
    expect(settlement).toHaveProperty('telegram');
    expect(settlement).toHaveProperty('infrastructure');
    expect(settlement).toHaveProperty('distance');
    expect(settlement).toHaveProperty('rating');
  });
});

describe('catalog', () => {
  it('links both feeds, docs, schema and openapi from the site root', () => {
    const body = catalog(root);
    const [item] = body.linkset as Array<Record<string, unknown>>;
    const list = item.item as Array<Record<string, unknown>>;
    const docs = item['service-doc'] as Array<Record<string, unknown>>;
    const desc = item['service-desc'] as Array<Record<string, unknown>>;

    expect(item.anchor).toBe(`${root}/`);
    expect(list.map((row) => row.href)).toEqual([
      `${root}${FEED}`,
      `${root}${EXPLORER}`,
    ]);
    expect(docs[0]?.href).toBe(`${root}${DOCS}`);
    expect(desc.map((row) => row.href)).toEqual([
      `${root}${SCHEMA}`,
      `${root}${OPENAPI}`,
    ]);
  });
});

describe('links', () => {
  it('emits discovery link headers for the full settlements feed', () => {
    const body = links(root);

    expect(body).toContain(`${root}${DOCS}`);
    expect(body).toContain(`${root}${SCHEMA}`);
    expect(body).toContain(`${root}${OPENAPI}`);
    expect(body).toContain(`${root}${CATALOG}`);
    expect(body).toContain('rel="api-catalog"');
  });
});
