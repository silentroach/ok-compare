import { count, dateTimeFromISO, pluralize } from '@shelkovo/format';
import {
  extractFirstMarkdownText,
  formatDynamicHtml,
} from '@shelkovo/markdown';

import { formatNewsArea } from '../news/view';
import type {
  StatusArea,
  StatusKind,
  StatusService,
  StatusServiceState,
} from './schema';
import type {
  StatusDaysWithoutIncidents,
  StatusDuration,
  StatusIncident,
} from './types';

const SERVICE_LABELS: Record<StatusService, string> = {
  electricity: 'Электричество',
  water: 'Вода',
  internet: 'Интернет',
  dam: 'Дамба',
};

const KIND_LABELS: Record<StatusKind, string> = {
  incident: 'Инцидент',
  maintenance: 'Плановые работы',
};

const INCIDENT_TITLE_LABELS: Record<StatusService, string> = {
  electricity: 'Нет электричества',
  water: 'Нет воды',
  internet: 'Нет интернета',
  dam: 'Проезд через дамбу закрыт',
};

const MAINTENANCE_TITLE_LABELS: Record<StatusService, string> = {
  electricity: 'Плановые работы: электричество',
  water: 'Плановые работы: вода',
  internet: 'Плановые работы: интернет',
  dam: 'Плановые работы: дамба',
};

const SERVICE_STATE_LABELS: Record<StatusServiceState, string> = {
  green: 'В норме',
  amber: 'Работы',
  red: 'Инцидент',
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

export interface StatusTimelineTooltipData {
  readonly serviceLabel: string;
  readonly kindLabel: string;
  readonly title: string;
  readonly phaseLabel: string;
  readonly periodLabel: string;
  readonly areaLabel?: string;
}

export interface StatusTimelineTooltipListItemData {
  readonly title: string;
  readonly periodLabel: string;
  readonly areas?: readonly StatusArea[];
  readonly areaLabel?: string;
  readonly phaseIcon?: 'alert' | 'check';
}

type StatusTimelineTooltipIncident = Pick<
  StatusIncident,
  | 'kind'
  | 'title'
  | 'isActive'
  | 'endedIso'
  | 'startedIso'
  | 'startedHasTime'
  | 'endedHasTime'
  | 'duration'
> & {
  readonly service?: StatusService;
  readonly areas?: readonly StatusArea[];
};

interface StatusTypographyOptions {
  readonly nonBreaking?: boolean;
}

interface StatusDateFormatOptions extends StatusTypographyOptions {
  readonly hasTime?: boolean;
}

const SPACE = /\s+/gu;
const NBSP = '\u00A0';
const CURRENT_STATUS_YEAR = dateTimeFromISO(new Date().toISOString()).year;

const formatStatusNbsp = (value: string): string => value.replaceAll(' ', NBSP);

const formatStatusTooltipText = (value: string): string =>
  formatDynamicHtml(value);

const joinStatusValueAndUnit = (
  value: number,
  unit: string,
  opts?: StatusTypographyOptions,
): string => `${value}${opts?.nonBreaking ? NBSP : ' '}${unit}`;

const formatStatusCalendarDate = (
  iso: string,
  opts?: StatusTypographyOptions,
): string => {
  const value = dateTimeFromISO(iso);
  const text = value.toFormat(
    value.year === CURRENT_STATUS_YEAR ? 'd MMMM' : 'd MMMM yyyy',
  );

  return opts?.nonBreaking ? formatStatusNbsp(text) : text;
};

const formatStatusTime = (iso: string): string =>
  dateTimeFromISO(iso).toFormat('HH:mm');

const isSameStatusDay = (startIso: string, endIso: string): boolean =>
  dateTimeFromISO(startIso).hasSame(dateTimeFromISO(endIso), 'day');

export const extractStatusExcerpt = (markdown: string): string | undefined => {
  const first = extractFirstMarkdownText(markdown);

  return first ? first.replace(SPACE, ' ') : undefined;
};

export const formatStatusDate = (
  iso: string,
  opts?: StatusDateFormatOptions,
): string => {
  const date = formatStatusCalendarDate(iso, opts);

  return opts?.hasTime ? `${date}, ${formatStatusTime(iso)}` : date;
};

export const formatStatusDuration = (
  duration: StatusDuration,
  opts?: StatusTypographyOptions,
): string => {
  const total = Math.max(0, duration.totalMinutes);
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  const minutes = total % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(joinStatusValueAndUnit(days, 'дн.', opts));
  }

  if (hours > 0) {
    parts.push(joinStatusValueAndUnit(hours, 'ч.', opts));
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(joinStatusValueAndUnit(minutes, 'мин.', opts));
  }

  return parts.join(' ');
};

