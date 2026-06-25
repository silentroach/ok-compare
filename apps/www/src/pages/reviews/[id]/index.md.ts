import type { APIRoute, GetStaticPaths } from 'astro';

import { loadReview, loadReviews } from '@/lib/reviews/load';
import {
  buildReviewMarkdown,
  REVIEWS_MARKDOWN_HEADERS,
} from '@/lib/reviews/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const reviews = await loadReviews();

  return reviews.map((review) => ({ params: { id: review.id } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;

  if (!id) {
    throw new Error('review id is required');
  }

  const review = await loadReview(id);

  if (!review) {
    throw new Error(`review "${id}" not found`);
  }

  return new Response(buildReviewMarkdown(review), {
    headers: REVIEWS_MARKDOWN_HEADERS,
  });
};
