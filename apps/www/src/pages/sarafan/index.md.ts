import type { APIRoute } from 'astro';

import { loadContactsData } from '@/lib/contacts/load';
import {
  buildContactsHomeMarkdown,
  CONTACTS_MARKDOWN_HEADERS,
} from '@/lib/contacts/markdown';

export const prerender = true;

export const GET: APIRoute = async () => {
  const data = await loadContactsData();

  return new Response(buildContactsHomeMarkdown(data), {
    headers: CONTACTS_MARKDOWN_HEADERS,
  });
};
