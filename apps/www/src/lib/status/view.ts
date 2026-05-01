import { dateTimeFromISO, pluralizeRu } from '@shelkovo/format';

import { formatNewsArea } from '../news/view';
import type {
  StatusArea,
  StatusDaysWithoutIncidents,
  StatusDuration,
  StatusIncident,
  StatusKind,
  StatusService,
  StatusServiceState,
} from './schema';

const SERVICE_LABELS: Record<StatusService, string> = {
  electricity: 'Электричество',
  water: 'Вода',
  dam: 'Дамба',
};

const KIND_LABELS: Record<StatusKind, string> = {
  incident: 'Инцидент',
  maintenance: 'Плановые работы',
};

const INCIDENT_TITLE_LABELS: Record<StatusService, string> = {
  electricity: 'Нет электричества',
  water: 'Нет воды',
  dam: 'Проезд через дамбу закрыт',
};

const MAINTENANCE_TITLE_LABELS: Record<StatusService, string> = {
  electricity: 'Плановые работы: электричество',
  water: 'Плановые работы: вода',
  dam: 'Плановые работы: дамба',
};

const SERVICE_STATE_LABELS: Record<StatusServiceState, string> = {
  green: 'В норме',
  amber: 'Плановые работы',
  red: 'Есть проблемы',
};

interface StatusIncidentPhase {
  readonly label: string;
  readonly tone: 'danger' | 'warning' | 'success' | 'muted' | 'info';
}

interface StatusIncidentPeriodPart {
  readonly iso: string;
  readonly text: string;
}

export interface StatusIncidentPeriod {
  readonly prefix?: 'Начало' | 'Начиная с';
  readonly start: StatusIncidentPeriodPart;
  readonly end?: StatusIncidentPeriodPart;
  readonly duration?: string;
}

const SPACE = /\s+/gu;
const CURRENT_STATUS_YEAR = dateTimeFromISO(new Date().toISOString()).year;

const formatStatusCalendarDate = (iso: string): string => {
  const value = dateTimeFromISO(iso);

  return value.toFormat(
    value.year === CURRENT_STATUS_YEAR ? 'd MMMM' : 'd MMMM yyyy',
  );
};

const formatStatusTime = (iso: string): string =>
  dateTimeFromISO(iso).toFormat('HH:mm');

const isSameStatusDay = (startIso: string, endIso: string): boolean =>
  dateTimeFromISO(startIso).hasSame(dateTimeFromISO(endIso), 'day');

export const extractStatusExcerpt = (markdown: string): string | undefined => {
  const first = markdown
    .trim()
    .split(/\n\s*\n/u)
    .map((item) => item.replace(/\s*\n\s*/gu, ' ').trim())
    .find((item) => item.length > 0);

  return first ? first.replace(SPACE, ' ') : undefined;
};

export const formatStatusDate = (
  iso: string,
  opts?: {
    readonly hasTime?: boolean;
  },
): string =>
  opts?.hasTime
    ? `${formatStatusCalendarDate(iso)}, ${formatStatusTime(iso)}`
    : formatStatusCalendarDate(iso);

export const formatStatusDuration = (duration: StatusDuration): string => {
  const total = Math.max(0, duration.total_minutes);
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  const minutes = total % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} дн.`);
  }

  if (hours > 0) {
    parts.push(`${hours} ч.`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} мин.`);
  }

  return parts.join(' ');
};

export const getStatusIncidentPeriod = (
  incident: Pick<
    StatusIncident,
    | 'is_active'
    | 'started_iso'
    | 'started_has_time'
    | 'ended_iso'
    | 'ended_has_time'
    | 'duration'
  >,
): StatusIncidentPeriod => {
  const start = {
    iso: incident.started_iso,
    text: formatStatusDate(incident.started_iso, {
      hasTime: incident.started_has_time,
    }),
  };
  const endedIso = incident.ended_iso;

  if (!endedIso) {
    return {
      prefix: incident.is_active ? 'Начиная с' : 'Начало',
      start,
    };
  }

  const hasSameDayDateRange =
    !incident.started_has_time &&
    !incident.ended_has_time &&
    isSameStatusDay(incident.started_iso, endedIso);

  if (hasSameDayDateRange) {
    return {
      start: {
        iso: incident.started_iso,
        text: formatStatusCalendarDate(incident.started_iso),
      },
    };
  }

  const hasSameDayTimeRange =
    incident.started_has_time &&
    incident.ended_has_time &&
    isSameStatusDay(incident.started_iso, endedIso);

  return {
    start: hasSameDayTimeRange
      ? {
          iso: incident.started_iso,
          text: `${formatStatusCalendarDate(incident.started_iso)}, ${formatStatusTime(incident.started_iso)}`,
        }
      : start,
    end: {
      iso: endedIso,
      text: hasSameDayTimeRange
        ? formatStatusTime(endedIso)
        : formatStatusDate(endedIso, { hasTime: incident.ended_has_time }),
    },
    ...(incident.duration
      ? { duration: formatStatusDuration(incident.duration) }
      : {}),
  };
};

export const formatStatusIncidentPeriodText = (
  incident: Pick<
    StatusIncident,
    | 'is_active'
    | 'started_iso'
    | 'started_has_time'
    | 'ended_iso'
    | 'ended_has_time'
    | 'duration'
  >,
): string => {
  const period = getStatusIncidentPeriod(incident);

  return [
    period.prefix ? `${period.prefix} ${period.start.text}` : period.start.text,
    period.end ? `- ${period.end.text}` : undefined,
    period.duration ? `(${period.duration})` : undefined,
  ]
    .filter((item) => item !== undefined)
    .join(' ');
};

export const formatStatusDaysWithoutIncidents = (
  value: StatusDaysWithoutIncidents,
): string => {
  switch (value.mode) {
    case 'active_incident':
      return 'идет инцидент';
    case 'no_incidents':
      return 'пока без инцидентов в истории';
    case 'count': {
      const days = value.days ?? 0;

      return `${days} ${pluralizeRu(days, ['день', 'дня', 'дней'])} без проблем`;
    }
  }
};

export const getStatusIncidentPhase = (
  incident: Pick<StatusIncident, 'kind' | 'is_active' | 'ended_iso'>,
): StatusIncidentPhase => {
  if (incident.is_active) {
    return {
      label: 'идет',
      tone: incident.kind === 'maintenance' ? 'warning' : 'danger',
    };
  }

  if (incident.ended_iso) {
    return {
      label: incident.kind === 'maintenance' ? 'завершено' : 'восстановлено',
      tone: incident.kind === 'maintenance' ? 'muted' : 'success',
    };
  }

  return {
    label: incident.kind === 'maintenance' ? 'запланировано' : 'ожидается',
    tone: incident.kind === 'maintenance' ? 'warning' : 'info',
  };
};

export const formatStatusArea = (area: StatusArea): string =>
  formatNewsArea(area);

export const deriveStatusIncidentTitle = (input: {
  readonly kind: StatusKind;
  readonly service: StatusService;
}): string =>
  input.kind === 'maintenance'
    ? MAINTENANCE_TITLE_LABELS[input.service]
    : INCIDENT_TITLE_LABELS[input.service];

export const formatStatusService = (service: StatusService): string =>
  SERVICE_LABELS[service];

export const formatStatusKind = (kind: StatusKind): string => KIND_LABELS[kind];

export const formatStatusServiceState = (state: StatusServiceState): string =>
  SERVICE_STATE_LABELS[state];
