import type { APIRoute } from 'astro';

import { buildHomeMd } from '@lib/markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(await buildHomeMd(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
