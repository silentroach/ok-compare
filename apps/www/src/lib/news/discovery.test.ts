import { beforeAll, describe, expect, it } from 'vitest';

import type { NewsArticle, NewsDataset } from './schema';
import type {
  newsPublicSurfaceSlice as newsPublicSurfaceSliceType,
  PublicSurfaceSlice,
} from '@/lib/public-surface';
import type { expectSectionCatalogMatchesRegistry as expectSectionCatalogMatchesRegistryType } from '@/lib/public-surface/catalog-contract.test-helper';

let buildNewsPayload: typeof import('./discovery').buildNewsPayload;
let catalog: typeof import('./discovery').catalog;
let expectSectionCatalogMatchesRegistry: typeof expectSectionCatalogMatchesRegistryType;
let newsPublicSurfaceSlice: typeof newsPublicSurfaceSliceType &
  PublicSurfaceSlice;
let openapi: typeof import('./discovery').openapi;
let schema: typeof import('./discovery').schema;

const articleWithEvent = (): NewsArticle => ({
  id: '2026/05/event',
  title: 'Встреча по регламенту',
  author: {
    id: 'editor',
    name: 'Редакция',
    kind: 'editorial',
  },
  year: 2026,
  month: 5,
  day: 1,
  entry: 'event',
  url: '/news/2026/05/event/',
  markdown_url: '/news/2026/05/event/index.md',
  canonical: 'https://example.com/news/2026/05/event/',
  published_at: new Date('2026-05-01T09:00:00+03:00'),
  published_iso: '2026-05-01T09:00:00.000+03:00',
  time: '09:00',
  applies_to_all_areas: true,
  areas: ['river', 'forest', 'park', 'village'],
  tags: [],
  pinned: false,
  photos: [],
  attachments: [],
  events: [
    {
      slug: 'event',
      title: 'Встреча по регламенту',
      description: 'Описание календарного события.',
      starts_at: new Date('2026-05-31T19:00:00+03:00'),
      starts_iso: '2026-05-31T19:00:00.000+03:00',
      starts_time: '19:00',
      ends_at: new Date('2026-05-31T21:00:00+03:00'),
      ends_iso: '2026-05-31T21:00:00.000+03:00',
      ends_time: '21:00',
      ics_url: '/news/2026/05/event/event.ics',
      location: 'КП Шелково, эко-клуб',
      coordinates: {
        lat: 55,
        lng: 38,
      },
    },
  ],
  summary: 'Будет обсуждение регламента.',
  body: 'Текст новости.',
  mentions: [],
});

const dataset = (articles: readonly NewsArticle[]): NewsDataset => ({
  articles,
  home: {
    pinned: [],
    latest: [],
  },
  archives: {
    years: [],
    by_year: new Map(),
    by_month: new Map(),
  },
  tags: [],
  by_id: new Map(articles.map((item) => [item.id, item])),
  by_tag: new Map(),
});

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildNewsPayload, catalog, openapi, schema } =
    await import('./discovery'));
  ({ expectSectionCatalogMatchesRegistry } =
    await import('@/lib/public-surface/catalog-contract.test-helper'));
  ({ newsPublicSurfaceSlice } = await import('@/lib/public-surface'));
});

