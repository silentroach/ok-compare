import type { CollectionEntry } from 'astro:content';

import {
  createPersonMentionTarget,
  normalizePeopleMentions,
  type PeopleMentionRegistry,
} from './mentions';
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
  readonly mention_registry: PeopleMentionRegistry;
}

let cache: Promise<PeopleDataset> | undefined;

const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');

const content = (
  value: string | undefined,
  registry: PeopleMentionRegistry,
  context: string,
): string => {
  const body = value?.trimEnd() ?? '';

  return body.trim().length > 0
    ? normalizePeopleMentions({
        markdown: body,
        context,
        registry,
      }).markdown
    : '';
};

const personRegistry = (
  entries: readonly PersonProfileEntry[],
): PeopleMentionRegistry => {
  const registry = new Map(
    entries.map((entry) => [
      entry.id,
      createPersonMentionTarget(entry.id, entry.data.name),
    ]),
  );

  if (registry.size !== entries.length) {
    throw new Error('duplicate person profile slug in mention registry');
  }

  return registry;
};

const normalizePerson = (
  entry: PersonProfileEntry,
  registry: PeopleMentionRegistry,
): PersonProfile => ({
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
  body: content(entry.body, registry, `people profile "${entry.id}" body`),
});

export const buildPeopleDataset = (
  entries: readonly PersonProfileEntry[],
): PeopleDataset => {
  const mention_registry = personRegistry(entries);
  const profiles = entries
    .map((entry) => normalizePerson(entry, mention_registry))
    .sort((a, b) => byText(a.name, b.name) || byText(a.slug, b.slug));

  return {
    profiles,
    by_slug: new Map(profiles.map((profile) => [profile.slug, profile])),
    mention_registry,
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

export const loadPeopleMentionRegistry =
  async (): Promise<PeopleMentionRegistry> =>
    (await loadPeopleData()).mention_registry;

export const loadPersonProfile = async (
  slug: string,
): Promise<PersonProfile | undefined> => {
  const key = slug.trim();

  return key ? (await loadPeopleData()).by_slug.get(key) : undefined;
};
