import type { APIRoute } from 'astro';

import { loadReviewsData } from '@/lib/reviews/load';
import {
  buildReviewsHomeMarkdown,
  REVIEWS_MARKDOWN_HEADERS,
} from '@/lib/reviews/markdown';

export const prerender = true;

export const GET: APIRoute = async () => {
  const data = await loadReviewsData();

  return new Response(buildReviewsHomeMarkdown(data), {
    headers: REVIEWS_MARKDOWN_HEADERS,
  });
};
