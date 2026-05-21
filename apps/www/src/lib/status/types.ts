import type { PreprocessedSiteMarkdownBody } from '../markdown/render';
import type { EntityMentionTarget } from '../mentions';
import type {
  StatusArea,
  StatusKind,
  StatusService,
  StatusServiceState,
} from './schema';

export interface StatusDuration {
  readonly totalMinutes: number;
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
  readonly startedAt: Date;
  readonly startedIso: string;
  readonly startedHasTime: boolean;
  readonly endedAt?: Date;
  readonly endedIso?: string;
  readonly endedHasTime: boolean;
  readonly isActive: boolean;
  readonly appliesToAllAreas: boolean;
  readonly areas: readonly StatusArea[];
  readonly sourceUrl?: string;
  readonly excerpt?: string;
  readonly hasPage: boolean;
  readonly body: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly EntityMentionTarget[];
  readonly sortStartedAt: number;
  readonly sortLastChangeAt: number;
  readonly duration?: StatusDuration;
}

export interface StatusDaysWithoutIncidents {
  readonly mode: 'count' | 'activeIncident' | 'noIncidents';
  readonly days?: number;
  readonly lastEndedIso?: string;
}

export interface StatusServiceSummary {
  readonly service: StatusService;
  readonly serviceStatus: StatusServiceState;
  readonly incidents: readonly StatusIncident[];
  readonly activeIncidents: readonly StatusIncident[];
  readonly activeMaintenance: readonly StatusIncident[];
  readonly daysWithoutIncidents: StatusDaysWithoutIncidents;
}

export interface StatusDataset {
  readonly incidents: readonly StatusIncident[];
  readonly active: readonly StatusIncident[];
  readonly services: readonly StatusServiceSummary[];
  readonly byId: ReadonlyMap<string, StatusIncident>;
  readonly byService: ReadonlyMap<StatusService, StatusServiceSummary>;
}
