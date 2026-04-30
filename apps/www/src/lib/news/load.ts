import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from '../site';
import { buildArchives, newsMonthKey } from './archives';
import { articleCanonical, articleMarkdownUrl, articleUrl } from './routes';
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
  type NewsHomeData,
  type NewsListArticle,
  type NewsMonthArchive,
  type NewsPhoto,
  type NewsTagPage,
  type NewsYearArchive,
} from './schema';
import { buildArticleTags, buildTagIndex } from './tags';

const MOSCOW_OFFSET = '+03:00';

type ArticleEntry = CollectionEntry<'newsArticles'>;
type AuthorEntry = CollectionEntry<'newsAuthors'>;

interface AssetLike {
  readonly src: string;
}

interface AttachmentLike {
  readonly title: string;
  readonly url: string;
  readonly type?: string;
  readonly size?: string;
}

interface DateBits {
  readonly year: string;
  readonly month: string;
  readonly day: string;
}

interface PhotoLike {
  readonly src: AssetLike;
  readonly alt: string;
  readonly caption?: string;
}

interface RefLike {
  readonly id: string;
}

let cache: Promise<NewsDataset> | undefined;

function pad(value: number, size: number): string {
  return String(value).padStart(size, '0');
}

function localDateBits(date: Date): DateBits {
  return {
    year: pad(date.getFullYear(), 4),
    month: pad(date.getMonth() + 1, 2),
    day: pad(date.getDate(), 2),
  };
}

function utcDateBits(date: Date): DateBits {
  return {
    year: pad(date.getUTCFullYear(), 4),
    month: pad(date.getUTCMonth() + 1, 2),
    day: pad(date.getUTCDate(), 2),
  };
}

function pickDateBits(
  date: Date,
  expected?: { readonly year: string; readonly month: string },
): DateBits {
  const local = localDateBits(date);
  const utc = utcDateBits(date);

  if (!expected) {
    return utc;
  }

  if (local.year === expected.year && local.month === expected.month) {
    return local;
  }

  if (utc.year === expected.year && utc.month === expected.month) {
    return utc;
  }

  throw new Error(
    `news article date ${date.toISOString()} must match ${expected.year}/${expected.month}`,
  );
}

function stamp(
  bits: DateBits,
  time?: string,
): { readonly at: Date; readonly iso: string } {
  const clock = time ? (time.length === 5 ? `${time}:00` : time) : '00:00:00';
  const iso = `${bits.year}-${bits.month}-${bits.day}T${clock}${MOSCOW_OFFSET}`;
  const at = new Date(iso);

  if (Number.isNaN(at.valueOf())) {
    throw new Error(`invalid news timestamp ${iso}`);
  }

  return { at, iso };
}

function authorId(ref: RefLike): string {
  return ref.id;
}

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

function authorMap(
  entries: readonly AuthorEntry[],
): ReadonlyMap<string, NewsAuthor> {
  return new Map(entries.map((entry) => [entry.id, authorData(entry)]));
}

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

function assetUrl(asset: AssetLike | undefined): string | undefined {
  return asset ? withBase(asset.src) : undefined;
}

function photos(items: readonly PhotoLike[] | undefined): readonly NewsPhoto[] {
  return (
    items?.map((item) => ({
      url: withBase(item.src.src),
      alt: item.alt,
      ...(item.caption ? { caption: item.caption } : {}),
    })) ?? []
  );
}

