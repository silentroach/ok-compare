export const NEWS_AREAS = ['river', 'forest', 'park', 'village'] as const;

export const NEWS_AUTHOR_KINDS = [
  'official',
  'community',
  'editorial',
  'other',
] as const;

const SPACE = /\s+/g;
const SCHEME = /^[a-z][a-z\d+.-]*:/i;

export function normalizeTagKey(tag: string): string {
  return tag.trim().toLowerCase().replace(SPACE, ' ').replaceAll(' ', '-');
}

export function isAbsoluteUrl(value: string): boolean {
  return SCHEME.test(value) || value.startsWith('//');
}

export function isAttachmentUrl(value: string): boolean {
  return isAbsoluteUrl(value) || value.startsWith('/');
}
