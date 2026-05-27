import type { APIRoute } from 'astro';

import { loadMeetingsData } from '@/lib/meetings/load';
import { toMeetingsPublicPayload } from '@/lib/meetings/public-dto';

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = `${JSON.stringify(
    toMeetingsPublicPayload(await loadMeetingsData()),
    null,
    2,
  )}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
