import { padNumber } from '@shelkovo/format';
import { getCollection, type CollectionEntry } from 'astro:content';

import {
  normalizePeopleMentions,
  type NormalizedPeopleMentions,
  type PeopleMentionRegistry,
} from '../people/mentions';
import { loadPeopleMentionRegistry } from '../people/load';
import { withBase } from '../site';
import { buildArchives, newsMonthKey } from './archives';
import { NEWS_LATEST_LIMIT } from './config';
import { parseNewsTimestamp, parseNewsTimestampInput } from './date';
import {
  articleCanonical,
  articleEventIcsUrl,
  articleMarkdownUrl,
  articleUrl,
} from './routes';
import {
  compareAddendaPublishedAsc,
  compareArticlesPublishedDesc,
} from './sort';
import {
  NEWS_AREAS,
  NEWS_DEFAULT_ADDENDUM_AUTHOR_ID,
  normalizeTagKey,
  type NewsAddendum,
  type NewsArea,
  type NewsArticle,
  type NewsArchives,
  type NewsAttachment,
  type NewsAuthor,
  type NewsDataset,
  type NewsEvent,
  type NewsEventCoordinates,
  type NewsHomeData,
  type NewsListArticle,
  type NewsMonthArchive,
  type NewsPhoto,
  type NewsTagPage,
  type NewsYearArchive,
} from './schema';
import { buildArticleTags, buildTagIndex } from './tags';

export type NewsArticleEntry = Pick<
  CollectionEntry<'newsArticles'>,
  'id' | 'data' | 'body'
>;
export type NewsAuthorEntry = Pick<
  CollectionEntry<'newsAuthors'>,
  'id' | 'data'
>;
type ArticleEntry = NewsArticleEntry;
type AuthorEntry = NewsAuthorEntry;
type ArticleData = ArticleEntry['data'];
type AddendumData = NonNullable<ArticleData['addenda']>[number];
type EventData = NonNullable<ArticleData['event']>;
type AttachmentInput =
  | NonNullable<ArticleData['attachments']>[number]
  | NonNullable<AddendumData['attachments']>[number];
type AuthorReference =
  | ArticleData['author']
  | NonNullable<AddendumData['author']>;
type CoverInput = NonNullable<ArticleData['cover']>;
type PhotoInput =
  | NonNullable<ArticleData['photos']>[number]
  | NonNullable<AddendumData['photos']>[number];
type NewsTimestampWithTime = NonNullable<
  ReturnType<typeof parseNewsTimestampInput>
> & {
  readonly has_time: true;
  readonly time: string;
};

let cache: Promise<NewsDataset> | undefined;
const EMPTY_MENTION_REGISTRY: PeopleMentionRegistry = new Map();

const isPinnedAtBuild = (input: {
  readonly pinned?: boolean;
  readonly pinned_until?: string;
}): boolean => {
  if (!input.pinned) {
    return false;
  }

  const until = input.pinned_until
    ? parseNewsTimestampInput(input.pinned_until)
    : undefined;

  return until ? Date.now() < until.at.valueOf() : true;
};

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

function parseEntryTimestamp(
  value: string,
  context: string,
  expected?: { readonly year: string; readonly month: string },
): NonNullable<ReturnType<typeof parseNewsTimestamp>> {
  const timestamp = parseNewsTimestamp(value);

  if (!timestamp) {
    throw new Error(
      `${context} date must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    );
  }

  if (!expected) {
    return timestamp;
  }

  if (timestamp.year !== expected.year || timestamp.month !== expected.month) {
    throw new Error(
      `${context} date ${timestamp.iso} must match ${expected.year}/${expected.month}`,
    );
  }

  return timestamp;
}

const authorId = (ref: AuthorReference): string => ref.id;

function authorData(entry: AuthorEntry): NewsAuthor {
  return {
    id: entry.id,
    name: entry.data.name,
    kind: entry.data.kind,
    ...(entry.data.short_name ? { short_name: entry.data.short_name } : {}),
    ...(entry.data.url ? { url: entry.data.url } : {}),
    ...(entry.data.role ? { role: entry.data.role } : {}),
    is_official:
      entry.data.is_official === true || entry.data.kind === 'official',
  };
}

const authorMap = (
  entries: readonly AuthorEntry[],
): ReadonlyMap<string, NewsAuthor> =>
  new Map(entries.map((entry) => [entry.id, authorData(entry)]));

function needAuthor(
  authors: ReadonlyMap<string, NewsAuthor>,
  id: string,
  context: string,
): NewsAuthor {
  const author = authors.get(id);

  if (!author) {
    throw new Error(`${context} references missing author "${id}"`);
  }

  return author;
}

const assetUrl = (asset: CoverInput | undefined): string | undefined =>
  asset ? withBase(asset.src) : undefined;

const photos = (
  items: readonly PhotoInput[] | undefined,
): readonly NewsPhoto[] =>
  items?.map((item) => ({
    url: withBase(item.src.src),
    alt: item.alt,
    ...(item.caption ? { caption: item.caption } : {}),
  })) ?? [];

const attachments = (
  items: readonly AttachmentInput[] | undefined,
): readonly NewsAttachment[] =>
  items?.map((item) => ({
    title: item.title,
    url: item.url,
    ...(item.type ? { type: item.type } : {}),
    ...(item.size ? { size: item.size } : {}),
  })) ?? [];

const requiredEventText = (value: string, context: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${context} is required`);
  }

  return normalized;
};

