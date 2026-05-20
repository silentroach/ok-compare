import {
  createEntityMentionGraph,
  getEntityMentionGraphRefs,
  type EntityMentionSourceRef,
} from '../mentions';
import { createNewsArticleMentionRefs } from '../news/mentions';
import { createStatusIncidentMentionRefs } from '../status/mentions';
import { createPersonProfileMentionRefs } from './mention-refs';
import {
  PERSON_BACKLINK_KINDS,
  PERSON_MENTION_SECTIONS,
  type PersonBacklinkKind,
  type PersonMentionRef,
  type PersonMentionSection,
  type PersonProfile,
} from './schema';
import { loadPeopleData, type PeopleDataset } from './registry';

export {
  buildPeopleDataset,
  loadPeopleData,
  loadPeopleMentionRegistry,
} from './registry';
export type { PeopleDataset, PersonProfileEntry } from './registry';

let graphCache: Promise<PeopleDataset> | undefined;

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
