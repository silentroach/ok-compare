import { canon, withBase } from '../site';
import { normalizeTagKey } from './schema';

const NEWS_ROOT = '/news/';
const NEWS_MARKDOWN = '/news/index.md';
const TAGS_ROOT = '/news/tags/';
const TAGS_MARKDOWN = '/news/tags/index.md';
const DATA_ARTICLES = '/news/data/articles.json';
const FEED = '/news/feed.xml';
const LLMS = '/news/llms.txt';
const LLMS_FULL = '/news/llms-full.txt';
const API_CATALOG = '/news/.well-known/api-catalog';
const ARTICLES_SCHEMA = '/news/schemas/articles.schema.json';
const ARTICLES_OPENAPI = '/news/openapi/articles.openapi.json';

export function newsPath(): string {
  return NEWS_ROOT;
}

export function articlesDataPath(): string {
  return DATA_ARTICLES;
}

export function feedPath(): string {
  return FEED;
}

export function llmsPath(): string {
  return LLMS;
}

export function llmsFullPath(): string {
  return LLMS_FULL;
}

export function apiCatalogPath(): string {
  return API_CATALOG;
}

export function articlesSchemaPath(): string {
  return ARTICLES_SCHEMA;
}

export function articlesOpenApiPath(): string {
  return ARTICLES_OPENAPI;
}

export interface NewsArticleRouteInput {
  readonly year: number | string;
  readonly month: number | string;
  readonly entry: string;
}

function pad(value: number | string, size: number): string {
  return String(value).padStart(size, '0');
}

function need(value: string, name: string): string {
  const text = value.trim();

  if (!text) {
    throw new Error(`${name} is required`);
  }

  return text;
}

function tagKey(value: string): string {
  const key = normalizeTagKey(value);

  if (!key) {
    throw new Error('tag key is required');
  }

  return key;
}

function yearPath(year: number | string): string {
  return `/news/${pad(year, 4)}/`;
}

function monthPath(year: number | string, month: number | string): string {
  return `/news/${pad(year, 4)}/${pad(month, 2)}/`;
}

function articlePath(input: NewsArticleRouteInput): string {
  return `${monthPath(input.year, input.month)}${need(input.entry, 'entry')}/`;
}

function tagPath(value: string): string {
  return `/news/tags/${tagKey(value)}/`;
}

export function newsUrl(): string {
  return withBase(NEWS_ROOT);
}

export function newsMarkdownUrl(): string {
  return withBase(NEWS_MARKDOWN);
}

export function newsCanonical(): string {
  return canon(NEWS_ROOT);
}

export function yearUrl(year: number | string): string {
  return withBase(yearPath(year));
}

export function yearMarkdownUrl(year: number | string): string {
  return withBase(`${yearPath(year)}index.md`);
}

export function monthUrl(
  year: number | string,
  month: number | string,
): string {
  return withBase(monthPath(year, month));
}

export function monthMarkdownUrl(
  year: number | string,
  month: number | string,
): string {
  return withBase(`${monthPath(year, month)}index.md`);
}

export function articleUrl(input: NewsArticleRouteInput): string {
  return withBase(articlePath(input));
}

export function articleMarkdownUrl(input: NewsArticleRouteInput): string {
  return withBase(`${articlePath(input)}index.md`);
}

export function articleCanonical(input: NewsArticleRouteInput): string {
  return canon(articlePath(input));
}

export function tagsUrl(): string {
  return withBase(TAGS_ROOT);
}

export function tagsMarkdownUrl(): string {
  return withBase(TAGS_MARKDOWN);
}

export function tagUrl(value: string): string {
  return withBase(tagPath(value));
}

export function tagMarkdownUrl(value: string): string {
  return withBase(`${tagPath(value)}index.md`);
}

export function articlesDataUrl(): string {
  return withBase(DATA_ARTICLES);
}

export function feedUrl(): string {
  return withBase(FEED);
}

export function llmsUrl(): string {
  return withBase(LLMS);
}

export function llmsFullUrl(): string {
  return withBase(LLMS_FULL);
}

export function apiCatalogUrl(): string {
  return withBase(API_CATALOG);
}

export function articlesSchemaUrl(): string {
  return withBase(ARTICLES_SCHEMA);
}

export function articlesOpenApiUrl(): string {
  return withBase(ARTICLES_OPENAPI);
}
