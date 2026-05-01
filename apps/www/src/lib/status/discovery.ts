import { absoluteUrl } from '../site';
import {
  statusApiCatalogPath,
  statusDataPath,
  statusIncidentMarkdownUrl,
  statusLlmsFullPath,
  statusLlmsPath,
  statusMarkdownUrl,
  statusOpenApiPath,
  statusPath,
  statusSchemaPath,
  statusServiceMarkdownUrl,
  statusServiceUrl,
} from './routes';
import type {
  StatusDataset,
  StatusDaysWithoutIncidents,
  StatusDuration,
  StatusIncident,
  StatusServiceSummary,
} from './schema';
import {
  STATUS_AREAS,
  STATUS_KINDS,
  STATUS_SERVICE_STATES,
  STATUS_SERVICES,
} from './schema';
import {
  formatStatusDuration,
  formatStatusDaysWithoutIncidents,
  formatStatusKind,
  formatStatusService,
  formatStatusServiceState,
  getStatusIncidentPhase,
} from './view';

export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
export const OAS = 'application/vnd.oai.openapi+json';

export type StatusDiscoveryIncidentPhase = 'active' | 'resolved' | 'scheduled';

export interface StatusDiscoveryDuration {
  readonly total_minutes: number;
  readonly human: string;
}

export interface StatusDiscoveryDaysWithoutIncidents {
  readonly mode: StatusDaysWithoutIncidents['mode'];
  readonly label: string;
  readonly days?: number;
  readonly last_ended_iso?: string;
}

export interface StatusDiscoveryIncidentRef {
  readonly id: string;
  readonly title: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly phase: StatusDiscoveryIncidentPhase;
  readonly phase_label: string;
}

export interface StatusDiscoveryIncident {
  readonly id: string;
  readonly title: string;
  readonly service: StatusIncident['service'];
  readonly service_label: string;
  readonly kind: StatusIncident['kind'];
  readonly kind_label: string;
  readonly year: number;
  readonly month: number;
  readonly slug: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly started_at: string;
  readonly started_has_time: boolean;
  readonly ended_at?: string;
  readonly ended_has_time: boolean;
  readonly is_active: boolean;
  readonly phase: StatusDiscoveryIncidentPhase;
  readonly phase_label: string;
  readonly applies_to_all_areas: boolean;
  readonly areas: StatusIncident['areas'];
  readonly source_url?: string;
  readonly excerpt?: string;
  readonly body_markdown: string;
  readonly duration?: StatusDiscoveryDuration;
}

export interface StatusDiscoveryServiceSummary {
  readonly service: StatusServiceSummary['service'];
  readonly service_label: string;
  readonly service_status: StatusServiceSummary['service_status'];
  readonly service_status_label: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly incident_ids: readonly string[];
  readonly active_incident_ids: readonly string[];
  readonly active_maintenance_ids: readonly string[];
  readonly days_without_incidents: StatusDiscoveryDaysWithoutIncidents;
  readonly latest_incident?: StatusDiscoveryIncidentRef;
}

export interface StatusDiscoveryPayload {
  readonly stats: {
    readonly incident_count: number;
    readonly active_count: number;
    readonly active_incident_count: number;
    readonly active_maintenance_count: number;
    readonly service_count: number;
    readonly updated_at?: string;
  };
  readonly active: readonly StatusDiscoveryIncident[];
  readonly incidents: readonly StatusDiscoveryIncident[];
  readonly services: readonly StatusDiscoveryServiceSummary[];
}

const STATUS_PAYLOAD_SCHEMA = 'StatusPayload';

