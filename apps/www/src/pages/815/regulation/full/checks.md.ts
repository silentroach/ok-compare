import type { APIRoute } from 'astro';

import {
  FULL_REGLAMENT_MARKDOWN_HEADERS,
  buildFullReglamentChecksMarkdown,
} from '@/lib/reglament/full-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildFullReglamentChecksMarkdown(), {
    headers: FULL_REGLAMENT_MARKDOWN_HEADERS,
  });
