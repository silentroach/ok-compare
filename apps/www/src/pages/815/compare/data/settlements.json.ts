import type { APIRoute } from 'astro';

import { loadAllData } from '@/compare/lib/data';
import { links } from '@/compare/lib/discovery';
import { toFull, type FullPayload } from '@/compare/lib/full';
import { canonRoot } from '@/compare/lib/site';

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