export const getStatusIncidentPeriod = (
  incident: Pick<
    StatusIncident,
    | 'isActive'
    | 'startedIso'
    | 'startedHasTime'
    | 'endedIso'
    | 'endedHasTime'
    | 'duration'
  >,
  opts?: StatusTypographyOptions,
): StatusIncidentPeriod => {
  const start = {
    iso: incident.startedIso,
    text: formatStatusDate(incident.startedIso, {
      hasTime: incident.startedHasTime,
      nonBreaking: opts?.nonBreaking,
    }),
  };
  const endedIso = incident.endedIso;

  if (!endedIso) {
    return {
      prefix: incident.isActive ? 'Начиная с' : 'Начало',
      start,
    };
  }

  const hasSameDayDateRange =
    !incident.startedHasTime &&
    !incident.endedHasTime &&
    isSameStatusDay(incident.startedIso, endedIso);

  if (hasSameDayDateRange) {
    return {
      start: {
        iso: incident.startedIso,
        text: formatStatusCalendarDate(incident.startedIso, opts),
      },
    };
  }

  const hasSameDayTimeRange =
    incident.startedHasTime &&
    incident.endedHasTime &&
    isSameStatusDay(incident.startedIso, endedIso);

  return {
    start: hasSameDayTimeRange
      ? {
          iso: incident.startedIso,
          text: formatStatusDate(incident.startedIso, {
            hasTime: true,
            nonBreaking: opts?.nonBreaking,
          }),
        }
      : start,
    end: {
      iso: endedIso,
      text: hasSameDayTimeRange
        ? formatStatusTime(endedIso)
        : formatStatusDate(endedIso, {
            hasTime: incident.endedHasTime,
            nonBreaking: opts?.nonBreaking,
          }),
    },
    ...(incident.duration
      ? { duration: formatStatusDuration(incident.duration, opts) }
      : {}),
  };
};

export const formatStatusIncidentPeriodText = (
  incident: Pick<
    StatusIncident,
    | 'isActive'
    | 'startedIso'
    | 'startedHasTime'
    | 'endedIso'
    | 'endedHasTime'
    | 'duration'
  >,
  opts?: StatusTypographyOptions,
): string => {
  const period = getStatusIncidentPeriod(incident, opts);
  let text = period.prefix
    ? `${period.prefix}${opts?.nonBreaking ? NBSP : ' '}${period.start.text}`
    : period.start.text;

  if (period.end) {
    text += opts?.nonBreaking
      ? ` -${NBSP}${period.end.text}`
      : ` - ${period.end.text}`;
  }

  if (period.duration) {
    text += ` (${period.duration})`;
  }

  return text;
};

const formatStatusAreaList = (
  areas: readonly StatusArea[] | undefined,
): string | undefined =>
  areas && areas.length > 0
    ? areas
        .map((area) => formatStatusTooltipText(formatStatusArea(area)))
        .join(', ')
    : undefined;

export const buildStatusTimelineTooltipData = (input: {
  readonly service: StatusService;
  readonly incident: StatusTimelineTooltipIncident;
  readonly nonBreaking?: boolean;
}): StatusTimelineTooltipData => ({
  serviceLabel: formatStatusTooltipText(formatStatusService(input.service)),
  kindLabel: formatStatusTooltipText(formatStatusKind(input.incident.kind)),
  title: formatStatusTooltipText(input.incident.title),
  phaseLabel: formatStatusTooltipText(
    getStatusIncidentPhase({ ...input.incident, service: input.service }).label,
  ),
  periodLabel: formatStatusTooltipText(
    formatStatusIncidentPeriodText(input.incident, {
      nonBreaking: input.nonBreaking,
    }),
  ),
  ...(formatStatusAreaList(input.incident.areas)
    ? { areaLabel: formatStatusAreaList(input.incident.areas) }
    : {}),
});

