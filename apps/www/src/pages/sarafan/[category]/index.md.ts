import type { APIRoute, GetStaticPaths } from 'astro';

import {
  loadContactCategories,
  loadContactCategory,
} from '@/lib/contacts/load';
import {
  buildContactsCategoryMarkdown,
  CONTACTS_MARKDOWN_HEADERS,
} from '@/lib/contacts/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const categories = await loadContactCategories();

  return categories.map((category) => ({
    params: { category: category.category },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const key = params.category;

  if (!key) {
    throw new Error('contact category is required');
  }

  const category = await loadContactCategory(key);

  if (!category) {
    throw new Error(`contact category "${key}" not found`);
  }

  return new Response(buildContactsCategoryMarkdown(category), {
    headers: CONTACTS_MARKDOWN_HEADERS,
  });
};
