import type { APIRoute, GetStaticPaths } from 'astro';

import {
  PEOPLE_MARKDOWN_HEADERS,
  buildPersonMarkdown,
} from '@/lib/people/markdown';
import {
  loadPeopleProfiles,
  loadPersonProfileWithBacklinks,
} from '@/lib/people/load';

export const prerender = true;

export const getStaticPaths = (async () => {
  const profiles = await loadPeopleProfiles();

  return profiles.map((profile) => ({
    params: {
      slug: profile.slug,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;

  if (!slug) {
    throw new Error('person slug is required');
  }

  const profile = await loadPersonProfileWithBacklinks(slug);

  if (!profile) {
    throw new Error(`person profile "${slug}" not found`);
  }

  return new Response(buildPersonMarkdown(profile), {
    headers: PEOPLE_MARKDOWN_HEADERS,
  });
};
