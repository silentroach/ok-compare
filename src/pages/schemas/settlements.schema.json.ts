import type { APIRoute } from 'astro';

import { schema } from '../../lib/discovery';

export const prerender = true;

export const GET: APIRoute = async ({ request }) => {
  const root = import.meta.env.SITE ?? new URL(request.url).origin;
  const body = `${JSON.stringify(schema(root), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
    },
  });
};
