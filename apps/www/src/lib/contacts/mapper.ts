import {
  preprocessSiteMarkdownContent,
  type PreprocessedSiteMarkdown,
} from '@/lib/markdown/render';
import type { SiteMentionRegistry } from '@/lib/mentions';

import type { ContactEntry } from './load';
import { contactCanonical, contactMarkdownUrl, contactUrl } from './routes';
import type { Contact, ContactContacts } from './types';

const requireBody = (entry: ContactEntry): string => {
  const body = entry.body?.trim() ?? '';

  if (!body) {
    throw new Error(`contact "${entry.id}" body is required`);
  }

  return body;
};

const preprocessContactContent = (
  markdown: string,
  context: string,
  mentionRegistry?: SiteMentionRegistry,
): PreprocessedSiteMarkdown => {
  if (mentionRegistry) {
    return preprocessSiteMarkdownContent(markdown, context, mentionRegistry);
  }

  const body = markdown.trimEnd();

  return {
    markdown: body.trim() ? body : '',
    mentions: [],
  };
};

const mapContacts = (
  contacts: ContactEntry['data']['contacts'],
): ContactContacts => ({
  phone: contacts.phone,
  telegram: contacts.telegram,
  whatsapp: contacts.whatsapp,
  email: contacts.email,
  website: contacts.website,
  address: contacts.address,
});

export const mapRawContact = (
  entry: ContactEntry,
  mentionRegistry?: SiteMentionRegistry,
): Contact => {
  if (entry.id !== entry.data.slug) {
    throw new Error(
      `contact "${entry.id}" id must equal slug "${entry.data.slug}"`,
    );
  }

  const body = preprocessContactContent(
    requireBody(entry),
    `contact "${entry.id}" body`,
    mentionRegistry,
  );
  const slug = entry.data.slug;

  return {
    slug,
    title: entry.data.title,
    category: entry.data.category,
    updatedAt: new Date(`${entry.data.updated_at}T00:00:00.000Z`),
    updatedIso: entry.data.updated_at,
    contacts: mapContacts(entry.data.contacts),
    seo: entry.data.seo,
    url: contactUrl({ slug }),
    markdownUrl: contactMarkdownUrl({ slug }),
    canonical: contactCanonical({ slug }),
    body: body.markdown,
    mentions: body.mentions,
  };
};
