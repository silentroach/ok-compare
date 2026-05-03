import type { CollectionEntry } from 'astro:content';

import { extractFirstMarkdownText } from '../markdown/plain-text';
import { statusIncidentMarkdownUrl } from '../status/routes';
import type { NewsDataset } from '../news/schema';
import type { StatusDataset } from '../status/schema';
import {
  createPersonMentionTarget,
  normalizePeopleMentions,
  type NormalizedPeopleMentions,
  type PeopleMentionRegistry,
} from './mentions';
import { personCanonical, personMarkdownUrl, personUrl } from './routes';
import {
  EMPTY_PERSON_BACKLINKS,
  type PersonBacklinks,
  type PersonMentionRef,
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

interface PersonBacklinksDraft {
  news: PersonMentionRef[];
  status: PersonMentionRef[];
  people: PersonMentionRef[];
}

let cache: Promise<PeopleDataset> | undefined;
let graphCache: Promise<PeopleDataset> | undefined;

const SPACE = /\s+/gu;
const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');

const content = (
  value: string | undefined,
  registry: PeopleMentionRegistry,
  context: string,
): NormalizedPeopleMentions => {
  const body = value?.trimEnd() ?? '';

  return body.trim().length > 0
    ? normalizePeopleMentions({
        markdown: body,
        context,
        registry,
      })
    : {
        markdown: '',
        mentions: [],
      };
};

const inline = (value: string): string => value.replace(SPACE, ' ').trim();

const excerpt = (value: string): string | undefined => {
  const first = extractFirstMarkdownText(value);

  return first ? inline(first) : undefined;
};

const createBacklinksDraft = (): PersonBacklinksDraft => ({
  news: [],
  status: [],
  people: [],
});

const createPersonBacklinks = (
  draft: PersonBacklinksDraft | undefined,
): PersonBacklinks => {
  if (!draft) {
    return EMPTY_PERSON_BACKLINKS;
  }

  const sort = (
    items: readonly PersonMentionRef[],
  ): readonly PersonMentionRef[] =>
    [...items].sort(
      (a, b) =>
        (b.sort_key ?? Number.NEGATIVE_INFINITY) -
          (a.sort_key ?? Number.NEGATIVE_INFINITY) ||
        byText(a.title, b.title) ||
        byText(a.source_id, b.source_id),
    );

  return {
    news: sort(draft.news),
    status: sort(draft.status),
    people: sort(draft.people),
  };
};

const pushBacklink = (
  index: Map<string, PersonBacklinksDraft>,
  slug: string,
  backlink: PersonMentionRef,
): void => {
  if (backlink.section === 'people' && backlink.source_id === slug) {
    return;
  }

  const list = index.get(slug) ?? createBacklinksDraft();

  list[backlink.section].push(backlink);
  index.set(slug, list);
};

const articleBacklink = (
  article: NewsDataset['articles'][number],
): PersonMentionRef => {
  const summary = excerpt(article.body);

  return {
    section: 'news',
    kind: 'article',
    source_id: article.id,
    title: article.title,
    html_url: article.url,
    markdown_url: article.markdown_url,
    ...(summary ? { excerpt: summary } : {}),
    mentioned_at: article.published_iso,
    sort_key: article.published_at.valueOf(),
  };
};

const addendumTitle = (
  article: NewsDataset['articles'][number],
  addendum: NewsDataset['articles'][number]['addenda'][number],
  index: number,
): string =>
  addendum.title
    ? `${article.title} — ${addendum.title}`
    : `${article.title} — дополнение ${index + 1}`;

const addendumBacklink = (
  article: NewsDataset['articles'][number],
  addendum: NewsDataset['articles'][number]['addenda'][number],
  index: number,
): PersonMentionRef => {
  const summary = addendum.body ? excerpt(addendum.body) : undefined;

  return {
    section: 'news',
    kind: 'addendum',
    source_id: `${article.id}#addendum-${index + 1}`,
    title: addendumTitle(article, addendum, index),
    html_url: article.url,
    markdown_url: article.markdown_url,
    ...(summary ? { excerpt: summary } : {}),
    mentioned_at: addendum.published_iso,
    sort_key: addendum.published_at.valueOf(),
  };
};

const incidentBacklink = (
  incident: StatusDataset['incidents'][number],
): PersonMentionRef => ({
  section: 'status',
  kind: 'incident',
  source_id: incident.id,
  title: incident.title,
  html_url: incident.url,
  markdown_url: statusIncidentMarkdownUrl(incident),
  ...(incident.excerpt ? { excerpt: incident.excerpt } : {}),
  mentioned_at: incident.started_iso,
  sort_key: incident.sort_last_change_at,
});

const personBacklink = (profile: PersonProfile): PersonMentionRef => {
  const summary = excerpt(profile.body);

  return {
    section: 'people',
    kind: 'person',
    source_id: profile.id,
    title: profile.name,
    html_url: profile.url,
    markdown_url: profile.markdown_url,
    ...(summary ? { excerpt: summary } : {}),
  };
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
): PersonProfile => {
  const body = content(
    entry.body,
    registry,
    `people profile "${entry.id}" body`,
  );

  return {
    id: entry.id,
    slug: entry.id,
    name: entry.data.name,
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
  related: {
    readonly news: Pick<NewsDataset, 'articles'>;
    readonly status: Pick<StatusDataset, 'incidents'>;
  },
): PeopleDataset => {
  const backlinks = new Map<string, PersonBacklinksDraft>();

  for (const article of related.news.articles) {
    if (article.mentions.length > 0) {
      const backlink = articleBacklink(article);

      for (const mention of article.mentions) {
        pushBacklink(backlinks, mention.slug, backlink);
      }
    }

    for (const [index, addendum] of article.addenda.entries()) {
      if (addendum.mentions.length === 0) {
        continue;
      }

      const backlink = addendumBacklink(article, addendum, index);

      for (const mention of addendum.mentions) {
        pushBacklink(backlinks, mention.slug, backlink);
      }
    }
  }

  for (const incident of related.status.incidents) {
    if (incident.mentions.length === 0) {
      continue;
    }

    const backlink = incidentBacklink(incident);

    for (const mention of incident.mentions) {
      pushBacklink(backlinks, mention.slug, backlink);
    }
  }

  for (const profile of people.profiles) {
    if (profile.mentions.length === 0) {
      continue;
    }

    const backlink = personBacklink(profile);

    for (const mention of profile.mentions) {
      pushBacklink(backlinks, mention.slug, backlink);
    }
  }

  const profiles = people.profiles.map((profile) => ({
    ...profile,
    backlinks: createPersonBacklinks(backlinks.get(profile.slug)),
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

  return buildPeopleGraphDataset(people, { news, status });
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
