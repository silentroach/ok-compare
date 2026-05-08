import type { APIRoute } from 'astro';

import {
  FULL_REGLAMENT_MARKDOWN_HEADERS,
  buildFullReglamentMarkdown,
} from '@/lib/reglament/full-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildFullReglamentMarkdown(), {
    headers: FULL_REGLAMENT_MARKDOWN_HEADERS,
  });
