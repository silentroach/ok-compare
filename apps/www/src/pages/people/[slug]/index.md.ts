import type { APIRoute, GetStaticPaths } from 'astro';

import { loadPeopleProfiles, loadPersonProfile } from '@/lib/people/load';
import {
  buildPersonMarkdown,
  PEOPLE_MARKDOWN_HEADERS,
} from '@/lib/people/view';

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

  const profile = await loadPersonProfile(slug);

  if (!profile) {
    throw new Error(`person profile "${slug}" not found`);
  }

  return new Response(buildPersonMarkdown(profile), {
    headers: PEOPLE_MARKDOWN_HEADERS,
  });
};