function attachments(
  items: readonly AttachmentLike[] | undefined,
): readonly NewsAttachment[] {
  return (
    items?.map((item) => ({
      title: item.title,
      url: item.url,
      ...(item.type ? { type: item.type } : {}),
      ...(item.size ? { size: item.size } : {}),
    })) ?? []
  );
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
): {
  readonly items: readonly NewsAddendum[];
  readonly updated_at?: Date;
  readonly updated_iso?: string;
} {
  const items = (entry.data.addenda ?? [])
    .map((item, index) => {
      const published = stamp(pickDateBits(item.date), item.time);
      const author = needAuthor(
        authors,
        item.author
          ? authorId(item.author as RefLike)
          : NEWS_DEFAULT_ADDENDUM_AUTHOR_ID,
        `news article "${entry.id}" addendum #${index + 1}`,
      );

      return {
        ...(item.title ? { title: item.title } : {}),
        ...(item.time ? { time: item.time } : {}),
        author,
        ...(item.source_url ? { source_url: item.source_url } : {}),
        ...(item.body ? { body: item.body } : {}),
        photos: photos(item.photos as readonly PhotoLike[] | undefined),
        attachments: attachments(
          item.attachments as readonly AttachmentLike[] | undefined,
        ),
        published_at: published.at,
        published_iso: published.iso,
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

function areas(values: readonly NewsArea[] | undefined): {
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly NewsArea[];
} {
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
}

function normalizeArticle(
  entry: ArticleEntry,
  authors: ReadonlyMap<string, NewsAuthor>,
): NewsArticle {
  const parts = articleParts(entry);
  const published = stamp(
    pickDateBits(entry.data.date, {
      year: parts.year,
      month: parts.month,
    }),
    entry.data.time,
  );
  const area = areas(entry.data.areas);
  const addenda = normalizeAddenda(entry, authors, published.at);
  const author = needAuthor(
    authors,
    authorId(entry.data.author as RefLike),
    `news article "${entry.id}"`,
  );
  const coverUrl = assetUrl(entry.data.cover as AssetLike | undefined);
  const article = {
    id: entry.id,
    title: entry.data.title,
    ...(entry.data.seo_title ? { seo_title: entry.data.seo_title } : {}),
    ...(entry.data.seo_description
      ? { seo_description: entry.data.seo_description }
      : {}),
    author,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(
      pickDateBits(entry.data.date, {
        year: parts.year,
        month: parts.month,
      }).day,
    ),
    entry: parts.entry,
    url: articleUrl(parts),
    markdown_url: articleMarkdownUrl(parts),
    canonical: articleCanonical(parts),
    published_at: published.at,
    published_iso: published.iso,
    ...(entry.data.time ? { time: entry.data.time } : {}),
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
    pinned: entry.data.pinned ?? false,
    ...(entry.data.source_url ? { source_url: entry.data.source_url } : {}),
    ...(coverUrl ? { cover_url: coverUrl } : {}),
    ...(entry.data.cover_alt ? { cover_alt: entry.data.cover_alt } : {}),
    photos: photos(entry.data.photos as readonly PhotoLike[] | undefined),
    attachments: attachments(
      entry.data.attachments as readonly AttachmentLike[] | undefined,
    ),
    addenda: addenda.items,
    summary: entry.data.summary,
    body: entry.body?.trimEnd() ?? '',
    has_addenda: addenda.items.length > 0,
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

function toListArticle(article: NewsArticle): NewsListArticle {
  return {
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
    ...(article.cover_alt ? { cover_alt: article.cover_alt } : {}),
    summary: article.summary,
    has_addenda: article.has_addenda,
  };
}

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
    const key = `${item.year}/${pad(item.month, 2)}/${pad(item.day, 2)}`;
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

async function buildNewsData(): Promise<NewsDataset> {
  const [authorsData, articlesData] = await Promise.all([
    getCollection('newsAuthors'),
    getCollection('newsArticles'),
  ]);
  const authors = authorMap(authorsData);

  if (!authors.has(NEWS_DEFAULT_ADDENDUM_AUTHOR_ID)) {
    throw new Error(
      `default addendum author "${NEWS_DEFAULT_ADDENDUM_AUTHOR_ID}" is required`,
    );
  }

  const articles = articlesData
    .map((item) => normalizeArticle(item, authors))
    .sort(compareArticlesPublishedDesc);

  validateUniqueIds(articles);
  validateDayKeyConflicts(articles);

  const list = articles.map(toListArticle);
  const home: NewsHomeData = {
    pinned: list.filter((item) => item.pinned),
    latest: list.filter((item) => !item.pinned).slice(0, 10),
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

export function loadNewsData(): Promise<NewsDataset> {
  cache ??= buildNewsData();
  return cache;
}

export async function loadNewsArticles(): Promise<readonly NewsArticle[]> {
  return (await loadNewsData()).articles;
}

export async function loadNewsHome(): Promise<NewsHomeData> {
  return (await loadNewsData()).home;
}

export async function loadNewsArchives(): Promise<NewsArchives> {
  return (await loadNewsData()).archives;
}

export async function loadNewsTags(): Promise<readonly NewsTagPage[]> {
  return (await loadNewsData()).tags;
}

export async function loadNewsArticle(
  id: string,
): Promise<NewsArticle | undefined> {
  return (await loadNewsData()).by_id.get(id);
}

export async function loadNewsTag(
  key: string,
): Promise<NewsTagPage | undefined> {
  return (await loadNewsData()).by_tag.get(normalizeTagKey(key));
}

export async function loadNewsYear(
  year: number,
): Promise<NewsYearArchive | undefined> {
  return (await loadNewsData()).archives.by_year.get(year);
}

export async function loadNewsMonth(
  year: number,
  month: number,
): Promise<NewsMonthArchive | undefined> {
  return (await loadNewsData()).archives.by_month.get(
    newsMonthKey(year, month),
  );
}

export function toNewsListArticle(article: NewsArticle): NewsListArticle {
  return toListArticle(article);
}