const optionalEventText = (
  value: string | undefined,
  context: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${context} must not be blank`);
  }

  return normalized;
};

function parseEventTimestamp(
  value: string,
  context: string,
): NewsTimestampWithTime {
  const timestamp = parseNewsTimestampInput(value);

  if (!timestamp) {
    throw new Error(`${context} must use dd.mm.yyyy hh:mm`);
  }

  if (!timestamp.has_time || !timestamp.time) {
    throw new Error(`${context} must include time`);
  }

  return timestamp as NewsTimestampWithTime;
}

function normalizeEventCoordinates(
  input: EventData['coordinates'] | undefined,
  context: string,
): NewsEventCoordinates | undefined {
  if (!input) {
    return undefined;
  }

  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    throw new Error(`${context} coordinates.lat must be between -90 and 90`);
  }

  if (!Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
    throw new Error(`${context} coordinates.lng must be between -180 and 180`);
  }

  return {
    lat: input.lat,
    lng: input.lng,
  };
}

function normalizeEvent(
  input: EventData | undefined,
  entryId: string,
  route: {
    readonly year: string;
    readonly month: string;
    readonly entry: string;
  },
): NewsEvent | undefined {
  if (!input) {
    return undefined;
  }

  const context = `news article "${entryId}" event`;
  const starts = parseEventTimestamp(input.starts_at, `${context} starts_at`);
  const ends = input.ends_at
    ? parseEventTimestamp(input.ends_at, `${context} ends_at`)
    : undefined;
  const location = optionalEventText(input.location, `${context} location`);
  const coordinates = normalizeEventCoordinates(input.coordinates, context);

  if (ends && ends.at.valueOf() <= starts.at.valueOf()) {
    throw new Error(`${context} ends_at must be later than starts_at`);
  }

  return {
    title: requiredEventText(input.title, `${context} title`),
    starts_at: starts.at,
    starts_iso: starts.iso,
    starts_time: starts.time,
    ics_url: articleEventIcsUrl(route),
    ...(ends
      ? {
          ends_at: ends.at,
          ends_iso: ends.iso,
          ends_time: ends.time,
        }
      : {}),
    ...(location ? { location } : {}),
    ...(coordinates ? { coordinates } : {}),
  };
}

function articleParts(entry: ArticleEntry): {
  readonly year: string;
  readonly month: string;
  readonly entry: string;
} {
  const parts = entry.id.split('/');

  if (parts.length !== 3) {
    throw new Error(`news article id "${entry.id}" must use YYYY/MM/[entry]`);
  }

  return {
    year: parts[0],
    month: parts[1],
    entry: parts[2],
  };
}

function normalizeAddenda(
  entry: ArticleEntry,
  authors: ReadonlyMap<string, NewsAuthor>,
  publishedAt: Date,
  peopleRegistry: PeopleMentionRegistry,
): {
  readonly items: readonly NewsAddendum[];
  readonly updated_at?: Date;
  readonly updated_iso?: string;
} {
  const items = (entry.data.addenda ?? [])
    .map((item: AddendumData, index: number) => {
      const published = parseEntryTimestamp(
        item.date,
        `news article "${entry.id}" addendum #${index + 1}`,
      );
      const author = needAuthor(
        authors,
        item.author ? authorId(item.author) : NEWS_DEFAULT_ADDENDUM_AUTHOR_ID,
        `news article "${entry.id}" addendum #${index + 1}`,
      );
      const body = content(
        item.body,
        peopleRegistry,
        `news article "${entry.id}" addendum #${index + 1} body`,
      );

      return {
        ...(item.title ? { title: item.title } : {}),
        ...(published.time ? { time: published.time } : {}),
        author,
        ...(item.source_url ? { source_url: item.source_url } : {}),
        ...(body.markdown ? { body: body.markdown } : {}),
        photos: photos(item.photos),
        attachments: attachments(item.attachments),
        published_at: published.at,
        published_iso: published.iso,
        mentions: body.mentions,
      } satisfies NewsAddendum;
    })
    .sort(compareAddendaPublishedAsc);

  for (const item of items) {
    if (item.published_at.valueOf() < publishedAt.valueOf()) {
      throw new Error(
        `news article "${entry.id}" addendum ${item.published_iso} cannot predate publication`,
      );
    }
  }

  const updated = items.at(-1);

  return {
    items,
    ...(updated
      ? {
          updated_at: updated.published_at,
          updated_iso: updated.published_iso,
        }
      : {}),
  };
}

