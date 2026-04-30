import type { APIRoute, GetStaticPaths } from 'astro';

import { loadNewsTag, loadNewsTags } from '../../../../lib/news/load';
import {
  buildNewsTagMarkdown,
  NEWS_MARKDOWN_HEADERS,
} from '../../../../lib/news/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const tags = await loadNewsTags();

  return tags.map((item) => ({
    params: { tag: item.key },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const key = params.tag;

  if (!key) {
    throw new Error('news tag key is required');
  }

  const tag = await loadNewsTag(key);

  if (!tag) {
    throw new Error(`news tag page "${key}" not found`);
  }

  return new Response(buildNewsTagMarkdown(tag), {
    headers: NEWS_MARKDOWN_HEADERS,
  });
};
