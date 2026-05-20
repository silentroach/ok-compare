import type { CollectionEntry } from 'astro:content';

import { compareRuText } from '@shelkovo/format';

import { preprocessSiteMarkdownContent } from '../markdown/render';
import type { SiteMentionRegistry } from '../mentions';
import {
  createPersonMentionTarget,
  type PeopleMentionRegistry,
} from './mentions';
import { personCanonical, personMarkdownUrl, personUrl } from './routes';
import { EMPTY_PERSON_BACKLINKS, type PersonProfile } from './schema';
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

const personRegistry = (
  entries: readonly PersonProfileEntry[],
): PeopleMentionRegistry => {
  const registry = new Map(
    entries.map((entry) => [
      entry.id,
      createPersonMentionTarget(
        entry.id,
        entry.data.name,
        entry.data.name_cases,
        entry.data.company,
        entry.data.position,
      ),
    ]),
  );

  if (registry.size !== entries.length) {
    throw new Error('duplicate person profile slug in mention registry');
  }

  return registry;
};

const normalizePerson = (
  entry: PersonProfileEntry,
  registry: SiteMentionRegistry,
): PersonProfile => {
  const body = preprocessSiteMarkdownContent(
    entry.body ?? '',
    `people profile "${entry.id}" body`,
    registry,
    { type: 'person', slug: entry.id },
  );

  return {
    id: entry.id,
    slug: entry.id,
    name: entry.data.name,
    ...(entry.data.name_cases ? { name_cases: entry.data.name_cases } : {}),
    ...(entry.data.company ? { company: entry.data.company } : {}),
    ...(entry.data.position ? { position: entry.data.position } : {}),
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
    body: body.markdown,
    mentions: body.mentions,
    backlinks: EMPTY_PERSON_BACKLINKS,
  };
};

export const buildPeopleDataset = (
  entries: readonly PersonProfileEntry[],
): PeopleDataset => {
  const mention_registry = personRegistry(entries);
  const profiles = entries
    .map((entry) => normalizePerson(entry, mention_registry))
    .sort(
      (a, b) => compareRuText(a.name, b.name) || compareRuText(a.slug, b.slug),
    );

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

export const loadPeopleMentionRegistry =
  async (): Promise<PeopleMentionRegistry> =>
    (await loadPeopleData()).mention_registry;
