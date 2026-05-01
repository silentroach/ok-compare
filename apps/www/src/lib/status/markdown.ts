import { absoluteUrl } from '../site';
import type {
  StatusDataset,
  StatusIncident,
  StatusServiceSummary,
} from './schema';
import { statusIncidentMarkdownUrl, statusServiceMarkdownUrl } from './routes';
import {
  formatStatusArea,
  formatStatusDaysWithoutIncidents,
  formatStatusIncidentPeriodText,
  formatStatusKind,
  formatStatusService,
  formatStatusServiceState,
  getStatusIncidentPhase,
} from './view';

export const STATUS_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const abs = (value: string): string => absoluteUrl(value);

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const pick = <T>(items: readonly (T | undefined)[]): readonly T[] =>
  items.filter((item): item is T => item !== undefined);

function row(label: string, value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return `- ${label}: ${value}`;
}

function section(title: string, rows: readonly string[]): readonly string[] {
  return [`## ${title}`, ...(rows.length > 0 ? rows : ['- Нет данных.']), ''];
}

const inline = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const incidentMarkdownHref = (
  incident: Pick<StatusIncident, 'year' | 'month' | 'slug'>,
): string => abs(statusIncidentMarkdownUrl(incident));

const areas = (
  incident: Pick<StatusIncident, 'applies_to_all_areas' | 'areas'>,
): string =>
  incident.applies_to_all_areas
    ? 'все части поселка'
    : incident.areas.map((area) => formatStatusArea(area)).join(', ');

function incidentLine(incident: StatusIncident): string {
  const meta = pick([
    formatStatusService(incident.service),
    formatStatusKind(incident.kind),
    getStatusIncidentPhase(incident).label,
    formatStatusIncidentPeriodText(incident),
  ]);
  const excerpt = incident.excerpt ? inline(incident.excerpt) : undefined;

  return `- [${incident.title}](${incidentMarkdownHref(incident)})${
    meta.length > 0 ? ` — ${meta.join('; ')}` : ''
  }${excerpt ? `\n  ${excerpt}` : ''}`;
}

function incidentSection(input: {
  readonly title: string;
  readonly items: readonly StatusIncident[];
  readonly empty: string;
  readonly intro?: string;
}): readonly string[] {
  const { title, items, empty, intro } = input;

  return [
    `## ${title}`,
    ...(intro ? [intro, ''] : []),
    ...(items.length > 0 ? items.map(incidentLine) : [`- ${empty}`]),
    '',
  ];
}

const serviceLine = (summary: StatusServiceSummary): string => {
  const latest = summary.incidents[0];
  const latestLabel = latest
    ? `[${latest.title}](${incidentMarkdownHref(latest)})`
    : 'пока без записей';

  return `- [${formatStatusService(summary.service)}](${abs(statusServiceMarkdownUrl(summary.service))}) — ${formatStatusServiceState(summary.service_status)}; ${formatStatusDaysWithoutIncidents(summary.days_without_incidents)}; последняя запись: ${latestLabel}`;
};

export function buildStatusHomeMarkdown(
  data: StatusDataset,
  opts?: {
    readonly now?: Date;
  },
): string {
  const now = opts?.now ?? new Date();
  const activeIncidents = data.active.filter(
    (item) => item.kind === 'incident',
  );
  const plannedWorks = data.incidents.filter(
    (item) =>
      item.kind === 'maintenance' &&
      (item.is_active || item.started_at.valueOf() > now.valueOf()),
  );

  return join([
    '# Статус поселка Шелково',
    '',
    'Текстовое представление статуса сервисов, активных инцидентов и истории поселка.',
    '',
    ...section('Сервисы', data.services.map(serviceLine)),
    ...incidentSection({
      title: 'Активные инциденты',
      items: activeIncidents,
      empty: 'Сейчас нет активных инцидентов.',
    }),
    ...incidentSection({
      title: 'Плановые работы',
      items: plannedWorks,
      empty: 'Сейчас нет активных или запланированных работ.',
    }),
    ...incidentSection({
      title: 'История',
      items: data.incidents,
      empty: 'История пока пуста.',
    }),
  ]);
}

export function buildStatusServiceMarkdown(
  summary: StatusServiceSummary,
  opts?: {
    readonly now?: Date;
  },
): string {
  const now = opts?.now ?? new Date();
  const latest = summary.incidents[0];
  const plannedWorks = summary.incidents.filter(
    (item) =>
      item.kind === 'maintenance' &&
      (item.is_active || item.started_at.valueOf() > now.valueOf()),
  );
  const serviceLabel = formatStatusService(summary.service);

  return join([
    `# ${serviceLabel} — статус Шелково`,
    '',
    ...section(
      'Сводка',
      pick([
        row('Сервис', serviceLabel),
        row('Текущий статус', formatStatusServiceState(summary.service_status)),
        row(
          'Без инцидентов',
          formatStatusDaysWithoutIncidents(summary.days_without_incidents),
        ),
        row(
          'Последняя запись',
          latest
            ? `[${latest.title}](${incidentMarkdownHref(latest)})`
            : 'нет записей',
        ),
      ]),
    ),
    ...incidentSection({
      title: 'Активные инциденты',
      items: summary.active_incidents,
      empty: 'Сейчас нет активных инцидентов по этому сервису.',
    }),
    ...incidentSection({
      title: 'Плановые работы',
      items: plannedWorks,
      empty: 'Сейчас нет активных или запланированных работ по этому сервису.',
    }),
    ...incidentSection({
      title: 'История',
      items: summary.incidents.slice(0, 10),
      empty: 'Пока без записей по этому сервису.',
      intro:
        summary.incidents.length > 10
          ? 'В markdown companion показаны 10 последних записей сервиса.'
          : undefined,
    }),
  ]);
}

export function buildStatusIncidentMarkdown(incident: StatusIncident): string {
  return join([
    `# ${incident.title}`,
    '',
    ...section(
      'Метаданные',
      pick([
        row('Сервис', formatStatusService(incident.service)),
        row('Тип', formatStatusKind(incident.kind)),
        row('Статус', getStatusIncidentPhase(incident).label),
        row('Период', formatStatusIncidentPeriodText(incident)),
        row('Затронутые участки', areas(incident)),
        row(
          'Источник',
          incident.source_url ? abs(incident.source_url) : undefined,
        ),
      ]),
    ),
    ...(incident.body ? ['## Описание', '', incident.body.trim(), ''] : []),
  ]);
}
