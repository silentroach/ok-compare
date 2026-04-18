import type { APIRoute } from 'astro';

import { loadAllData } from '../../lib/data';
import { links } from '../../lib/discovery';
import { toExplorer, type ExplorerPayload } from '../../lib/explorer';

export const prerender = true;

export const GET: APIRoute = async ({ request }) => {
  const { settlements, stats, comparisons, ratings } = await loadAllData();
  const root = import.meta.env.SITE ?? new URL(request.url).origin;
  const body: ExplorerPayload = {
    settlements: toExplorer(settlements, ratings),
    stats,
    comparisons: Object.fromEntries(comparisons),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: links(root),
    },
  });
};
