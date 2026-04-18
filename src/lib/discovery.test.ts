import { describe, expect, it } from 'vitest';
import {
  CATALOG,
  DOCS,
  FEED,
  OPENAPI,
  SCHEMA,
  catalog,
  links,
  schema,
} from './discovery';

const root = 'https://example.com';

describe('schema', () => {
  it('describes the actual explorer payload without detail-only fields', () => {
    const body = schema(root);
    const props = body.properties as Record<string, unknown>;
    const defs = body.$defs as Record<string, Record<string, unknown>>;
    const settlement = defs.settlement.properties as Record<string, unknown>;

    expect(body.$id).toBe(`${root}${SCHEMA}`);
    expect(Object.keys(props)).toEqual(['settlements', 'stats', 'comparisons']);
    expect(settlement).toHaveProperty('slug');
    expect(settlement).toHaveProperty('location');
    expect(settlement).toHaveProperty('tariff');
    expect(settlement).not.toHaveProperty('website');
    expect(settlement).not.toHaveProperty('telegram');
    expect(settlement).not.toHaveProperty('sources');
  });
});

describe('catalog', () => {
  it('links the feed, docs, schema and openapi from the site root', () => {
    const body = catalog(root);
    const [item] = body.linkset as Array<Record<string, unknown>>;
    const list = item.item as Array<Record<string, unknown>>;
    const docs = item['service-doc'] as Array<Record<string, unknown>>;
    const desc = item['service-desc'] as Array<Record<string, unknown>>;

    expect(item.anchor).toBe(`${root}/`);
    expect(list[0]?.href).toBe(`${root}${FEED}`);
    expect(docs[0]?.href).toBe(`${root}${DOCS}`);
    expect(desc.map((row) => row.href)).toEqual([
      `${root}${SCHEMA}`,
      `${root}${OPENAPI}`,
    ]);
  });
});

describe('links', () => {
  it('emits discovery link headers for the explorer feed', () => {
    const body = links(root);

    expect(body).toContain(`${root}${DOCS}`);
    expect(body).toContain(`${root}${SCHEMA}`);
    expect(body).toContain(`${root}${OPENAPI}`);
    expect(body).toContain(`${root}${CATALOG}`);
    expect(body).toContain('rel="api-catalog"');
  });
});
