import type { APIRoute } from 'astro';

import { loadMeetings } from '@/lib/meetings/load';
import {
  buildMeetingsIndexMarkdown,
  MEETINGS_MARKDOWN_HEADERS,
} from '@/lib/meetings/markdown';

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(buildMeetingsIndexMarkdown(await loadMeetings()), {
    headers: MEETINGS_MARKDOWN_HEADERS,
  });
