import { getCollection, type CollectionEntry } from 'astro:content';
import { compareRuText } from '@shelkovo/format';

import type { SiteMentionRegistry } from '@/lib/mentions';
import { loadPeopleMentionRegistry } from '@/lib/people/registry';

import { mapRawContact } from './mapper';
import type { RawContact } from './raw-schema';
import type { Contact, ContactsDataset } from './types';
import { formatContactCategory } from './view';

export type ContactEntry = Pick<CollectionEntry<'contacts'>, 'id' | 'body'> & {
  readonly data: RawContact;
};

let cache: Promise<ContactsDataset> | undefined;

const compareContacts = (a: Contact, b: Contact): number =>
  compareRuText(
    formatContactCategory(a.category),
    formatContactCategory(b.category),
  ) ||
  compareRuText(a.title, b.title) ||
  compareRuText(a.slug, b.slug);

const validateUniqueSlugs = (contacts: readonly Contact[]): void => {
  const seen = new Set<string>();

  for (const contact of contacts) {
    if (seen.has(contact.slug)) {
      throw new Error(`duplicate contact slug "${contact.slug}"`);
    }

    seen.add(contact.slug);
  }
};

export const buildContactsDataset = (
  entries: readonly ContactEntry[],
  opts?: {
    readonly mentionRegistry?: SiteMentionRegistry;
  },
): ContactsDataset => {
  const mentionRegistry = opts?.mentionRegistry;
  const contacts = entries
    .map((entry) => mapRawContact(entry, mentionRegistry))
    .sort(compareContacts);

  validateUniqueSlugs(contacts);

  return {
    contacts,
    bySlug: new Map(
      contacts.map((contact) => [contact.slug, contact] as const),
    ),
  };
};

const buildContactsData = async (): Promise<ContactsDataset> =>
  buildContactsDataset(await getCollection('contacts'), {
    mentionRegistry: await loadPeopleMentionRegistry(),
  });

export const loadContactsData = (): Promise<ContactsDataset> => {
  cache ??= buildContactsData();

  return cache;
};

export const loadContacts = async (): Promise<readonly Contact[]> =>
  (await loadContactsData()).contacts;

export const loadContact = async (
  slug: string,
): Promise<Contact | undefined> => {
  const key = slug.trim();

  return key ? (await loadContactsData()).bySlug.get(key) : undefined;
};
