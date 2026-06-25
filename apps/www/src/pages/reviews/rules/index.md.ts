import type { APIRoute } from 'astro';

import {
  buildReviewsRulesMarkdown,
  REVIEWS_MARKDOWN_HEADERS,
} from '@/lib/reviews/markdown';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(buildReviewsRulesMarkdown(), {
    headers: REVIEWS_MARKDOWN_HEADERS,
  });
