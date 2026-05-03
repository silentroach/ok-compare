import type { APIRoute } from 'astro';

import {
  PEOPLE_MARKDOWN_HEADERS,
  buildPeopleHomeMarkdown,
} from '@/lib/people/markdown';
import { loadPeopleProfilesWithBacklinks } from '@/lib/people/load';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(
    buildPeopleHomeMarkdown(await loadPeopleProfilesWithBacklinks()),
    {
      headers: PEOPLE_MARKDOWN_HEADERS,
    },
  );
