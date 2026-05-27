import type { CollectionEntry } from 'astro:content';

import { createMeetingMentionRegistry } from '../meetings/mentions';
import { createPeopleMentionRegistry } from '../people/registry';
import { createSiteMentionRegistry } from './normalize';
import type { SiteMentionRegistry } from './types';

type PersonProfileEntry = Pick<
  CollectionEntry<'peopleProfiles'>,
  'id' | 'data'
>;
type MeetingEntry = Pick<CollectionEntry<'meetings'>, 'id' | 'data'>;

let cache: Promise<SiteMentionRegistry> | undefined;

export const createCombinedSiteMentionRegistry = (
  registries: readonly SiteMentionRegistry[],
): SiteMentionRegistry =>
  createSiteMentionRegistry(
    registries.flatMap((registry) => [...registry.values()]),
  );

export const loadSiteMentionRegistry = (): Promise<SiteMentionRegistry> => {
  cache ??= import('astro:content').then(async ({ getCollection }) => {
    const [people, meetings] = await Promise.all([
      getCollection('peopleProfiles') as Promise<readonly PersonProfileEntry[]>,
      getCollection('meetings') as Promise<readonly MeetingEntry[]>,
    ]);

    return createCombinedSiteMentionRegistry([
      createPeopleMentionRegistry(people),
      createMeetingMentionRegistry(meetings),
    ]);
  });

  return cache;
};
