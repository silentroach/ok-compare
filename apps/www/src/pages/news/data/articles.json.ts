import type { APIRoute } from 'astro';

import { buildNewsPayload, links } from '../../../lib/news/discovery';
import { loadNewsData } from '../../../lib/news/load';
import { canonRoot } from '../../../lib/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const root = canonRoot();
  const body = `${JSON.stringify(buildNewsPayload(await loadNewsData()), null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: links(root),
    },
  });
};
