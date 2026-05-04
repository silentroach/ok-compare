import { isAbsoluteUrl } from '@shelkovo/url';

import type { PersonMentionTarget } from '../people/mentions';

export { isAbsoluteUrl };

export const NEWS_AREAS = ['river', 'forest', 'park', 'village'] as const;
export type NewsArea = (typeof NEWS_AREAS)[number];

export const NEWS_AUTHOR_KINDS = [
  'official',
  'community',
  'editorial',
  'other',
] as const;
export type NewsAuthorKind = (typeof NEWS_AUTHOR_KINDS)[number];

export const NEWS_DEFAULT_ADDENDUM_AUTHOR_ID = 'ig';

export interface NewsAuthor {
  readonly id: string;
  readonly name: string;
  readonly kind: NewsAuthorKind;
  readonly short_name?: string;
  readonly url?: string;
  readonly role?: string;
  readonly is_official: boolean;
}

export interface NewsTag {
  readonly label: string;
  readonly key: string;
  readonly url: string;
}

export interface NewsPhoto {
  readonly url: string;
  readonly alt: string;
  readonly caption?: string;
}

export interface NewsAttachment {
  readonly title: string;
  readonly url: string;
  readonly type?: string;
  readonly size?: string;
}

export interface NewsEventCoordinates {
  readonly lat: number;
  readonly lng: number;
}

export interface NewsEvent {
  readonly title: string;
  readonly starts_at: Date;
  readonly starts_iso: string;
  readonly starts_time: string;
  readonly ends_at: Date;
  readonly ends_iso: string;
  readonly ends_time: string;
  readonly ics_url: string;
  readonly location?: string;
  readonly coordinates?: NewsEventCoordinates;
}

export interface NewsAddendum {
  readonly title?: string;
  readonly time?: string;
  readonly author: NewsAuthor;
  readonly source_url?: string;
  readonly body?: string;
  readonly photos: readonly NewsPhoto[];
  readonly attachments: readonly NewsAttachment[];
  readonly published_at: Date;
  readonly published_iso: string;
  readonly mentions: readonly PersonMentionTarget[];
}

export interface NewsArticle {
  readonly id: string;
  readonly title: string;
  readonly seo_title?: string;
  readonly seo_description?: string;
  readonly author: NewsAuthor;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly entry: string;
  readonly url: string;
  readonly markdown_url: string;
  readonly canonical: string;
  readonly published_at: Date;
  readonly published_iso: string;
  readonly time?: string;
  readonly updated_at?: Date;
  readonly updated_iso?: string;
  readonly is_official: boolean;
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly NewsArea[];
  readonly tags: readonly NewsTag[];
  readonly pinned: boolean;
  readonly source_url?: string;
  readonly cover_url?: string;
  readonly cover_alt?: string;
  readonly cover_width?: number;
  readonly cover_height?: number;
  readonly photos: readonly NewsPhoto[];
  readonly attachments: readonly NewsAttachment[];
  readonly event?: NewsEvent;
  readonly addenda: readonly NewsAddendum[];
  readonly summary: string;
  readonly body: string;
  readonly has_addenda: boolean;
  readonly mentions: readonly PersonMentionTarget[];
}

export interface NewsListArticle {
  readonly id: string;
  readonly title: string;
  readonly author: NewsAuthor;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly entry: string;
  readonly url: string;
  readonly markdown_url: string;
  readonly canonical: string;
  readonly published_at: Date;
  readonly published_iso: string;
  readonly time?: string;
  readonly updated_at?: Date;
  readonly updated_iso?: string;
  readonly is_official: boolean;
  readonly applies_to_all_areas: boolean;
  readonly areas: readonly NewsArea[];
  readonly tags: readonly NewsTag[];
  readonly pinned: boolean;
  readonly source_url?: string;
  readonly cover_url?: string;
  readonly cover_alt?: string;
  readonly cover_width?: number;
  readonly cover_height?: number;
  readonly summary: string;
  readonly event?: NewsEvent;
  readonly has_addenda: boolean;
}

export interface NewsMonthArchive {
  readonly id: string;
  readonly year: number;
  readonly month: number;
  readonly url: string;
  readonly markdown_url: string;
  readonly count: number;
  readonly articles: readonly NewsListArticle[];
}

export interface NewsYearArchive {
  readonly year: number;
  readonly url: string;
  readonly markdown_url: string;
  readonly count: number;
  readonly months: readonly NewsMonthArchive[];
}

export interface NewsArchives {
  readonly years: readonly NewsYearArchive[];
  readonly by_year: ReadonlyMap<number, NewsYearArchive>;
  readonly by_month: ReadonlyMap<string, NewsMonthArchive>;
}

export interface NewsTagPage {
  readonly id: string;
  readonly label: string;
  readonly key: string;
  readonly url: string;
  readonly markdown_url: string;
  readonly count: number;
  readonly latest: readonly NewsListArticle[];
}

export interface NewsHomeData {
  readonly pinned: readonly NewsListArticle[];
  readonly latest: readonly NewsListArticle[];
}

export interface NewsDataset {
  readonly articles: readonly NewsArticle[];
  readonly home: NewsHomeData;
  readonly archives: NewsArchives;
  readonly tags: readonly NewsTagPage[];
  readonly by_id: ReadonlyMap<string, NewsArticle>;
  readonly by_tag: ReadonlyMap<string, NewsTagPage>;
}

const SPACE = /\s+/g;

export const normalizeTagLabel = (tag: string): string =>
  tag.trim().replace(SPACE, ' ');

export const normalizeTagKey = (tag: string): string =>
  normalizeTagLabel(tag).toLowerCase().replaceAll(' ', '-');

export const isAttachmentUrl = (value: string): boolean =>
  isAbsoluteUrl(value) || value.startsWith('/');
