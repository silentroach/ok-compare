import type { APIRoute } from 'astro';

import { loadAllData } from '@/compare/lib/data';
import { toExplorerPayload } from '@/compare/lib/explorer';

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = toExplorerPayload(await loadAllData());

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
