import type { APIRoute } from 'astro';
import { loadAllData } from '../../lib/data';

export const prerender = true;

export const GET: APIRoute = async () => {
  const { settlements, stats, comparisons } = await loadAllData();

  return new Response(
    JSON.stringify({
      settlements,
      stats,
      comparisons: Object.fromEntries(comparisons),
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
};
