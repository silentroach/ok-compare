import type { APIRoute } from 'astro';

import {
  FULL_REGLAMENT_MARKDOWN_HEADERS,
  buildFullReglamentServicesMarkdown,
} from '@/lib/reglament/full-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildFullReglamentServicesMarkdown(), {
    headers: FULL_REGLAMENT_MARKDOWN_HEADERS,
  });
