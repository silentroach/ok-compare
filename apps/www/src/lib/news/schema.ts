import { isAbsoluteUrl } from '@shelkovo/url';

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

const SPACE = /\s+/g;

export const normalizeTagLabel = (tag: string): string =>
  tag.trim().replace(SPACE, ' ');

export const normalizeTagKey = (tag: string): string =>
  normalizeTagLabel(tag).toLowerCase().replaceAll(' ', '-');

export const isAttachmentUrl = (value: string): boolean =>
  isAbsoluteUrl(value) || value.startsWith('/');
