import type { APIRoute, GetStaticPaths } from 'astro';

import { loadContact, loadContacts } from '@/lib/contacts/load';
import {
  buildContactMarkdown,
  CONTACTS_MARKDOWN_HEADERS,
} from '@/lib/contacts/markdown';

export const prerender = true;

export const getStaticPaths = (async () => {
  const contacts = await loadContacts();

  return contacts.map((contact) => ({ params: { slug: contact.slug } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;

  if (!slug) {
    throw new Error('contact slug is required');
  }

  const contact = await loadContact(slug);

  if (!contact) {
    throw new Error(`contact "${slug}" not found`);
  }

  return new Response(buildContactMarkdown(contact), {
    headers: CONTACTS_MARKDOWN_HEADERS,
  });
};
