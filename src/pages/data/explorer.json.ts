import type { APIRoute } from 'astro';
import { loadAllData } from '../../lib/data';
import { toExplorer, type ExplorerPayload } from '../../lib/explorer';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { settlements, stats, comparisons } = await loadAllData();
  const body: ExplorerPayload = {
    settlements: toExplorer(settlements),
    stats,
    comparisons: Object.fromEntries(comparisons),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