describe('news discovery payload', () => {
  it('keeps the section API catalog aligned with registry catalog surfaces', () => {
    expectSectionCatalogMatchesRegistry({
      catalog,
      siteRoot: 'https://example.com',
      slice: newsPublicSurfaceSlice,
    });
  });

  it('publishes feed-level metadata for consumers', () => {
    const first = articleWithEvent();
    const second = {
      ...articleWithEvent(),
      id: '2026/05/latest',
      published_at: new Date('2026-05-02T09:00:00+03:00'),
      published_iso: '2026-05-02T09:00:00.000+03:00',
    };

    const payload = buildNewsPayload(dataset([first, second]), {
      generated_at: new Date('2026-05-04T09:00:00.000Z'),
    });

    expect(payload).toMatchObject({
      schema_version: '1.0.0',
      generated_at: '2026-05-04T09:00:00.000Z',
      updated_at: '2026-05-02T09:00:00.000+03:00',
      total_count: 2,
    });
  });

  it('serializes optional article events with absolute ICS URLs', () => {
    const payload = buildNewsPayload(dataset([articleWithEvent()]));

    expect(payload.articles[0]?.events).toEqual([
      {
        slug: 'event',
        title: 'Встреча по регламенту',
        description: 'Описание календарного события.',
        starts_at: '2026-05-31T19:00:00.000+03:00',
        ends_at: '2026-05-31T21:00:00.000+03:00',
        location: 'КП Шелково, эко-клуб',
        coordinates: {
          lat: 55,
          lng: 38,
        },
        map_url: 'https://yandex.ru/maps/?pt=38,55&z=16&l=map',
        ics_url: 'https://example.com/news/2026/05/event/event.ics',
      },
    ]);
  });

  it('keeps non-event articles compatible', () => {
    const article = { ...articleWithEvent(), events: [] };
    const payload = buildNewsPayload(dataset([article]));

    expect(payload.articles[0]).not.toHaveProperty('events');
  });

  it('keeps schema, openapi, and catalog aligned around article-local events', () => {
    const root = 'https://example.com';
    const jsonSchema = schema(root) as {
      readonly required?: readonly string[];
      readonly properties?: Record<string, unknown>;
      readonly $defs?: Record<
        string,
        {
          readonly required?: readonly string[];
          readonly properties?: Record<string, unknown>;
        }
      >;
    };
    const defs = jsonSchema.$defs ?? {};
    const api = openapi(root) as {
      readonly paths?: Record<
        string,
        {
          readonly get?: {
            readonly responses?: {
              readonly 200?: {
                readonly content?: {
                  readonly 'application/json'?: {
                    readonly schema?: { readonly $ref?: string };
                  };
                };
              };
            };
          };
        }
      >;
      readonly components?: {
        readonly schemas?: Record<
          string,
          {
            readonly required?: readonly string[];
            readonly properties?: Record<string, unknown>;
            readonly $defs?: Record<
              string,
              {
                readonly required?: readonly string[];
                readonly properties?: Record<string, unknown>;
              }
            >;
          }
        >;
      };
    };
    const apiCatalog = catalog(root) as { readonly linkset: unknown };
    const openapiDefs =
      api.components?.schemas?.NewsArticlesPayload?.$defs ?? {};

    expect(jsonSchema.required).toEqual([
      'schema_version',
      'generated_at',
      'updated_at',
      'total_count',
      'articles',
      'archives',
      'tags',
    ]);
    expect(jsonSchema.properties?.schema_version).toMatchObject({
      const: '1.0.0',
    });
    expect(jsonSchema.properties?.generated_at).toMatchObject({
      format: 'date-time',
    });
    expect(jsonSchema.properties?.updated_at).toMatchObject({
      format: 'date-time',
    });
    expect(jsonSchema.properties?.total_count).toMatchObject({
      type: 'integer',
      minimum: 0,
    });
    expect(api.components?.schemas?.NewsArticlesPayload?.required).toEqual(
      jsonSchema.required,
    );
    expect(
      api.components?.schemas?.NewsArticlesPayload?.properties?.generated_at,
    ).toMatchObject({ format: 'date-time' });
    expect(defs.event?.required).toEqual([
      'slug',
      'title',
      'starts_at',
      'ics_url',
    ]);
    expect(defs.article?.required).not.toContain('events');
    expect(defs.article?.properties).not.toHaveProperty('updated_at');
    expect(defs.article?.required).not.toContain('addenda');
    expect(defs.article?.properties).not.toHaveProperty('addenda');
    expect(defs.event?.properties?.starts_at).toMatchObject({
      format: 'date-time',
    });
    expect(defs.event?.properties?.ics_url).toMatchObject({ format: 'uri' });
    expect(defs.coordinates?.properties?.lat).toMatchObject({
      minimum: -90,
      maximum: 90,
    });
    expect(defs.coordinates?.properties?.lng).toMatchObject({
      minimum: -180,
      maximum: 180,
    });
    expect(openapiDefs.event?.required).toEqual(defs.event?.required);
    expect(openapiDefs.article?.properties?.events).toMatchObject({
      type: 'array',
      items: {
        $ref: '#/components/schemas/NewsArticlesPayload/$defs/event',
      },
    });
    expect(
      api.paths?.['/news/data/articles.json']?.get?.responses?.[200]?.content?.[
        'application/json'
      ]?.schema?.$ref,
    ).toBe('#/components/schemas/NewsArticlesPayload');
    expect(JSON.stringify(apiCatalog)).not.toContain('/event.ics');
  });
});
