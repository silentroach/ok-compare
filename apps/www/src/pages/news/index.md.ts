import type { APIRoute } from 'astro';

import { loadNewsData } from '../../lib/news/load';
import {
  buildNewsHomeMarkdown,
  NEWS_MARKDOWN_HEADERS,
} from '../../lib/news/markdown';

export const prerender = true;

export const GET: APIRoute = async () => {
  const data = await loadNewsData();

  return new Response(buildNewsHomeMarkdown(data), {
    headers: NEWS_MARKDOWN_HEADERS,
  });
};
