import { isAbsoluteUrl } from '@shelkovo/url';

import type { NewsDateParts, NewsTimestamp } from '../news/date';
import { NEWS_AREAS } from '../news/schema';

export { isAbsoluteUrl };
export type {
  NewsDateParts as StatusDateParts,
  NewsTimestamp as StatusTimestamp,
};
export {
  normalizeNewsTimestampInput as normalizeStatusTimestampInput,
  parseNewsTimestamp as parseStatusTimestamp,
  parseNewsTimestampInput as parseStatusTimestampInput,
} from '../news/date';

export const STATUS_AREAS = NEWS_AREAS;
export type StatusArea = (typeof STATUS_AREAS)[number];

export const STATUS_SERVICES = ['electricity', 'water', 'dam'] as const;
export type StatusService = (typeof STATUS_SERVICES)[number];

export const STATUS_KINDS = ['incident', 'maintenance'] as const;
export type StatusKind = (typeof STATUS_KINDS)[number];

export const STATUS_SERVICE_STATES = ['green', 'amber', 'red'] as const;
export type StatusServiceState = (typeof STATUS_SERVICE_STATES)[number];

export interface StatusDuration {
  readonly total_minutes: number;
}

export interface StatusIncident {
  readonly id: string;
  readonly title: string;
  readonly service: StatusService;
  readonly kind: StatusKind;
  readonly year: number;
  readonly month: number;
  readonly slug: string;
  readonly url: string;
  readonly canonical: string;
  readonly started_at: Date;
  readonly started_iso: string;
  readonly started_has_time: boolean;
  readonly ended_at?: Date;
  readonly ended_iso?: string;
  readonly ended_has_time: boolean;
  readonly is_active: boolean;
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly StatusArea[];
  readonly source_url?: string;
  readonly excerpt?: string;
  readonly has_page: boolean;
  readonly body: string;
  readonly sort_started_at: number;
  readonly sort_last_change_at: number;
  readonly duration?: StatusDuration;
}

export interface StatusDaysWithoutIncidents {
  readonly mode: 'count' | 'active_incident' | 'no_incidents';
  readonly days?: number;
  readonly last_ended_iso?: string;
}

export interface StatusServiceSummary {
  readonly service: StatusService;
  readonly service_status: StatusServiceState;
  readonly incidents: readonly StatusIncident[];
  readonly active_incidents: readonly StatusIncident[];
  readonly active_maintenance: readonly StatusIncident[];
  readonly days_without_incidents: StatusDaysWithoutIncidents;
}

export interface StatusDataset {
  readonly incidents: readonly StatusIncident[];
  readonly active: readonly StatusIncident[];
  readonly services: readonly StatusServiceSummary[];
  readonly by_id: ReadonlyMap<string, StatusIncident>;
  readonly by_service: ReadonlyMap<StatusService, StatusServiceSummary>;
}
