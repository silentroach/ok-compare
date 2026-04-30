import { absoluteUrl } from '../site';
import {
  apiCatalogPath,
  articlesDataPath,
  articlesOpenApiPath,
  articlesSchemaPath,
  feedPath,
  llmsFullPath,
  llmsPath,
  newsPath,
} from './routes';
import {
  NEWS_AREAS,
  NEWS_AUTHOR_KINDS,
  type NewsAddendum,
  type NewsArticle,
  type NewsAttachment,
  type NewsAuthor,
  type NewsDataset,
  type NewsMonthArchive,
  type NewsPhoto,
  type NewsTag,
  type NewsTagPage,
  type NewsYearArchive,
} from './schema';

export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
export const OAS = 'application/vnd.oai.openapi+json';

export interface NewsDiscoveryAuthor {
  readonly id: string;
  readonly name: string;
  readonly kind: NewsAuthor['kind'];
  readonly url?: string;
}

export interface NewsDiscoveryTag {
  readonly label: string;
  readonly key: string;
  readonly url: string;
}

export interface NewsDiscoveryPhoto {
  readonly url: string;
  readonly alt: string;
  readonly caption?: string;
}

export interface NewsDiscoveryAttachment {
  readonly title: string;
  readonly url: string;
  readonly type?: string;
  readonly size?: string;
}

export interface NewsDiscoveryCover {
  readonly url: string;
  readonly alt: string;
}

export interface NewsDiscoveryAddendum {
  readonly title?: string;
  readonly published_at: string;
  readonly author: NewsDiscoveryAuthor;
  readonly source_url?: string;
  readonly body_markdown: string;
  readonly photos: readonly NewsDiscoveryPhoto[];
  readonly attachments: readonly NewsDiscoveryAttachment[];
}

export interface NewsDiscoveryArticle {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly published_at: string;
  readonly updated_at?: string;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly entry: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly source_url?: string;
  readonly pinned: boolean;
  readonly is_official: boolean;
  readonly author: NewsDiscoveryAuthor;
  readonly areas: readonly string[];
  readonly tags: readonly NewsDiscoveryTag[];
  readonly cover?: NewsDiscoveryCover;
  readonly photos: readonly NewsDiscoveryPhoto[];
  readonly attachments: readonly NewsDiscoveryAttachment[];
  readonly body_markdown: string;
  readonly addenda: readonly NewsDiscoveryAddendum[];
}

export interface NewsDiscoveryArchiveMonth {
  readonly year: number;
  readonly month: number;
  readonly count: number;
  readonly url: string;
  readonly markdown_url: string;
}

export interface NewsDiscoveryArchiveYear {
  readonly year: number;
  readonly count: number;
  readonly url: string;
  readonly markdown_url: string;
  readonly months: readonly NewsDiscoveryArchiveMonth[];
}

export interface NewsDiscoveryTagPage {
  readonly label: string;
  readonly key: string;
  readonly count: number;
  readonly url: string;
  readonly markdown_url: string;
}

export interface NewsDiscoveryPayload {
  readonly articles: readonly NewsDiscoveryArticle[];
  readonly archives: {
    readonly years: readonly NewsDiscoveryArchiveYear[];
  };
  readonly tags: readonly NewsDiscoveryTagPage[];
}

const NEWS_ARTICLES_PAYLOAD_SCHEMA = 'NewsArticlesPayload';

function abs(root: string, path: string): string {
  return new URL(path.replace(/^\//, ''), `${root}/`).toString();
}

function server(root: string): string {
  return root.replace(/\/$/, '');
}

function star(
  value: string,
): readonly { readonly value: string; readonly language: 'ru' }[] {
  return [{ value, language: 'ru' }];
}

function text(minLength = 0): Record<string, unknown> {
  return {
    type: 'string',
    ...(minLength > 0 ? { minLength } : {}),
  };
}

function uri(): Record<string, unknown> {
  return {
    type: 'string',
    format: 'uri',
  };
}

function dateTime(): Record<string, unknown> {
  return {
    type: 'string',
    format: 'date-time',
  };
}

function flag(): Record<string, unknown> {
  return {
    type: 'boolean',
  };
}

function integer(minimum?: number, maximum?: number): Record<string, unknown> {
  return {
    type: 'integer',
    ...(minimum !== undefined ? { minimum } : {}),
    ...(maximum !== undefined ? { maximum } : {}),
  };
}

function list(
  items: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    type: 'array',
    items,
    ...(extra ?? {}),
  };
}

function obj(
  properties: Record<string, unknown>,
  required: readonly string[],
): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    properties,
    required,
  };
}

