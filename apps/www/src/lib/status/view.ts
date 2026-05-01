import { dateTimeFromISO, formatDate, pluralizeRu } from '@shelkovo/format';

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

const SERVICE_STATE_LABELS: Record<StatusServiceState, string> = {
  green: 'В норме',
  amber: 'Плановые работы',
  red: 'Есть проблемы',
};

interface StatusIncidentPhase {
  readonly label: string;
  readonly tone: 'danger' | 'warning' | 'success' | 'muted' | 'info';
}

const SPACE = /\s+/gu;

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
    ? dateTimeFromISO(iso).toFormat('d MMMM yyyy, HH:mm')
    : formatDate(iso);

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

export const formatStatusService = (service: StatusService): string =>
  SERVICE_LABELS[service];

export const formatStatusKind = (kind: StatusKind): string => KIND_LABELS[kind];

export const formatStatusServiceState = (state: StatusServiceState): string =>
  SERVICE_STATE_LABELS[state];
