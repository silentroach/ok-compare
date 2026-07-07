import {
  preprocessSiteMarkdownContent,
  type PreprocessedSiteMarkdown,
} from '@/lib/markdown/render';
import type { SiteMentionRegistry } from '@/lib/mentions';

import type { ContactEntry } from './load';
import { contactCanonical, contactMarkdownUrl, contactUrl } from './routes';
import type { Contact, ContactContacts, ContactLocation } from './types';

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
});

const mapLocation = (
  location: ContactEntry['data']['location'],
): ContactLocation | undefined =>
  location
    ? {
        title: location.title,
        url: location.url,
        address: location.address,
      }
    : undefined;

export const mapRawContact = (
  entry: ContactEntry,
  mentionRegistry?: SiteMentionRegistry,
): Contact => {
  const slug = entry.data.slug;
  const category = entry.data.category;
  const expectedId = `${category}/${slug}`;

  if (entry.id !== expectedId) {
    throw new Error(
      `contact "${entry.id}" id must equal category and slug "${expectedId}"`,
    );
  }

  const body = preprocessContactContent(
    entry.body?.trim() ?? '',
    `contact "${entry.id}" body`,
    mentionRegistry,
  );
  const contact = {
    slug,
    title: entry.data.title,
    category,
    updatedAt: new Date(`${entry.data.updated_at}T00:00:00.000Z`),
    updatedIso: entry.data.updated_at,
    summary: entry.data.summary,
    contacts: mapContacts(entry.data.contacts),
    location: mapLocation(entry.data.location),
    seo: entry.data.seo,
    body: body.markdown,
    mentions: body.mentions,
  };

  if (!body.markdown.trim()) {
    return {
      ...contact,
      hasDetailPage: false,
    };
  }

  return {
    ...contact,
    hasDetailPage: true,
    url: contactUrl({ category, slug }),
    markdownUrl: contactMarkdownUrl({ category, slug }),
    canonical: contactCanonical({ category, slug }),
  };
};