function rewriteSchemaRefs(value: unknown, schemaRef: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteSchemaRefs(item, schemaRef));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (
        key === '$ref' &&
        typeof entry === 'string' &&
        entry.startsWith('#/')
      ) {
        return [key, `${schemaRef}${entry.slice(1)}`];
      }

      return [key, rewriteSchemaRefs(entry, schemaRef)];
    }),
  );
}

function fullUrl(value: string): string {
  return absoluteUrl(value);
}

function author(author: NewsAuthor): NewsDiscoveryAuthor {
  return {
    id: author.id,
    name: author.name,
    kind: author.kind,
    ...(author.url ? { url: fullUrl(author.url) } : {}),
  };
}

function tag(tag: NewsTag): NewsDiscoveryTag {
  return {
    label: tag.label,
    key: tag.key,
    url: fullUrl(tag.url),
  };
}

function photo(item: NewsPhoto): NewsDiscoveryPhoto {
  return {
    url: fullUrl(item.url),
    alt: item.alt,
    ...(item.caption ? { caption: item.caption } : {}),
  };
}

function attachment(item: NewsAttachment): NewsDiscoveryAttachment {
  return {
    title: item.title,
    url: fullUrl(item.url),
    ...(item.type ? { type: item.type } : {}),
    ...(item.size ? { size: item.size } : {}),
  };
}

function cover(article: NewsArticle): NewsDiscoveryCover | undefined {
  if (!article.cover_url) {
    return undefined;
  }

  if (!article.cover_alt) {
    throw new Error(
      `news article "${article.id}" cover_alt is required when cover is present`,
    );
  }

  return {
    url: fullUrl(article.cover_url),
    alt: article.cover_alt,
  };
}

function addendum(item: NewsAddendum): NewsDiscoveryAddendum {
  return {
    ...(item.title ? { title: item.title } : {}),
    published_at: item.published_iso,
    author: author(item.author),
    ...(item.source_url ? { source_url: fullUrl(item.source_url) } : {}),
    body_markdown: item.body ?? '',
    photos: item.photos.map(photo),
    attachments: item.attachments.map(attachment),
  };
}

function article(item: NewsArticle): NewsDiscoveryArticle {
  const image = cover(item);

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    published_at: item.published_iso,
    ...(item.updated_iso ? { updated_at: item.updated_iso } : {}),
    year: item.year,
    month: item.month,
    day: item.day,
    entry: item.entry,
    html_url: item.canonical,
    markdown_url: fullUrl(item.markdown_url),
    ...(item.source_url ? { source_url: fullUrl(item.source_url) } : {}),
    pinned: item.pinned,
    is_official: item.is_official,
    author: author(item.author),
    areas: [...item.areas],
    tags: item.tags.map(tag),
    ...(image ? { cover: image } : {}),
    photos: item.photos.map(photo),
    attachments: item.attachments.map(attachment),
    body_markdown: item.body,
    addenda: item.addenda.map(addendum),
  };
}

function archiveMonth(item: NewsMonthArchive): NewsDiscoveryArchiveMonth {
  return {
    year: item.year,
    month: item.month,
    count: item.count,
    url: fullUrl(item.url),
    markdown_url: fullUrl(item.markdown_url),
  };
}

function archiveYear(item: NewsYearArchive): NewsDiscoveryArchiveYear {
  return {
    year: item.year,
    count: item.count,
    url: fullUrl(item.url),
    markdown_url: fullUrl(item.markdown_url),
    months: item.months.map(archiveMonth),
  };
}

function tagPage(item: NewsTagPage): NewsDiscoveryTagPage {
  return {
    label: item.label,
    key: item.key,
    count: item.count,
    url: fullUrl(item.url),
    markdown_url: fullUrl(item.markdown_url),
  };
}