export const formatStatusTimelineTooltipLabel = (
  tooltip: StatusTimelineTooltipData,
): string =>
  [
    tooltip.serviceLabel,
    tooltip.kindLabel,
    tooltip.title,
    formatStatusTooltipText(`Статус: ${tooltip.phaseLabel}`),
    tooltip.periodLabel,
    ...(tooltip.areaLabel
      ? [formatStatusTooltipText(`Части поселка: ${tooltip.areaLabel}`)]
      : []),
  ].join('. ');

export const buildStatusTimelineTooltipListItemData = (
  incident: StatusTimelineTooltipIncident,
  opts?: StatusTypographyOptions,
): StatusTimelineTooltipListItemData => ({
  title: formatStatusTooltipText(incident.title),
  periodLabel: formatStatusTooltipText(
    formatStatusIncidentPeriodText(incident, opts),
  ),
  ...(incident.areas?.length ? { areas: incident.areas } : {}),
  ...(formatStatusAreaList(incident.areas)
    ? { areaLabel: formatStatusAreaList(incident.areas) }
    : {}),
  ...(incident.kind !== 'incident'
    ? {}
    : incident.isActive
      ? { phaseIcon: 'alert' as const }
      : incident.endedIso
        ? { phaseIcon: 'check' as const }
        : {}),
});

export const formatStatusTimelineGroupTitle = (input: {
  readonly count: number;
  readonly startedIso: string;
  readonly nonBreaking?: boolean;
}): string => {
  const spacer = input.nonBreaking ? NBSP : ' ';

  return formatStatusTooltipText(
    `${input.count}${spacer}${pluralize(input.count, ['событие', 'события', 'событий'])} за${spacer}${formatStatusCalendarDate(input.startedIso, { nonBreaking: input.nonBreaking })}`,
  );
};

export const formatStatusTimelineTooltipGroupLabel = (input: {
  readonly serviceLabel: string;
  readonly title: string;
  readonly items: readonly StatusTimelineTooltipListItemData[];
}): string =>
  [
    input.serviceLabel,
    input.title,
    ...input.items.map((item) =>
      [
        item.title,
        item.periodLabel,
        ...(item.areaLabel
          ? [formatStatusTooltipText(`Части поселка: ${item.areaLabel}`)]
          : []),
      ].join('. '),
    ),
  ].join('. ');

export const formatStatusDaysWithoutIncidents = (
  value: StatusDaysWithoutIncidents,
): string => {
  switch (value.mode) {
    case 'activeIncident':
      return 'идет инцидент';
    case 'noIncidents':
      return 'пока без инцидентов в истории';
    case 'count': {
      const days = value.days ?? 0;

      return `${count(days, ['день', 'дня', 'дней'])} без проблем`;
    }
  }
};

export const getStatusIncidentPhase = (
  incident: Pick<
    StatusIncident,
    'kind' | 'isActive' | 'startedIso' | 'endedIso'
  > & {
    readonly service?: StatusService;
  },
  opts?: {
    readonly nowMs?: number;
  },
): StatusIncidentPhase => {
  if (incident.isActive) {
    return {
      label: 'идет',
      tone: incident.kind === 'maintenance' ? 'warning' : 'danger',
    };
  }

  if (Date.parse(incident.startedIso) > (opts?.nowMs ?? Date.now())) {
    return {
      label: incident.kind === 'maintenance' ? 'запланировано' : 'ожидается',
      tone: incident.kind === 'maintenance' ? 'warning' : 'info',
    };
  }

  if (incident.endedIso) {
    return {
      label:
        incident.kind === 'maintenance'
          ? 'завершено'
          : incident.service === 'dam'
            ? 'проезд открыт'
            : 'восстановлено',
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
