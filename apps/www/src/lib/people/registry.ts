import type { CollectionEntry } from 'astro:content';

import { compareRuText } from '@shelkovo/format';

import { createSiteMentionRegistry } from '../mentions/normalize';
import type { SiteMentionRegistry } from '../mentions/types';
import { createMeetingMentionRegistry } from '../meetings/mentions';
import { mapRawPersonMentionTarget, mapRawPersonProfile } from './mapper';
import type { PeopleMentionRegistry } from './mentions';
import type { PeopleDataset, PersonProfile } from './types';

export type { PeopleDataset } from './types';

export type PersonProfileEntry = Pick<
  CollectionEntry<'peopleProfiles'>,
  'id' | 'data' | 'body'
>;
export type PersonMentionEntry = Pick<
  CollectionEntry<'peopleProfiles'>,
  'id' | 'data'
>;
export type MeetingMentionEntry = Pick<
  CollectionEntry<'meetings'>,
  'id' | 'data'
>;

let cache: Promise<PeopleDataset> | undefined;

export const createPeopleMentionRegistry = (
  entries: readonly PersonMentionEntry[],
): PeopleMentionRegistry => {
  const registry = new Map(
    entries.map((entry) => [entry.id, mapRawPersonMentionTarget(entry)]),
  );

  if (registry.size !== entries.length) {
    throw new Error('duplicate person profile slug in mention registry');
  }

  return registry;
};

const normalizePerson = (
  entry: PersonProfileEntry,
  registry: SiteMentionRegistry,
): PersonProfile => mapRawPersonProfile(entry, registry);

export const buildPeopleDataset = (
  entries: readonly PersonProfileEntry[],
  opts?: { readonly mentionRegistry?: SiteMentionRegistry },
): PeopleDataset => {
  const peopleMentionRegistry = createPeopleMentionRegistry(entries);
  const mentionRegistry = opts?.mentionRegistry ?? peopleMentionRegistry;
  const profiles = entries
    .map((entry) => normalizePerson(entry, mentionRegistry))
    .sort(
      (a, b) => compareRuText(a.name, b.name) || compareRuText(a.slug, b.slug),
    );

  return {
    profiles,
    bySlug: new Map(profiles.map((profile) => [profile.slug, profile])),
    mentionRegistry: peopleMentionRegistry,
  };
};

const buildPeopleData = async (): Promise<PeopleDataset> => {
  const { getCollection } = await import('astro:content');
  const [people, meetings] = await Promise.all([
    getCollection('peopleProfiles') as Promise<readonly PersonProfileEntry[]>,
    getCollection('meetings') as Promise<readonly MeetingMentionEntry[]>,
  ]);
  const mentionRegistry = createSiteMentionRegistry([
    ...createPeopleMentionRegistry(people).values(),
    ...createMeetingMentionRegistry(meetings).values(),
  ]);

  return buildPeopleDataset(people, { mentionRegistry });
};

export const loadPeopleData = (): Promise<PeopleDataset> => {
  cache ??= buildPeopleData();

  return cache;
};

export const loadPeopleMentionRegistry =
  async (): Promise<PeopleMentionRegistry> =>
    (await loadPeopleData()).mentionRegistry;
