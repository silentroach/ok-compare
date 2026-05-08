import type { APIRoute } from 'astro';

import {
  FULL_REGLAMENT_MARKDOWN_HEADERS,
  buildFullReglamentServiceMapMarkdown,
} from '@/lib/reglament/full-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildFullReglamentServiceMapMarkdown(), {
    headers: FULL_REGLAMENT_MARKDOWN_HEADERS,
  });
