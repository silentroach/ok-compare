import type { APIRoute } from 'astro';

import { loadAllData } from '../../lib/data';
import { links } from '../../lib/discovery';
import { toFull, type FullPayload } from '../../lib/full';
import { canonRoot } from '../../lib/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { settlements, stats, comparisons, ratings } = await loadAllData();
  const root = canonRoot();
  const body: FullPayload = {
    settlements: toFull(settlements, ratings),
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
