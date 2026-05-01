import type { APIRoute } from 'astro';

import { loadStatusData } from '@/lib/status/load';
import {
  buildStatusHomeMarkdown,
  STATUS_MARKDOWN_HEADERS,
} from '@/lib/status/markdown';

export const prerender = true;

export const GET: APIRoute = async () => {
  const data = await loadStatusData();

  return new Response(buildStatusHomeMarkdown(data), {
    headers: STATUS_MARKDOWN_HEADERS,
  });
};
