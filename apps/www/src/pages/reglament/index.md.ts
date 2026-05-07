import type { APIRoute } from 'astro';

import { estimate2026 } from '@/data/reglament/estimate-2026';
import {
  REGLAMENT_MARKDOWN_HEADERS,
  buildReglamentMarkdown,
} from '@/lib/reglament/markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildReglamentMarkdown(estimate2026), {
    headers: REGLAMENT_MARKDOWN_HEADERS,
  });
