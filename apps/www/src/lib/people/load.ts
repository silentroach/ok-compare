import type { CollectionEntry } from 'astro:content';
import { preprocessSiteMarkdownContent } from '../markdown/render';
import {
  createEntityMentionGraph,
  getEntityMentionGraphRefs,
  type EntityMentionSourceRef,
  type SiteMentionRegistry,
} from '../mentions';
import { createNewsArticleMentionRefs } from '../news/mentions';
import { createStatusIncidentMentionRefs } from '../status/mentions';
import { createPersonProfileMentionRefs } from './mention-refs';
import {
  createPersonMentionTarget,
  type PeopleMentionRegistry,
} from './mentions';
import { personCanonical, personMarkdownUrl, personUrl } from './routes';
import {
  EMPTY_PERSON_BACKLINKS,
  PERSON_BACKLINK_KINDS,
  PERSON_MENTION_SECTIONS,
  type PersonBacklinkKind,
  type PersonMentionRef,
  type PersonMentionSection,
  type PersonProfile,
} from './schema';
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
let graphCache: Promise<PeopleDataset> | undefined;

const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');
const PERSON_MENTION_SECTION_SET = new Set<string>(PERSON_MENTION_SECTIONS);
const PERSON_BACKLINK_KIND_SET = new Set<string>(PERSON_BACKLINK_KINDS);

const isPersonMentionSection = (value: string): value is PersonMentionSection =>
  PERSON_MENTION_SECTION_SET.has(value);

const isPersonBacklinkKind = (value: string): value is PersonBacklinkKind =>
  PERSON_BACKLINK_KIND_SET.has(value);

const toPersonMentionRef = (
  ref: EntityMentionSourceRef,
): PersonMentionRef | undefined => {
  if (
    !isPersonMentionSection(ref.source_section) ||
    !isPersonBacklinkKind(ref.source_kind)
  ) {
    return undefined;
  }

  return {
    section: ref.source_section,
    kind: ref.source_kind,
    source_id: ref.source_id,
    title: ref.title,
    html_url: ref.html_url,
    markdown_url: ref.markdown_url,
    ...(ref.excerpt ? { excerpt: ref.excerpt } : {}),
    ...(ref.mentioned_at ? { mentioned_at: ref.mentioned_at } : {}),
    ...(ref.sort_key !== undefined ? { sort_key: ref.sort_key } : {}),
  };
};

const toPersonMentionRefs = (
  refs: readonly EntityMentionSourceRef[],
): readonly PersonMentionRef[] =>
  refs.flatMap((ref) => {
    const backlink = toPersonMentionRef(ref);

    return backlink ? [backlink] : [];
  });

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
    .sort((a, b) => byText(a.name, b.name) || byText(a.slug, b.slug));

  return {
    profiles,
    by_slug: new Map(profiles.map((profile) => [profile.slug, profile])),
    mention_registry,
  };
};

export const buildPeopleGraphDataset = (
  people: PeopleDataset,
  refs: readonly EntityMentionSourceRef[],
): PeopleDataset => {
  const graph = createEntityMentionGraph(refs);

  const profiles = people.profiles.map((profile) => ({
    ...profile,
    backlinks: {
      news: toPersonMentionRefs(
        getEntityMentionGraphRefs(graph, 'person', profile.slug, 'news'),
      ),
      status: toPersonMentionRefs(
        getEntityMentionGraphRefs(graph, 'person', profile.slug, 'status'),
      ),
      people: toPersonMentionRefs(
        getEntityMentionGraphRefs(graph, 'person', profile.slug, 'people'),
      ),
    },
  }));

  return {
    profiles,
    by_slug: new Map(profiles.map((profile) => [profile.slug, profile])),
    mention_registry: people.mention_registry,
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

const buildPeopleDataWithBacklinks = async (): Promise<PeopleDataset> => {
  const [{ loadNewsData }, { loadStatusData }, people] = await Promise.all([
    import('../news/load'),
    import('../status/load'),
    loadPeopleData(),
  ]);
  const [news, status] = await Promise.all([loadNewsData(), loadStatusData()]);
  const refs = [
    ...news.articles.flatMap(createNewsArticleMentionRefs),
    ...status.incidents.flatMap(createStatusIncidentMentionRefs),
    ...people.profiles.flatMap(createPersonProfileMentionRefs),
  ];

  return buildPeopleGraphDataset(people, refs);
};

export const loadPeopleDataWithBacklinks = (): Promise<PeopleDataset> => {
  graphCache ??= buildPeopleDataWithBacklinks();

  return graphCache;
};

export const loadPeopleProfiles = async (): Promise<readonly PersonProfile[]> =>
  (await loadPeopleData()).profiles;

export const loadPeopleProfilesWithBacklinks = async (): Promise<
  readonly PersonProfile[]
> => (await loadPeopleDataWithBacklinks()).profiles;

export const loadPeopleMentionRegistry =
  async (): Promise<PeopleMentionRegistry> =>
    (await loadPeopleData()).mention_registry;

export const loadPersonProfile = async (
  slug: string,
): Promise<PersonProfile | undefined> => {
  const key = slug.trim();

  return key ? (await loadPeopleData()).by_slug.get(key) : undefined;
};

export const loadPersonProfileWithBacklinks = async (
  slug: string,
): Promise<PersonProfile | undefined> => {
  const key = slug.trim();

  return key
    ? (await loadPeopleDataWithBacklinks()).by_slug.get(key)
    : undefined;
};
