import type { APIRoute, GetStaticPaths } from 'astro';

import { loadMeetingByRouteId, loadMeetings } from '@/lib/meetings/load';
import {
  buildMeetingMarkdown,
  MEETING_MARKDOWN_HEADERS,
} from '@/lib/meetings/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const meetings = await loadMeetings();

  return meetings.map((meeting) => ({
    params: {
      date: meeting.date,
      slug: meeting.slug,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const date = params.date;
  const slug = params.slug;

  if (!date || !slug) {
    throw new Error('meeting markdown params are required');
  }

  const meeting = await loadMeetingByRouteId(`${date}/${slug}`);

  if (!meeting) {
    throw new Error(`meeting "${date}/${slug}" not found`);
  }

  return new Response(buildMeetingMarkdown(meeting), {
    headers: MEETING_MARKDOWN_HEADERS,
  });
};
