import type { APIRoute } from 'astro';

import { loadNewsTags } from '@/lib/news/load';
import {
  buildNewsTagsMarkdown,
  NEWS_MARKDOWN_HEADERS,
} from '@/lib/news/markdown';

export const prerender = true;

export const GET: APIRoute = async () => {
  const tags = await loadNewsTags();

  return new Response(buildNewsTagsMarkdown(tags), {
    headers: NEWS_MARKDOWN_HEADERS,
  });
};
