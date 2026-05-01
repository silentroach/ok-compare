import type { APIRoute, GetStaticPaths } from 'astro';
import { padNumber } from '@shelkovo/format';

import {
  buildStatusIncidentMarkdown,
  STATUS_MARKDOWN_HEADERS,
} from '@/lib/status/markdown';
import { loadStatusIncident, loadStatusIncidents } from '@/lib/status/load';

export const prerender = true;

export const getStaticPaths = (async () => {
  const incidents = await loadStatusIncidents();

  return incidents.map((item) => ({
    params: {
      year: String(item.year),
      month: padNumber(item.month),
      entry: item.slug,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const year = params.year;
  const month = params.month;
  const entry = params.entry;

  if (!year || !month || !entry) {
    throw new Error('status incident params are required');
  }

  const incident = await loadStatusIncident(`${year}/${month}/${entry}`);

  if (!incident) {
    throw new Error(`status incident "${year}/${month}/${entry}" not found`);
  }

  return new Response(buildStatusIncidentMarkdown(incident), {
    headers: STATUS_MARKDOWN_HEADERS,
  });
};
