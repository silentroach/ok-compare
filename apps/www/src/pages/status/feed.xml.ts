import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { loadStatusData } from '../../lib/status/load';
import type { StatusIncident } from '../../lib/status/schema';
import {
  formatStatusArea,
  formatStatusIncidentPeriodText,
  formatStatusKind,
  formatStatusService,
  getStatusIncidentPhase,
} from '../../lib/status/view';

export const prerender = true;

const impact = (item: StatusIncident): string =>
  item.applies_to_all_areas
    ? 'весь поселок'
    : item.areas.map(formatStatusArea).join(', ');

const description = (item: StatusIncident): string =>
  [
    `${formatStatusKind(item.kind)} по сервису ${formatStatusService(item.service)}.`,
    `Статус: ${getStatusIncidentPhase(item).label}.`,
    `Период: ${formatStatusIncidentPeriodText(item)}.`,
    `Затронуто: ${impact(item)}.`,
    item.excerpt,
  ]
    .filter((part) => Boolean(part))
    .join(' ');

const categories = (item: StatusIncident): string[] => [
  formatStatusService(item.service),
  formatStatusKind(item.kind),
  ...(item.applies_to_all_areas ? [] : item.areas.map(formatStatusArea)),
];

export const GET: APIRoute = async (context) => {
  const data = await loadStatusData();

  return rss({
    title: 'Статус Шелково',
    description:
      'Статическая RSS-лента статуса Шелково: summary-first RSS, полный machine-readable контракт живет в /status/data/status.json.',
    site: context.site ?? 'https://kpshelkovo.online',
    items: data.incidents.map((item) => ({
      title: item.title,
      description: description(item),
      ...(item.has_page ? { link: item.url } : {}),
      pubDate: item.ended_at ?? item.started_at,
      categories: categories(item),
    })),
    customData: '<language>ru-RU</language>',
  });
};
