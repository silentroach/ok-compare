import { canon, withBase } from '@/lib/site';

import { isContactSlug } from './schema';

const CONTACTS_ROOT = '/contacts/';
const CONTACTS_MARKDOWN = '/contacts/index.md';

const contactSlug = (value: string): string => {
  const slug = value.trim();

  if (!slug) {
    throw new Error('contact slug is required');
  }

  if (!isContactSlug(slug)) {
    throw new Error(`contact slug "${value}" is invalid`);
  }

  return slug;
};

export const contactsPath = (): string => CONTACTS_ROOT;
export const contactsMarkdownPath = (): string => CONTACTS_MARKDOWN;

export const contactPath = (input: { readonly slug: string }): string =>
  `${CONTACTS_ROOT}${contactSlug(input.slug)}/`;

export const contactPattern = (): string => '/contacts/:slug/';
export const contactMarkdownPattern = (): string => '/contacts/:slug/index.md';

export const contactsUrl = (): string => withBase(contactsPath());
export const contactsMarkdownUrl = (): string =>
  withBase(contactsMarkdownPath());

export const contactUrl = (input: { readonly slug: string }): string =>
  withBase(contactPath(input));

export const contactMarkdownUrl = (input: { readonly slug: string }): string =>
  withBase(`${contactPath(input)}index.md`);

export const contactCanonical = (input: { readonly slug: string }): string =>
  canon(contactPath(input));
