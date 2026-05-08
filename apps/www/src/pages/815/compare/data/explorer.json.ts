import type { APIRoute } from 'astro';

import { loadAllData } from '@/compare/lib/data';
import { toExplorer, type ExplorerPayload } from '@/compare/lib/explorer';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { settlements, stats, comparisons, ratings } = await loadAllData();
  const body: ExplorerPayload = {
    settlements: toExplorer(settlements, ratings),
    stats,
    comparisons: Object.fromEntries(comparisons),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
