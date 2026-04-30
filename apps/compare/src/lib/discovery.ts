export const FEED = '/data/settlements.json';
export const EXPLORER = '/data/explorer.json';
export const SCHEMA = '/schemas/settlements.schema.json';
export const OPENAPI = '/openapi/settlements.openapi.json';
export const CATALOG = '/.well-known/api-catalog';
export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
export const OAS = 'application/vnd.oai.openapi+json';

function abs(root: string, path: string): string {
  return new URL(path.replace(/^\//, ''), `${root}/`).toString();
}

function star(value: string) {
  return [{ value, language: 'ru' }];
}

function server(root: string): string {
  return root.replace(/\/$/, '');
}

function text(): Record<string, unknown> {
  return {
    type: 'string',
    minLength: 1,
  };
}

function uri(): Record<string, unknown> {
  return {
    type: 'string',
    format: 'uri',
  };
}

function flag(): Record<string, unknown> {
  return {
    type: 'boolean',
  };
}

function state(): Record<string, unknown> {
  return {
    $ref: '#/$defs/availability',
  };
}

function obj(
  properties: Record<string, unknown>,
  required: string[],
): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    required,
    properties,
  };
}

export function schema(root: string): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: abs(root, SCHEMA),
    title: 'SettlementsPayload',
    description:
      'Read-only полный feed поселков с detail-полями, вычисленными расстояниями, рейтингом и агрегатами.',
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
      availability: {
        enum: ['yes', 'no', 'partial'],
      },
      road: {
        enum: ['asphalt', 'partial_asphalt', 'gravel', 'dirt'],
      },
      drainage: {
        enum: ['closed', 'open', 'none'],
      },
      video: {
        enum: ['full', 'checkpoint_only', 'none'],
      },
      wire: {
        enum: ['full', 'partial', 'none'],
      },
      company: {
        oneOf: [
          {
            type: 'string',
            minLength: 1,
          },
          obj(
            {
              title: text(),
              url: uri(),
            },
            ['title', 'url'],
          ),
        ],
      },
      comparison: obj(
        {
          tariffDelta: {
            type: 'number',
          },
          tariffDeltaPercent: {
            type: 'number',
          },
          isCheaper: flag(),
        },
        ['tariffDelta', 'tariffDeltaPercent', 'isCheaper'],
      ),
      location: obj(
        {
          address_text: text(),
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
          map_url: uri(),
          district: text(),
        },
        ['address_text', 'lat', 'lng', 'district'],
      ),
      tariff_part: obj(
        {
          value: {
            type: 'number',
            minimum: 0,
          },
          unit: {
            enum: ['rub_per_sotka', 'rub_per_lot', 'rub_fixed'],
          },
          period: {
            enum: ['month', 'quarter', 'year'],
          },
          note: text(),
        },
        ['value', 'unit', 'period'],
      ),
      tariff: obj(
        {
          value: {
            type: 'number',
            minimum: 0,
          },
          unit: {
            enum: ['rub_per_sotka', 'rub_per_lot', 'rub_fixed'],
          },
          period: {
            enum: ['month', 'quarter', 'year'],
          },
          normalized_per_sotka_month: {
            type: 'number',
            minimum: 0,
          },
          normalized_is_estimate: flag(),
          note: text(),
          parts: {
            type: 'array',
            minItems: 1,
            items: {
              $ref: '#/$defs/tariff_part',
            },
          },
        },
        [
          'value',
          'unit',
          'period',
          'normalized_per_sotka_month',
          'normalized_is_estimate',
        ],
      ),
      lots: obj(
        {
          count: {
            type: 'integer',
            minimum: 1,
          },
          area_ha: {
            type: 'number',
            exclusiveMinimum: 0,
          },
          average_sotka: {
            type: 'number',
            exclusiveMinimum: 0,
          },
          average_note: text(),
        },
        [],
      ),
      infrastructure: obj(
        {
          roads: {
            $ref: '#/$defs/road',
          },
          sidewalks: state(),
          lighting: state(),
          gas: state(),
          water: state(),
          sewage: state(),
          drainage: {
            $ref: '#/$defs/drainage',
          },
          checkpoints: state(),
          security: state(),
          fencing: state(),
          video_surveillance: {
            $ref: '#/$defs/video',
          },
          underground_electricity: {
            $ref: '#/$defs/wire',
          },
          admin_building: state(),
          retail_or_services: state(),
        },
        [],
      ),
      common_spaces: obj(
        {
          playgrounds: state(),
          sports: state(),
          pool: state(),
          fitness_club: state(),
          restaurant: state(),
          spa_center: state(),
          walking_routes: state(),
          water_access: state(),
          beach_zones: state(),
          kids_club: state(),
          sports_camp: state(),
          primary_school: state(),
          club_infrastructure: state(),
          bbq_zones: state(),
        },
        [],
      ),
      service_model: obj(
        {
          garbage_collection: state(),
          snow_removal: state(),
          road_cleaning: state(),
          landscaping: state(),
          emergency_service: state(),
          dispatcher: state(),
        },
        [],
      ),
      distance: obj(
        {
          moscow_km: {
            type: 'number',
            minimum: 0,
          },
          mkad_km: {
            type: 'number',
            minimum: 0,
          },
          shelkovo_km: {
            type: 'number',
            minimum: 0,
          },
        },
        ['moscow_km', 'mkad_km', 'shelkovo_km'],
      ),
      settlement: obj(
        {
          name: text(),
          short_name: text(),
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
          },
          website: uri(),
          telegram: {
            type: 'string',
            pattern: '^[A-Za-z0-9_]{5,32}$',
          },
          management_company: {
            $ref: '#/$defs/company',
          },
          is_baseline: flag(),
          location: {
            $ref: '#/$defs/location',
          },
          tariff: {
            $ref: '#/$defs/tariff',
          },
          lots: {
            $ref: '#/$defs/lots',
          },
          water_in_tariff: flag(),
          rabstvo: flag(),
          infrastructure: {
            $ref: '#/$defs/infrastructure',
          },
          common_spaces: {
            $ref: '#/$defs/common_spaces',
          },
          service_model: {
            $ref: '#/$defs/service_model',
          },
          distance: {
            $ref: '#/$defs/distance',
          },
          rating: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
        },
        [
          'name',
          'short_name',
          'slug',
          'website',
          'is_baseline',
          'location',
          'tariff',
          'infrastructure',
          'common_spaces',
          'service_model',
          'distance',
          'rating',
        ],
      ),
      stats: obj(
        {
          shelkovoTariff: {
            type: 'number',
            minimum: 0,
          },
          medianTariff: {
            type: 'number',
            minimum: 0,
          },
          peerMedianTariff: {
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
          shelkovoVsPeerMedianPercent: {
            type: 'number',
          },
          shelkovoVsMeanPercent: {
            type: 'number',
          },
        },
        [
          'shelkovoTariff',
          'medianTariff',
          'peerMedianTariff',
          'meanTariff',
          'minTariff',
          'maxTariff',
          'shelkovoRank',
          'totalSettlements',
          'cheaperCount',
          'moreExpensiveCount',
          'shelkovoVsMedianPercent',
          'shelkovoVsPeerMedianPercent',
          'shelkovoVsMeanPercent',
        ],
      ),
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
      title: 'Сравни.Шелково Settlements Feed',
      version: '1.0.0',
      description:
        'Read-only OpenAPI wrapper для полного feed поселков с вычисленными расстояниями, пригодный для автоматического discovery.',
    },
    servers: [
      {
        url: server(root),
      },
    ],
    paths: {
      [FEED]: {
        get: {
          operationId: 'getSettlements',
          summary: 'Read full settlements feed',
          description:
            'Возвращает полный feed поселков с detail-полями, distance, rating, stats и comparisons.',
          responses: {
            200: {
              description: 'Full settlements feed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SettlementsPayload',
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
        SettlementsPayload: body,
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
            'title*': star('Полный машиночитаемый feed поселков'),
          },
          {
            href: abs(root, EXPLORER),
            type: 'application/json',
            'title*': star('Облегченный explorer feed для списка и карты'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, SCHEMA),
            type: 'application/schema+json',
            'title*': star('JSON Schema для полного feed'),
          },
          {
            href: abs(root, OPENAPI),
            type: OAS,
            'title*': star('OpenAPI для полного feed'),
          },
        ],
      },
    ],
  };
}

export function links(root: string): string {
  return [
    `<${abs(root, SCHEMA)}>; rel="service-desc"; type="application/schema+json"`,
    `<${abs(root, OPENAPI)}>; rel="service-desc"; type="${OAS}"`,
    `<${abs(root, CATALOG)}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`,
  ].join(', ');
}

export function self(root: string): string {
  return `<${abs(root, CATALOG)}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
}
