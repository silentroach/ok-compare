import type { CollectionEntry } from 'astro:content';

import { personCanonical, personMarkdownUrl, personUrl } from './routes';
import type { PersonProfile } from './schema';
import { normalizePersonContact } from './view';

export type PersonProfileEntry = Pick<
  CollectionEntry<'peopleProfiles'>,
  'id' | 'data' | 'body'
>;
type PersonContactInput = PersonProfileEntry['data']['contacts'][number];

export interface PeopleDataset {
  readonly profiles: readonly PersonProfile[];
  readonly by_slug: ReadonlyMap<string, PersonProfile>;
}

let cache: Promise<PeopleDataset> | undefined;

const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');

const content = (value: string | undefined): string => {
  const body = value?.trimEnd() ?? '';

  return body.trim().length > 0 ? body : '';
};

const normalizePerson = (entry: PersonProfileEntry): PersonProfile => ({
  id: entry.id,
  slug: entry.id,
  name: entry.data.name,
  url: personUrl(entry.id),
  markdown_url: personMarkdownUrl(entry.id),
  canonical: personCanonical(entry.id),
  contacts: entry.data.contacts.map(
    (contact: PersonContactInput, index: number) =>
      normalizePersonContact(
        contact,
        `people profile "${entry.id}" contact #${index + 1}`,
      ),
  ),
  body: content(entry.body),
});

export const buildPeopleDataset = (
  entries: readonly PersonProfileEntry[],
): PeopleDataset => {
  const profiles = entries
    .map((entry) => normalizePerson(entry))
    .sort((a, b) => byText(a.name, b.name) || byText(a.slug, b.slug));

  return {
    profiles,
    by_slug: new Map(profiles.map((profile) => [profile.slug, profile])),
  };
};

export const loadPeopleData = (): Promise<PeopleDataset> => {
  cache ??= import('astro:content').then(({ getCollection }) =>
    getCollection('peopleProfiles').then(
      (entries: readonly PersonProfileEntry[]) => buildPeopleDataset(entries),
    ),
  );

  return cache;
};

export const loadPeopleProfiles = async (): Promise<readonly PersonProfile[]> =>
  (await loadPeopleData()).profiles;

export const loadPersonProfile = async (
  slug: string,
): Promise<PersonProfile | undefined> => {
  const key = slug.trim();

  return key ? (await loadPeopleData()).by_slug.get(key) : undefined;
};