function latestUpdate(items: readonly NewsArticle[]): Date | undefined {
  return items.reduce<Date | undefined>((latest, item) => {
    const current = item.updated_at ?? item.published_at;

    if (!latest || current.valueOf() > latest.valueOf()) {
      return current;
    }

    return latest;
  }, undefined);
}

function xml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function buildNewsPayload(data: NewsDataset): NewsDiscoveryPayload {
  return {
    articles: data.articles.map(article),
    archives: {
      years: data.archives.years.map(archiveYear),
    },
    tags: data.tags.map(tagPage),
  };
}

export function buildNewsRss(data: NewsDataset): string {
  const home = fullUrl(newsPath());
  const self = fullUrl(feedPath());
  const updated = latestUpdate(data.articles);
  const items = data.articles.map(
    (item) =>
      `    <item>\n      <title>${xml(item.title)}</title>\n      <link>${xml(item.canonical)}</link>\n      <guid isPermaLink="true">${xml(item.canonical)}</guid>\n      <pubDate>${item.published_at.toUTCString()}</pubDate>\n      <description>${xml(item.summary)}</description>\n${item.tags
        .map((entry) => `      <category>${xml(entry.label)}</category>`)
        .join('\n')}\n    </item>`,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Новости Шелково</title>',
    `    <link>${xml(home)}</link>`,
    '    <description>Статическая лента новостей Шелково: summary-first RSS, полный machine-readable контракт живет в /news/data/articles.json.</description>',
    '    <language>ru-RU</language>',
    `    <atom:link href="${xml(self)}" rel="self" type="application/rss+xml" />`,
    ...(updated
      ? [`    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>`]
      : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

export function schema(root: string): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: abs(root, articlesSchemaPath()),
    title: 'NewsArticlesPayload',
    description:
      'Read-only полный feed news-section с canonical HTML URL, markdown companions, full body_markdown и отдельным массивом addenda.',
    type: 'object',
    additionalProperties: false,
    required: ['articles', 'archives', 'tags'],
    properties: {
      articles: list({
        $ref: '#/$defs/article',
      }),
      archives: obj(
        {
          years: list({
            $ref: '#/$defs/archiveYear',
          }),
        },
        ['years'],
      ),
      tags: list({
        $ref: '#/$defs/tagPage',
      }),
    },
    $defs: {
      author: obj(
        {
          id: text(1),
          name: text(1),
          kind: {
            enum: [...NEWS_AUTHOR_KINDS],
          },
          url: uri(),
        },
        ['id', 'name', 'kind'],
      ),
      tag: obj(
        {
          label: text(1),
          key: text(1),
          url: uri(),
        },
        ['label', 'key', 'url'],
      ),
      tagPage: obj(
        {
          label: text(1),
          key: text(1),
          count: integer(0),
          url: uri(),
          markdown_url: uri(),
        },
        ['label', 'key', 'count', 'url', 'markdown_url'],
      ),
      photo: obj(
        {
          url: uri(),
          alt: text(1),
          caption: text(1),
        },
        ['url', 'alt'],
      ),
      attachment: obj(
        {
          title: text(1),
          url: uri(),
          type: text(1),
          size: text(1),
        },
        ['title', 'url'],
      ),
      cover: obj(
        {
          url: uri(),
          alt: text(1),
        },
        ['url', 'alt'],
      ),
      addendum: obj(
        {
          title: text(1),
          published_at: dateTime(),
          author: {
            $ref: '#/$defs/author',
          },
          source_url: uri(),
          body_markdown: text(),
          photos: list({
            $ref: '#/$defs/photo',
          }),
          attachments: list({
            $ref: '#/$defs/attachment',
          }),
        },
        ['published_at', 'author', 'body_markdown', 'photos', 'attachments'],
      ),
      article: obj(
        {
          id: {
            type: 'string',
            pattern: '^\\d{4}/\\d{2}/[^/]+$',
          },
          title: text(1),
          summary: text(1),
          published_at: dateTime(),
          updated_at: dateTime(),
          year: integer(2000, 2999),
          month: integer(1, 12),
          day: integer(1, 31),
          entry: text(1),
          html_url: uri(),
          markdown_url: uri(),
          source_url: uri(),
          pinned: flag(),
          is_official: flag(),
          author: {
            $ref: '#/$defs/author',
          },
          areas: list(
            {
              enum: [...NEWS_AREAS],
            },
            {
              minItems: 1,
              uniqueItems: true,
            },
          ),
          tags: list({
            $ref: '#/$defs/tag',
          }),
          cover: {
            $ref: '#/$defs/cover',
          },
          photos: list({
            $ref: '#/$defs/photo',
          }),
          attachments: list({
            $ref: '#/$defs/attachment',
          }),
          body_markdown: text(),
          addenda: list({
            $ref: '#/$defs/addendum',
          }),
        },
        [
          'id',
          'title',
          'summary',
          'published_at',
          'year',
          'month',
          'day',
          'entry',
          'html_url',
          'markdown_url',
          'pinned',
          'is_official',
          'author',
          'areas',
          'tags',
          'photos',
          'attachments',
          'body_markdown',
          'addenda',
        ],
      ),
      archiveMonth: obj(
        {
          year: integer(2000, 2999),
          month: integer(1, 12),
          count: integer(0),
          url: uri(),
          markdown_url: uri(),
        },
        ['year', 'month', 'count', 'url', 'markdown_url'],
      ),
      archiveYear: obj(
        {
          year: integer(2000, 2999),
          count: integer(0),
          url: uri(),
          markdown_url: uri(),
          months: list({
            $ref: '#/$defs/archiveMonth',
          }),
        },
        ['year', 'count', 'url', 'markdown_url', 'months'],
      ),
    },
  };
}

export function openapi(root: string): Record<string, unknown> {
  const schemaRef = `#/components/schemas/${NEWS_ARTICLES_PAYLOAD_SCHEMA}`;
  const body = Object.fromEntries(
    Object.entries(schema(root)).filter(
      ([key]) => key !== '$schema' && key !== '$id',
    ),
  );
  const componentBody = rewriteSchemaRefs(body, schemaRef);

  return {
    openapi: '3.1.0',
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    info: {
      title: 'Шелково News Feed',
      version: '1.0.0',
      description:
        'Read-only OpenAPI wrapper для /news/data/articles.json с полным body_markdown, addenda, архивами и тегами.',
    },
    servers: [
      {
        url: server(root),
      },
    ],
    paths: {
      [articlesDataPath()]: {
        get: {
          operationId: 'getNewsArticles',
          summary: 'Read full news feed',
          description:
            'Возвращает основной structured feed news-section со статьями, полным body_markdown, addenda, тегами и архивами.',
          responses: {
            200: {
              description: 'Full news feed',
              content: {
                'application/json': {
                  schema: {
                    $ref: schemaRef,
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        [NEWS_ARTICLES_PAYLOAD_SCHEMA]: componentBody,
      },
    },
  };
}

export function catalog(root: string): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: abs(root, newsPath()),
        item: [
          {
            href: abs(root, articlesDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed news-section'),
          },
          {
            href: abs(root, feedPath()),
            type: 'application/rss+xml',
            'title*': star('RSS-лента новостей'),
          },
          {
            href: abs(root, llmsPath()),
            type: 'text/plain',
            'title*': star('Короткий агентный обзор llms.txt'),
          },
          {
            href: abs(root, llmsFullPath()),
            type: 'text/plain',
            'title*': star('Расширенный агентный обзор llms-full.txt'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, articlesSchemaPath()),
            type: 'application/schema+json',
            'title*': star('JSON Schema для news feed'),
          },
          {
            href: abs(root, articlesOpenApiPath()),
            type: OAS,
            'title*': star('OpenAPI для news feed'),
          },
        ],
      },
    ],
  };
}

export function links(root: string): string {
  return [
    `<${abs(root, articlesSchemaPath())}>; rel="service-desc"; type="application/schema+json"`,
    `<${abs(root, articlesOpenApiPath())}>; rel="service-desc"; type="${OAS}"`,
    `<${abs(root, apiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`,
  ].join(', ');
}

export function self(root: string): string {
  return `<${abs(root, apiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
}
