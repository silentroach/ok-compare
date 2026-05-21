import { absoluteUrl } from '../site';
import type {
  StatusDataset,
  StatusDaysWithoutIncidents,
  StatusDuration,
  StatusIncident,
  StatusServiceSummary,
} from './types';
import {
  statusIncidentMarkdownUrl,
  statusServiceMarkdownUrl,
  statusServiceUrl,
} from './routes';
import {
  formatStatusDuration,
  formatStatusDaysWithoutIncidents,
  formatStatusKind,
  formatStatusService,
  formatStatusServiceState,
  getStatusIncidentPhase,
} from './view';

export type StatusPublicIncidentPhase = 'active' | 'resolved' | 'scheduled';
export type StatusPublicDaysWithoutIncidentsMode =
  | 'count'
  | 'active_incident'
  | 'no_incidents';

export interface StatusPublicDurationDto {
  readonly total_minutes: number;
  readonly human: string;
}

export interface StatusPublicDaysWithoutIncidentsDto {
  readonly mode: StatusPublicDaysWithoutIncidentsMode;
  readonly label: string;
  readonly days?: number;
  readonly last_ended_iso?: string;
}

interface StatusPublicIncidentLinksDto {
  readonly html_url?: string;
  readonly markdown_url?: string;
}

export interface StatusPublicIncidentRefDto extends StatusPublicIncidentLinksDto {
  readonly id: string;
  readonly title: string;
  readonly phase: StatusPublicIncidentPhase;
  readonly phase_label: string;
}

export interface StatusPublicIncidentDto extends StatusPublicIncidentLinksDto {
  readonly id: string;
  readonly title: string;
  readonly service: StatusIncident['service'];
  readonly service_label: string;
  readonly kind: StatusIncident['kind'];
  readonly kind_label: string;
  readonly year: number;
  readonly month: number;
  readonly slug: string;
  readonly started_at: string;
  readonly started_has_time: boolean;
  readonly ended_at?: string;
  readonly ended_has_time: boolean;
  readonly is_active: boolean;
  readonly phase: StatusPublicIncidentPhase;
  readonly phase_label: string;
  readonly applies_to_all_areas: boolean;
  readonly areas: StatusIncident['areas'];
  readonly source_url?: string;
  readonly excerpt?: string;
  readonly body_markdown: string;
  readonly duration?: StatusPublicDurationDto;
}

export interface StatusPublicServiceSummaryDto {
  readonly service: StatusServiceSummary['service'];
  readonly service_label: string;
  readonly service_status: StatusServiceSummary['serviceStatus'];
  readonly service_status_label: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly incident_ids: readonly string[];
  readonly active_incident_ids: readonly string[];
  readonly active_maintenance_ids: readonly string[];
  readonly days_without_incidents: StatusPublicDaysWithoutIncidentsDto;
  readonly latest_incident?: StatusPublicIncidentRefDto;
}

export interface StatusPublicPayloadDto {
  readonly stats: {
    readonly incident_count: number;
    readonly active_count: number;
    readonly active_incident_count: number;
    readonly active_maintenance_count: number;
    readonly service_count: number;
    readonly updated_at?: string;
  };
  readonly active: readonly StatusPublicIncidentDto[];
  readonly incidents: readonly StatusPublicIncidentDto[];
  readonly services: readonly StatusPublicServiceSummaryDto[];
}

const fullUrl = (value: string): string => absoluteUrl(value);

const phase = (
  item: Pick<StatusIncident, 'isActive' | 'endedIso'>,
): StatusPublicIncidentPhase =>
  item.isActive ? 'active' : item.endedIso ? 'resolved' : 'scheduled';

const duration = (item: StatusDuration): StatusPublicDurationDto => ({
  total_minutes: item.totalMinutes,
  human: formatStatusDuration(item),
});

const daysWithoutIncidentsMode = (
  mode: StatusDaysWithoutIncidents['mode'],
): StatusPublicDaysWithoutIncidentsMode => {
  switch (mode) {
    case 'activeIncident':
      return 'active_incident';
    case 'noIncidents':
      return 'no_incidents';
    case 'count':
      return 'count';
  }
};

const incidentLinks = (item: StatusIncident): StatusPublicIncidentLinksDto =>
  item.hasPage
    ? {
        html_url: item.canonical,
        markdown_url: fullUrl(statusIncidentMarkdownUrl(item)),
      }
    : {};

function incidentRef(item: StatusIncident): StatusPublicIncidentRefDto {
  const current = getStatusIncidentPhase(item);

  return {
    id: item.id,
    title: item.title,
    ...incidentLinks(item),
    phase: phase(item),
    phase_label: current.label,
  };
}

function daysWithoutIncidents(
  value: StatusDaysWithoutIncidents,
): StatusPublicDaysWithoutIncidentsDto {
  return {
    mode: daysWithoutIncidentsMode(value.mode),
    label: formatStatusDaysWithoutIncidents(value),
    ...(value.days !== undefined ? { days: value.days } : {}),
    ...(value.lastEndedIso ? { last_ended_iso: value.lastEndedIso } : {}),
  };
}

function incident(item: StatusIncident): StatusPublicIncidentDto {
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
    ...incidentLinks(item),
    started_at: item.startedIso,
    started_has_time: item.startedHasTime,
    ...(item.endedIso ? { ended_at: item.endedIso } : {}),
    ended_has_time: item.endedHasTime,
    is_active: item.isActive,
    phase: phase(item),
    phase_label: current.label,
    applies_to_all_areas: item.appliesToAllAreas,
    areas: [...item.areas],
    ...(item.sourceUrl ? { source_url: fullUrl(item.sourceUrl) } : {}),
    ...(item.excerpt ? { excerpt: item.excerpt } : {}),
    body_markdown: item.body,
    ...(item.duration ? { duration: duration(item.duration) } : {}),
  };
}

function summary(item: StatusServiceSummary): StatusPublicServiceSummaryDto {
  const latest = item.incidents[0];

  return {
    service: item.service,
    service_label: formatStatusService(item.service),
    service_status: item.serviceStatus,
    service_status_label: formatStatusServiceState(item.serviceStatus),
    html_url: fullUrl(statusServiceUrl(item.service)),
    markdown_url: fullUrl(statusServiceMarkdownUrl(item.service)),
    incident_ids: item.incidents.map((entry) => entry.id),
    active_incident_ids: item.activeIncidents.map((entry) => entry.id),
    active_maintenance_ids: item.activeMaintenance.map((entry) => entry.id),
    days_without_incidents: daysWithoutIncidents(item.daysWithoutIncidents),
    ...(latest ? { latest_incident: incidentRef(latest) } : {}),
  };
}

const latestUpdate = (data: StatusDataset): string | undefined => {
  const item = data.incidents[0];

  if (!item) {
    return undefined;
  }

  return item.endedIso ?? item.startedIso;
};

export const buildStatusPublicPayload = (
  data: StatusDataset,
): StatusPublicPayloadDto => ({
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