const abs = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root}/`).toString();

const fullUrl = (value: string): string => absoluteUrl(value);

const server = (root: string): string => root.replace(/\/$/, '');

const star = (
  value: string,
): readonly { readonly value: string; readonly language: 'ru' }[] => [
  { value, language: 'ru' },
];

const text = (minLength = 0): Record<string, unknown> => ({
  type: 'string',
  ...(minLength > 0 ? { minLength } : {}),
});

const uri = (): Record<string, unknown> => ({
  type: 'string',
  format: 'uri',
});

const dateTime = (): Record<string, unknown> => ({
  type: 'string',
  format: 'date-time',
});

const flag = (): Record<string, unknown> => ({
  type: 'boolean',
});

const integer = (minimum = 0): Record<string, unknown> => ({
  type: 'integer',
  minimum,
});

const list = (
  items: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, unknown> => ({
  type: 'array',
  items,
  ...(extra ?? {}),
});

const obj = (
  properties: Record<string, unknown>,
  required: readonly string[],
): Record<string, unknown> => ({
  type: 'object',
  additionalProperties: false,
  properties,
  required,
});

function rewriteSchemaRefs(value: unknown, schemaRef: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteSchemaRefs(item, schemaRef));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (
        key === '$ref' &&
        typeof entry === 'string' &&
        entry.startsWith('#/')
      ) {
        return [key, `${schemaRef}${entry.slice(1)}`];
      }

      return [key, rewriteSchemaRefs(entry, schemaRef)];
    }),
  );
}

const phase = (
  item: Pick<StatusIncident, 'is_active' | 'ended_iso'>,
): StatusDiscoveryIncidentPhase =>
  item.is_active ? 'active' : item.ended_iso ? 'resolved' : 'scheduled';

const duration = (item: StatusDuration): StatusDiscoveryDuration => ({
  total_minutes: item.total_minutes,
  human: formatStatusDuration(item),
});

function incidentRef(item: StatusIncident): StatusDiscoveryIncidentRef {
  const current = getStatusIncidentPhase(item);

  return {
    id: item.id,
    title: item.title,
    html_url: item.canonical,
    markdown_url: fullUrl(statusIncidentMarkdownUrl(item)),
    phase: phase(item),
    phase_label: current.label,
  };
}

function daysWithoutIncidents(
  value: StatusDaysWithoutIncidents,
): StatusDiscoveryDaysWithoutIncidents {
  return {
    mode: value.mode,
    label: formatStatusDaysWithoutIncidents(value),
    ...(value.days !== undefined ? { days: value.days } : {}),
    ...(value.last_ended_iso ? { last_ended_iso: value.last_ended_iso } : {}),
  };
}

function incident(item: StatusIncident): StatusDiscoveryIncident {
  const current = getStatusIncidentPhase(item);

  return {
    id: item.id,
    title: item.title,
    service: item.service,
    service_label: formatStatusService(item.service),
    kind: item.kind,
    kind_label: formatStatusKind(item.kind),
    year: item.year,
    month: item.month,
    slug: item.slug,
    html_url: item.canonical,
    markdown_url: fullUrl(`${item.url}index.md`),
    started_at: item.started_iso,
    started_has_time: item.started_has_time,
    ...(item.ended_iso ? { ended_at: item.ended_iso } : {}),
    ended_has_time: item.ended_has_time,
    is_active: item.is_active,
    phase: phase(item),
    phase_label: current.label,
    applies_to_all_areas: item.applies_to_all_areas,
    areas: [...item.areas],
    ...(item.source_url ? { source_url: fullUrl(item.source_url) } : {}),
    ...(item.excerpt ? { excerpt: item.excerpt } : {}),
    body_markdown: item.body,
    ...(item.duration ? { duration: duration(item.duration) } : {}),
  };
}

function summary(item: StatusServiceSummary): StatusDiscoveryServiceSummary {
  const latest = item.incidents[0];

  return {
    service: item.service,
    service_label: formatStatusService(item.service),
    service_status: item.service_status,
    service_status_label: formatStatusServiceState(item.service_status),
    html_url: fullUrl(statusServiceUrl(item.service)),
    markdown_url: fullUrl(statusServiceMarkdownUrl(item.service)),
    incident_ids: item.incidents.map((entry) => entry.id),
    active_incident_ids: item.active_incidents.map((entry) => entry.id),
    active_maintenance_ids: item.active_maintenance.map((entry) => entry.id),
    days_without_incidents: daysWithoutIncidents(item.days_without_incidents),
    ...(latest ? { latest_incident: incidentRef(latest) } : {}),
  };
}

const latestUpdate = (data: StatusDataset): string | undefined => {
  const item = data.incidents[0];

  if (!item) {
    return undefined;
  }

  return item.ended_iso ?? item.started_iso;
};

export const buildStatusPayload = (
  data: StatusDataset,
): StatusDiscoveryPayload => ({
  stats: {
    incident_count: data.incidents.length,
    active_count: data.active.length,
    active_incident_count: data.active.filter(
      (item) => item.kind === 'incident',
    ).length,
    active_maintenance_count: data.active.filter(
      (item) => item.kind === 'maintenance',
    ).length,
    service_count: data.services.length,
    ...(latestUpdate(data) ? { updated_at: latestUpdate(data) } : {}),
  },
  active: data.active.map(incident),
  incidents: data.incidents.map(incident),
  services: data.services.map(summary),
});

export function schema(root: string): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: abs(root, statusSchemaPath()),
    title: 'StatusPayload',
    description:
      'Read-only полный feed status-section с incident history, derive-сводками сервисов и markdown companions.',
    type: 'object',
    additionalProperties: false,
    required: ['stats', 'active', 'incidents', 'services'],
    properties: {
      stats: {
        $ref: '#/$defs/stats',
      },
      active: list({
        $ref: '#/$defs/incident',
      }),
      incidents: list({
        $ref: '#/$defs/incident',
      }),
      services: list({
        $ref: '#/$defs/serviceSummary',
      }),
    },
    $defs: {
      area: {
        enum: [...STATUS_AREAS],
      },
      service: {
        enum: [...STATUS_SERVICES],
      },
      kind: {
        enum: [...STATUS_KINDS],
      },
      serviceStatus: {
        enum: [...STATUS_SERVICE_STATES],
      },
      phase: {
        enum: ['active', 'resolved', 'scheduled'],
      },
      duration: obj(
        {
          total_minutes: integer(0),
          human: text(1),
        },
        ['total_minutes', 'human'],
      ),
      daysWithoutIncidents: obj(
        {
          mode: {
            enum: ['count', 'active_incident', 'no_incidents'],
          },
          label: text(1),
          days: integer(0),
          last_ended_iso: dateTime(),
        },
        ['mode', 'label'],
      ),
      incidentRef: obj(
        {
          id: text(1),
          title: text(1),
          html_url: uri(),
          markdown_url: uri(),
          phase: {
            $ref: '#/$defs/phase',
          },
          phase_label: text(1),
        },
        ['id', 'title', 'html_url', 'markdown_url', 'phase', 'phase_label'],
      ),
      incident: obj(
        {
          id: text(1),
          title: text(1),
          service: {
            $ref: '#/$defs/service',
          },
          service_label: text(1),
          kind: {
            $ref: '#/$defs/kind',
          },
          kind_label: text(1),
          year: integer(2000),
          month: {
            type: 'integer',
            minimum: 1,
            maximum: 12,
          },
          slug: text(1),
          html_url: uri(),
          markdown_url: uri(),
          started_at: dateTime(),
          started_has_time: flag(),
          ended_at: dateTime(),
          ended_has_time: flag(),
          is_active: flag(),
          phase: {
            $ref: '#/$defs/phase',
          },
          phase_label: text(1),
          applies_to_all_areas: flag(),
          areas: list({
            $ref: '#/$defs/area',
          }),
          source_url: uri(),
          excerpt: text(1),
          body_markdown: text(),
          duration: {
            $ref: '#/$defs/duration',
          },
        },
        [
          'id',
          'title',
          'service',
          'service_label',
          'kind',
          'kind_label',
          'year',
          'month',
          'slug',
          'html_url',
          'markdown_url',
          'started_at',
          'started_has_time',
          'ended_has_time',
          'is_active',
          'phase',
          'phase_label',
          'applies_to_all_areas',
          'areas',
          'body_markdown',
        ],
      ),
      serviceSummary: obj(
        {
          service: {
            $ref: '#/$defs/service',
          },
          service_label: text(1),
          service_status: {
            $ref: '#/$defs/serviceStatus',
          },
          service_status_label: text(1),
          html_url: uri(),
          markdown_url: uri(),
          incident_ids: list(text(1)),
          active_incident_ids: list(text(1)),
          active_maintenance_ids: list(text(1)),
          days_without_incidents: {
            $ref: '#/$defs/daysWithoutIncidents',
          },
          latest_incident: {
            $ref: '#/$defs/incidentRef',
          },
        },
        [
          'service',
          'service_label',
          'service_status',
          'service_status_label',
          'html_url',
          'markdown_url',
          'incident_ids',
          'active_incident_ids',
          'active_maintenance_ids',
          'days_without_incidents',
        ],
      ),
      stats: obj(
        {
          incident_count: integer(0),
          active_count: integer(0),
          active_incident_count: integer(0),
          active_maintenance_count: integer(0),
          service_count: integer(0),
          updated_at: dateTime(),
        },
        [
          'incident_count',
          'active_count',
          'active_incident_count',
          'active_maintenance_count',
          'service_count',
        ],
      ),
    },
  };
}

export function openapi(root: string): Record<string, unknown> {
  const schemaRef = `#/components/schemas/${STATUS_PAYLOAD_SCHEMA}`;
  const body = Object.fromEntries(
    Object.entries(schema(root)).filter(
      ([key]) => key !== '$schema' && key !== '$id',
    ),
  );
  const componentBody = rewriteSchemaRefs(body, schemaRef);

  return {
    openapi: '3.1.0',
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    info: {
      title: 'Шелково Status Feed',
      version: '1.0.0',
      description:
        'Read-only OpenAPI wrapper для /status/data/status.json с историей incidents и derive-сводками сервисов.',
    },
    servers: [
      {
        url: server(root),
      },
    ],
    paths: {
      [statusDataPath()]: {
        get: {
          operationId: 'getStatusFeed',
          summary: 'Read full status feed',
          description:
            'Возвращает основной structured feed status-section с активными и историческими incidents, а также derive-сводками по сервисам.',
          responses: {
            200: {
              description: 'Full status feed',
              content: {
                'application/json': {
                  schema: {
                    $ref: schemaRef,
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
        [STATUS_PAYLOAD_SCHEMA]: componentBody,
      },
    },
  };
}

export function catalog(root: string): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: abs(root, statusPath()),
        item: [
          {
            href: abs(root, statusDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed status-section'),
          },
          {
            href: fullUrl(statusMarkdownUrl()),
            type: 'text/markdown',
            'title*': star('Markdown companion status home'),
          },
          {
            href: abs(root, statusLlmsPath()),
            type: 'text/plain',
            'title*': star('Короткий агентный обзор llms.txt'),
          },
          {
            href: abs(root, statusLlmsFullPath()),
            type: 'text/plain',
            'title*': star('Расширенный агентный обзор llms-full.txt'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, statusSchemaPath()),
            type: 'application/schema+json',
            'title*': star('JSON Schema для status feed'),
          },
          {
            href: abs(root, statusOpenApiPath()),
            type: OAS,
            'title*': star('OpenAPI для status feed'),
          },
        ],
      },
    ],
  };
}

export const links = (root: string): string =>
  [
    `<${abs(root, statusSchemaPath())}>; rel="service-desc"; type="application/schema+json"`,
    `<${abs(root, statusOpenApiPath())}>; rel="service-desc"; type="${OAS}"`,
    `<${abs(root, statusApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`,
  ].join(', ');

export const self = (root: string): string =>
  `<${abs(root, statusApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
