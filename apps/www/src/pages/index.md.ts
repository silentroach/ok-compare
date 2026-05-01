import type { APIRoute } from 'astro';

import { buildHomeMarkdown, SITE_MARKDOWN_HEADERS } from '@/lib/llms';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(await buildHomeMarkdown(), {
    headers: SITE_MARKDOWN_HEADERS,
  });
