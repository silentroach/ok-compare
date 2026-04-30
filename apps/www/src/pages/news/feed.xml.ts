import type { APIRoute } from 'astro';

import { buildNewsRss } from '../../lib/news/discovery';
import { loadNewsData } from '../../lib/news/load';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildNewsRss(await loadNewsData()), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
