import type { APIRoute, GetStaticPaths } from 'astro';

import { loadMeeting, loadMeetings } from '@/lib/meetings/load';
import {
  buildMeetingTranscriptPartMarkdown,
  MEETINGS_MARKDOWN_HEADERS,
} from '@/lib/meetings/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const meetings = await loadMeetings();

  return meetings.flatMap((meeting) =>
    meeting.transcript.parts.map((part) => ({
      params: {
        slug: meeting.slug,
        part: String(part.index),
      },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  const partParam = params.part;

  if (!slug || !partParam) {
    throw new Error('meeting transcript params are required');
  }

  const partIndex = Number(partParam);
  const meeting = await loadMeeting(slug);
  const part = Number.isInteger(partIndex)
    ? meeting?.transcript.parts.find((item) => item.index === partIndex)
    : undefined;

  if (!meeting || !part) {
    throw new Error(`meeting transcript "${slug}/${partParam}" not found`);
  }

  return new Response(buildMeetingTranscriptPartMarkdown(meeting, part), {
    headers: MEETINGS_MARKDOWN_HEADERS,
  });
};
