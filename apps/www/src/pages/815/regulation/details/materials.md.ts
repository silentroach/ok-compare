import type { APIRoute } from 'astro';

import {
  ESTIMATE_DETAIL_MARKDOWN_HEADERS,
  buildEstimateDetailMaterialsMarkdown,
} from '@/lib/reglament/detail-markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildEstimateDetailMaterialsMarkdown(), {
    headers: ESTIMATE_DETAIL_MARKDOWN_HEADERS,
  });
