import { withBase } from './url';

export const DOCS = '/for-agents/';
export const FEED = '/data/explorer.json';
export const SCHEMA = '/schemas/explorer.schema.json';
export const OPENAPI = '/openapi/explorer.openapi.json';
export const CATALOG = '/.well-known/api-catalog';
export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
export const OAS = 'application/vnd.oai.openapi+json';

function abs(root: string, path: string): string {
  return new URL(withBase(path), root).toString();
}

function star(value: string) {
  return [{ value, language: 'ru' }];
}

function server(root: string): string {
  return new URL(withBase('/'), root).toString().replace(/\/$/, '');
}

export function schema(root: string): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: abs(root, SCHEMA),
    title: 'ExplorerPayload',
    description:
      'Read-only feed для списка, карты и массового сравнения поселков.',
    type: 'object',
    additionalProperties: false,
    required: ['settlements', 'stats', 'comparisons'],
    properties: {
      settlements: {
        type: 'array',
        items: {
          $ref: '#/$defs/settlement',
        },
      },
      stats: {
        $ref: '#/$defs/stats',
      },
      comparisons: {
        type: 'object',
        propertyNames: {
          pattern: '^[a-z0-9-]+$',
        },
        additionalProperties: {
          $ref: '#/$defs/comparison',
        },
      },
    },
    $defs: {
      company: {
        oneOf: [
          {
            type: 'string',
            minLength: 1,
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['title'],
            properties: {
              title: {
                type: 'string',
                minLength: 1,
              },
            },
          },
        ],
      },
      comparison: {
        type: 'object',
        additionalProperties: false,
        required: ['tariffDelta', 'tariffDeltaPercent', 'isCheaper'],
        properties: {
          tariffDelta: {
            type: 'number',
          },
          tariffDeltaPercent: {
            type: 'number',
          },
          isCheaper: {
            type: 'boolean',
          },
        },
      },
      location: {
        type: 'object',
        additionalProperties: false,
        required: ['lat', 'lng', 'district'],
        properties: {
          lat: {
            type: 'number',
            minimum: -90,
            maximum: 90,
          },
          lng: {
            type: 'number',
            minimum: -180,
            maximum: 180,
          },
          district: {
            type: 'string',
            minLength: 1,
          },
        },
      },
      settlement: {
        type: 'object',
        additionalProperties: false,
        required: [
          'name',
          'short_name',
          'slug',
          'rating',
          'is_baseline',
          'location',
          'tariff',
        ],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
          },
          short_name: {
            type: 'string',
            minLength: 1,
          },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
          },
          rating: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
          rabstvo: {
            const: true,
          },
          management_company: {
            $ref: '#/$defs/company',
          },
          is_baseline: {
            type: 'boolean',
          },
          location: {
            $ref: '#/$defs/location',
          },
          tariff: {
            $ref: '#/$defs/tariff',
          },
        },
      },
      stats: {
        type: 'object',
        additionalProperties: false,
        required: [
          'shelkovoTariff',
          'medianTariff',
          'meanTariff',
          'minTariff',
          'maxTariff',
          'shelkovoRank',
          'totalSettlements',
          'cheaperCount',
          'moreExpensiveCount',
          'shelkovoVsMedianPercent',
          'shelkovoVsMeanPercent',
        ],
        properties: {
          shelkovoTariff: {
            type: 'number',
            minimum: 0,
          },
          medianTariff: {
            type: 'number',
            minimum: 0,
          },
          meanTariff: {
            type: 'number',
            minimum: 0,
          },
          minTariff: {
            type: 'number',
            minimum: 0,
          },
          maxTariff: {
            type: 'number',
            minimum: 0,
          },
          shelkovoRank: {
            type: 'integer',
            minimum: 1,
          },
          totalSettlements: {
            type: 'integer',
            minimum: 1,
          },
          cheaperCount: {
            type: 'integer',
            minimum: 0,
          },
          moreExpensiveCount: {
            type: 'integer',
            minimum: 0,
          },
          shelkovoVsMedianPercent: {
            type: 'number',
          },
          shelkovoVsMeanPercent: {
            type: 'number',
          },
        },
      },
      tariff: {
        type: 'object',
        additionalProperties: false,
        required: ['normalized_per_sotka_month', 'normalized_is_estimate'],
        properties: {
          normalized_per_sotka_month: {
            type: 'number',
            minimum: 0,
          },
          normalized_is_estimate: {
            type: 'boolean',
          },
        },
      },
    },
  };
}

export function openapi(root: string): Record<string, unknown> {
  const body = Object.fromEntries(
    Object.entries(schema(root)).filter(
      ([key]) => key !== '$schema' && key !== '$id',
    ),
  );

  return {
    openapi: '3.1.0',
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    info: {
      title: 'Сравни.Шелково Explorer Feed',
      version: '1.0.0',
      description:
        'Read-only OpenAPI wrapper для data/explorer.json, пригодный для автоматического discovery.',
    },
    servers: [
      {
        url: server(root),
      },
    ],
    externalDocs: {
      description: 'Краткая документация для агентов',
      url: abs(root, DOCS),
    },
    paths: {
      [FEED]: {
        get: {
          operationId: 'getExplorer',
          summary: 'Read explorer feed',
          description:
            'Возвращает краткий feed поселков для списка, карты и массового сравнения.',
          responses: {
            200: {
              description: 'Explorer feed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExplorerPayload',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ExplorerPayload: body,
      },
    },
  };
}

export function catalog(root: string): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: abs(root, '/'),
        item: [
          {
            href: abs(root, FEED),
            type: 'application/json',
            'title*': star('Машиночитаемый feed поселков'),
          },
        ],
        'service-doc': [
          {
            href: abs(root, DOCS),
            type: 'text/html',
            'title*': star('Краткая документация для агентов'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, SCHEMA),
            type: 'application/schema+json',
            'title*': star('JSON Schema для explorer feed'),
          },
          {
            href: abs(root, OPENAPI),
            type: OAS,
            'title*': star('OpenAPI для explorer feed'),
          },
        ],
      },
    ],
  };
}

export function links(root: string): string {
  return [
    `<${abs(root, DOCS)}>; rel="service-doc"; type="text/html"`,
    `<${abs(root, SCHEMA)}>; rel="service-desc"; type="application/schema+json"`,
    `<${abs(root, OPENAPI)}>; rel="service-desc"; type="${OAS}"`,
    `<${abs(root, CATALOG)}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`,
  ].join(', ');
}

export function self(root: string): string {
  return `<${abs(root, CATALOG)}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
}