const areas = (
  values: readonly NewsArea[] | undefined,
): {
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly NewsArea[];
} => {
  if (!values?.length) {
    return {
      applies_to_all_areas: true,
      areas: [...NEWS_AREAS],
    };
  }

  return {
    applies_to_all_areas: false,
    areas: [...values],
  };
};

function normalizeArticle(
  entry: ArticleEntry,
  authors: ReadonlyMap<string, NewsAuthor>,
  peopleRegistry: PeopleMentionRegistry,
): NewsArticle {
  const parts = articleParts(entry);
  const published = parseEntryTimestamp(
    entry.data.date,
    `news article "${entry.id}"`,
    {
      year: parts.year,
      month: parts.month,
    },
  );
  const area = areas(entry.data.areas);
  const addenda = normalizeAddenda(
    entry,
    authors,
    published.at,
    peopleRegistry,
  );
  const author = needAuthor(
    authors,
    authorId(entry.data.author),
    `news article "${entry.id}"`,
  );
  const cover = entry.data.cover;
  const coverUrl = assetUrl(cover);
  const event = normalizeEvent(entry.data.event, entry.id, parts);
  const body = content(
    entry.body,
    peopleRegistry,
    `news article "${entry.id}" body`,
  );
  const article = {
    id: entry.id,
    title: entry.data.title,
    ...(entry.data.seo ? { seo: entry.data.seo } : {}),
    author,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(published.day),
    entry: parts.entry,
    url: articleUrl(parts),
    markdown_url: articleMarkdownUrl(parts),
    canonical: articleCanonical(parts),
    published_at: published.at,
    published_iso: published.iso,
    ...(published.time ? { time: published.time } : {}),
    ...(addenda.updated_at
      ? {
          updated_at: addenda.updated_at,
          updated_iso: addenda.updated_iso,
        }
      : {}),
    is_official: author.is_official,
    applies_to_all_areas: area.applies_to_all_areas,
    areas: area.areas,
    tags: buildArticleTags(entry.data.tags),
    pinned: isPinnedAtBuild(entry.data),
    ...(entry.data.source_url ? { source_url: entry.data.source_url } : {}),
    ...(coverUrl ? { cover_url: coverUrl } : {}),
    ...(cover
      ? {
          cover_width: cover.width,
          cover_height: cover.height,
        }
      : {}),
    ...(entry.data.cover_alt ? { cover_alt: entry.data.cover_alt } : {}),
    photos: photos(entry.data.photos),
    attachments: attachments(entry.data.attachments),
    ...(event ? { event } : {}),
    addenda: addenda.items,
    summary: entry.data.summary,
    body: body.markdown,
    has_addenda: addenda.items.length > 0,
    mentions: body.mentions,
  } satisfies NewsArticle;

  if (
    article.updated_at &&
    article.updated_at.valueOf() < article.published_at.valueOf()
  ) {
    throw new Error(
      `news article "${entry.id}" updated_at cannot be earlier than published_at`,
    );
  }

  return article;
}

const toListArticle = (article: NewsArticle): NewsListArticle => ({
  id: article.id,
  title: article.title,
  author: article.author,
  year: article.year,
  month: article.month,
  day: article.day,
  entry: article.entry,
  url: article.url,
  markdown_url: article.markdown_url,
  canonical: article.canonical,
  published_at: article.published_at,
  published_iso: article.published_iso,
  ...(article.time ? { time: article.time } : {}),
  ...(article.updated_at
    ? {
        updated_at: article.updated_at,
        updated_iso: article.updated_iso,
      }
    : {}),
  is_official: article.is_official,
  applies_to_all_areas: article.applies_to_all_areas,
  areas: article.areas,
  tags: article.tags,
  pinned: article.pinned,
  ...(article.source_url ? { source_url: article.source_url } : {}),
  ...(article.cover_url ? { cover_url: article.cover_url } : {}),
  ...(article.cover_width && article.cover_height
    ? {
        cover_width: article.cover_width,
        cover_height: article.cover_height,
      }
    : {}),
  ...(article.cover_alt ? { cover_alt: article.cover_alt } : {}),
  ...(article.event ? { event: article.event } : {}),
  summary: article.summary,
  has_addenda: article.has_addenda,
});

