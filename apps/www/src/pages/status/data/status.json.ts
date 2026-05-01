import type { APIRoute } from 'astro';

import { canonRoot } from '@/lib/site';
import { buildStatusPayload, links } from '@/lib/status/discovery';
import { loadStatusData } from '@/lib/status/load';

export const prerender = true;

export const GET: APIRoute = async () => {
  const root = canonRoot();
  const body = `${JSON.stringify(buildStatusPayload(await loadStatusData()), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: links(root),
    },
  });
};
