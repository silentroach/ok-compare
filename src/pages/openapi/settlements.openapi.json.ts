import type { APIRoute } from 'astro';

import { OAS, openapi } from '../../lib/discovery';

export const prerender = true;

export const GET: APIRoute = async ({ request }) => {
  const root = import.meta.env.SITE ?? new URL(request.url).origin;
  const body = `${JSON.stringify(openapi(root), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': `${OAS}; charset=utf-8`,
    },
  });
};
