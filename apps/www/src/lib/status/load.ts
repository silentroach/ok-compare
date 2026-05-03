import { dateTimeFromISO } from '@shelkovo/format';
import type { CollectionEntry } from 'astro:content';

import {
  normalizePeopleMentions,
  type PeopleMentionRegistry,
} from '../people/mentions';
import { loadPeopleMentionRegistry } from '../people/load';
import { statusIncidentCanonical, statusIncidentUrl } from './routes';
import {
  parseStatusTimestamp,
  STATUS_AREAS,
  STATUS_SERVICES,
  type StatusArea,
  type StatusDataset,
  type StatusDaysWithoutIncidents,
  type StatusDuration,
  type StatusIncident,
  type StatusService,
  type StatusServiceSummary,
} from './schema';
import { deriveStatusIncidentTitle, extractStatusExcerpt } from './view';

export type StatusIncidentEntry = Pick<
  CollectionEntry<'statusIncidents'>,
  'id' | 'data' | 'body'
>;

let cache: Promise<StatusDataset> | undefined;
const EMPTY_MENTION_REGISTRY: PeopleMentionRegistry = new Map();

interface EntryParts {
  readonly year: string;
  readonly month: string;
  readonly slug: string;
}

const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');

function parseEntryTimestamp(
  value: string,
  context: string,
  expected?: { readonly year: string; readonly month: string },
): NonNullable<ReturnType<typeof parseStatusTimestamp>> {
  const timestamp = parseStatusTimestamp(value);

  if (!timestamp) {
    throw new Error(
      `${context} must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    );
  }

  if (
    expected &&
    (timestamp.year !== expected.year || timestamp.month !== expected.month)
  ) {
    throw new Error(
      `${context} ${timestamp.iso} must match ${expected.year}/${expected.month}`,
    );
  }

  return timestamp;
}

function incidentParts(entry: StatusIncidentEntry): EntryParts {
  const parts = entry.id.split('/');

  if (parts.length !== 3) {
    throw new Error(`status incident id "${entry.id}" must use YYYY/MM/[slug]`);
  }

  return {
    year: parts[0],
    month: parts[1],
    slug: parts[2],
  };
}

const areas = (
  values: readonly StatusArea[] | undefined,
): {
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly StatusArea[];
} => {
  if (!values?.length) {
    return {
      applies_to_all_areas: true,
      areas: [...STATUS_AREAS],
    };
  }

  return {
    applies_to_all_areas: false,
    areas: [...values],
  };
};

const isActive = (now: Date, start: Date, end?: Date): boolean =>
  start.valueOf() <= now.valueOf() &&
  (end === undefined || end.valueOf() > now.valueOf());

const duration = (start: Date, end: Date): StatusDuration => ({
  total_minutes: Math.max(
    0,
    Math.round((end.valueOf() - start.valueOf()) / 60000),
  ),
});

function normalizeIncident(
  entry: StatusIncidentEntry,
  now: Date,
  peopleRegistry: PeopleMentionRegistry,
): StatusIncident {
  const parts = incidentParts(entry);
  const started = parseEntryTimestamp(
    entry.data.started_at,
    `status incident "${entry.id}" started_at`,
    {
      year: parts.year,
      month: parts.month,
    },
  );
  const ended = entry.data.ended_at
    ? parseEntryTimestamp(
        entry.data.ended_at,
        `status incident "${entry.id}" ended_at`,
      )
    : undefined;

  if (ended && ended.at.valueOf() < started.at.valueOf()) {
    throw new Error(
      `status incident "${entry.id}" ended_at cannot be earlier than started_at`,
    );
  }

  const area = areas(entry.data.areas);
  const body = entry.body?.trimEnd() ?? '';
  const content =
    body.trim().length > 0
      ? normalizePeopleMentions({
          markdown: body,
          context: `status incident "${entry.id}" body`,
          registry: peopleRegistry,
        }).markdown
      : '';
  const changeAt = ended?.at ?? started.at;

  return {
    id: entry.id,
    title:
      entry.data.title ??
      deriveStatusIncidentTitle({
        kind: entry.data.kind,
        service: entry.data.service,
      }),
    service: entry.data.service,
    kind: entry.data.kind,
    year: Number(parts.year),
    month: Number(parts.month),
    slug: parts.slug,
    url: statusIncidentUrl(parts),
    canonical: statusIncidentCanonical(parts),
    started_at: started.at,
    started_iso: started.iso,
    started_has_time: started.has_time,
    ...(ended
      ? {
          ended_at: ended.at,
          ended_iso: ended.iso,
        }
      : {}),
    ended_has_time: ended?.has_time ?? false,
    is_active: isActive(now, started.at, ended?.at),
    applies_to_all_areas: area.applies_to_all_areas,
    areas: area.areas,
    ...(entry.data.source_url ? { source_url: entry.data.source_url } : {}),
    ...(content ? { excerpt: extractStatusExcerpt(content) } : {}),
    has_page: content.length > 0,
    body: content,
    sort_started_at: started.at.valueOf(),
    sort_last_change_at: changeAt.valueOf(),
    ...(ended ? { duration: duration(started.at, ended.at) } : {}),
  } satisfies StatusIncident;
}

function compareIncidentsDesc(a: StatusIncident, b: StatusIncident): number {
  const change = b.sort_last_change_at - a.sort_last_change_at;

  if (change) {
    return change;
  }

  const start = b.sort_started_at - a.sort_started_at;

  if (start) {
    return start;
  }

  return byText(a.id, b.id);
}

function daysWithoutIncidents(
  incidents: readonly StatusIncident[],
  now: Date,
): StatusDaysWithoutIncidents {
  const activeIncident = incidents.find(
    (item) => item.kind === 'incident' && item.is_active,
  );

  if (activeIncident) {
    return { mode: 'active_incident' };
  }

  const latest = incidents.find(
    (item) => item.kind === 'incident' && item.ended_iso,
  );

  if (!latest?.ended_iso) {
    return { mode: 'no_incidents' };
  }

  const today = dateTimeFromISO(now.toISOString()).startOf('day');
  const last = dateTimeFromISO(latest.ended_iso).startOf('day');

  return {
    mode: 'count',
    days: Math.max(0, Math.floor(today.diff(last, 'days').days)),
    last_ended_iso: latest.ended_iso,
  };
}

function serviceSummary(
  service: StatusService,
  incidents: readonly StatusIncident[],
  now: Date,
): StatusServiceSummary {
  const list = incidents.filter((item) => item.service === service);
  const activeIncidents = list.filter(
    (item) => item.kind === 'incident' && item.is_active,
  );
  const activeMaintenance = list.filter(
    (item) => item.kind === 'maintenance' && item.is_active,
  );

  return {
    service,
    service_status:
      activeIncidents.length > 0
        ? 'red'
        : activeMaintenance.length > 0
          ? 'amber'
          : 'green',
    incidents: list,
    active_incidents: activeIncidents,
    active_maintenance: activeMaintenance,
    days_without_incidents: daysWithoutIncidents(list, now),
  };
}

export const buildStatusDataset = (
  entries: readonly StatusIncidentEntry[],
  opts?: {
    readonly now?: Date;
    readonly people_registry?: PeopleMentionRegistry;
  },
): StatusDataset => {
  const now = opts?.now ?? new Date();
  const peopleRegistry = opts?.people_registry ?? EMPTY_MENTION_REGISTRY;
  const incidents = entries
    .map((entry) => normalizeIncident(entry, now, peopleRegistry))
    .sort(compareIncidentsDesc);
  const services = STATUS_SERVICES.map((service) =>
    serviceSummary(service, incidents, now),
  );

  return {
    incidents,
    active: incidents.filter((item) => item.is_active),
    services,
    by_id: new Map(incidents.map((item) => [item.id, item])),
    by_service: new Map(services.map((item) => [item.service, item])),
  };
};

export const loadStatusData = (): Promise<StatusDataset> => {
  cache ??= Promise.all([
    import('astro:content').then(
      ({ getCollection }) =>
        getCollection('statusIncidents') as Promise<
          readonly StatusIncidentEntry[]
        >,
    ),
    loadPeopleMentionRegistry(),
  ]).then(([entries, people_registry]) =>
    buildStatusDataset(entries, { people_registry }),
  );

  return cache;
};

export const loadStatusIncidents = async (): Promise<
  readonly StatusIncident[]
> => (await loadStatusData()).incidents;

export const loadActiveStatusIncidents = async (): Promise<
  readonly StatusIncident[]
> => (await loadStatusData()).active;

export const loadStatusServices = async (): Promise<
  readonly StatusServiceSummary[]
> => (await loadStatusData()).services;

export const loadStatusIncident = async (
  id: string,
): Promise<StatusIncident | undefined> =>
  (await loadStatusData()).by_id.get(id);

export const loadStatusService = async (
  service: StatusService,
): Promise<StatusServiceSummary | undefined> =>
  (await loadStatusData()).by_service.get(service);
