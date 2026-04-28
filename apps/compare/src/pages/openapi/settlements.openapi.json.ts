import type { APIRoute } from 'astro';

import { OAS, openapi } from '../../lib/discovery';
import { canonRoot } from '../../lib/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const root = canonRoot();
  const body = `${JSON.stringify(openapi(root), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': `${OAS}; charset=utf-8`,
    },
  });
};