function validateUniqueIds(items: readonly NewsArticle[]): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`duplicate news article id "${item.id}"`);
    }

    seen.add(item.id);
  }
}

function validateDayKeyConflicts(items: readonly NewsArticle[]): void {
  const days = new Map<string, NewsArticle[]>();

  for (const item of items) {
    const key = `${item.year}/${padNumber(item.month, 2)}/${padNumber(item.day, 2)}`;
    const list = days.get(key) ?? [];

    list.push(item);
    days.set(key, list);
  }

  for (const [key, day] of days.entries()) {
    const numeric = day.find(
      (item) => /^\d+$/.test(item.entry) && Number(item.entry) === item.day,
    );

    if (numeric && day.length > 1) {
      throw new Error(
        `news article day-key "${numeric.id}" conflicts with another article on ${key}`,
      );
    }
  }
}

export function buildNewsDataset(
  authorsData: readonly NewsAuthorEntry[],
  articlesData: readonly NewsArticleEntry[],
  opts?: {
    readonly people_registry?: PeopleMentionRegistry;
  },
): NewsDataset {
  const peopleRegistry = opts?.people_registry ?? EMPTY_MENTION_REGISTRY;
  const authors = authorMap(authorsData);

  if (!authors.has(NEWS_DEFAULT_ADDENDUM_AUTHOR_ID)) {
    throw new Error(
      `default addendum author "${NEWS_DEFAULT_ADDENDUM_AUTHOR_ID}" is required`,
    );
  }

  const articles: readonly NewsArticle[] = articlesData
    .map((item: ArticleEntry) =>
      normalizeArticle(item, authors, peopleRegistry),
    )
    .sort(compareArticlesPublishedDesc);

  validateUniqueIds(articles);
  validateDayKeyConflicts(articles);

  const list: readonly NewsListArticle[] = articles.map(toListArticle);
  const home: NewsHomeData = {
    pinned: list.filter((item) => item.pinned),
    latest: list.filter((item) => !item.pinned).slice(0, NEWS_LATEST_LIMIT),
  };
  const archives = buildArchives(list);
  const tags = buildTagIndex(list);

  return {
    articles,
    home,
    archives,
    tags,
    by_id: new Map(articles.map((item) => [item.id, item])),
    by_tag: new Map(tags.map((item) => [item.key, item])),
  };
}

async function buildNewsData(): Promise<NewsDataset> {
  const [authorsData, articlesData, people_registry] = await Promise.all([
    getCollection('newsAuthors') as Promise<readonly NewsAuthorEntry[]>,
    getCollection('newsArticles') as Promise<readonly NewsArticleEntry[]>,
    loadPeopleMentionRegistry(),
  ]);

  return buildNewsDataset(authorsData, articlesData, { people_registry });
}

export const loadNewsData = (): Promise<NewsDataset> => {
  cache ??= buildNewsData();
  return cache;
};

export const loadNewsArticles = async (): Promise<readonly NewsArticle[]> =>
  (await loadNewsData()).articles;

export const loadNewsHome = async (): Promise<NewsHomeData> =>
  (await loadNewsData()).home;

export const loadNewsArchives = async (): Promise<NewsArchives> =>
  (await loadNewsData()).archives;

export const loadNewsTags = async (): Promise<readonly NewsTagPage[]> =>
  (await loadNewsData()).tags;

export const loadNewsArticle = async (
  id: string,
): Promise<NewsArticle | undefined> => (await loadNewsData()).by_id.get(id);

export const loadNewsTag = async (
  key: string,
): Promise<NewsTagPage | undefined> =>
  (await loadNewsData()).by_tag.get(normalizeTagKey(key));

export const loadNewsYear = async (
  year: number,
): Promise<NewsYearArchive | undefined> =>
  (await loadNewsData()).archives.by_year.get(year);

export const loadNewsMonth = async (
  year: number,
  month: number,
): Promise<NewsMonthArchive | undefined> =>
  (await loadNewsData()).archives.by_month.get(newsMonthKey(year, month));

export const toNewsListArticle = (article: NewsArticle): NewsListArticle =>
  toListArticle(article);
