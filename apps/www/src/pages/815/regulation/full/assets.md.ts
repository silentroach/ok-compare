import type { APIRoute } from 'astro';

import {
  FULL_REGLAMENT_MARKDOWN_HEADERS,
  buildFullReglamentAssetsMarkdown,
} from '@/lib/reglament/full-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildFullReglamentAssetsMarkdown(), {
    headers: FULL_REGLAMENT_MARKDOWN_HEADERS,
  });
