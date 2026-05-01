import type { APIRoute } from 'astro';

import { links, schema } from '@/lib/news/discovery';
import { canonRoot } from '@/lib/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const root = canonRoot();
  const body = `${JSON.stringify(schema(root), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
      Link: links(root),
    },
  });
};
