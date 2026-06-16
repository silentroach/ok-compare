import { canon, withBase } from '@/lib/site';

const KB_ROOT = '/kb/';
const KB_ROUTE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const routeSlug = (value: string): string => {
  const slug = value.trim().replace(/^\/+|\/+$/gu, '');

  if (!slug) {
    throw new Error('kb detail slug is required');
  }

  for (const segment of slug.split('/')) {
    if (!KB_ROUTE_SEGMENT.test(segment)) {
      throw new Error(
        `kb detail slug segment "${segment}" must use lower-case Latin letters, digits, and hyphen`,
      );
    }
  }

  return slug;
};

export const kbPath = (): string => KB_ROOT;

export const kbDetailPath = (slug: string): string =>
  `${KB_ROOT}${routeSlug(slug)}/`;

export const kbDetailPattern = (): string => '/kb/:slug.../';

export const kbUrl = (): string => withBase(kbPath());

export const kbDetailUrl = (slug: string): string =>
  withBase(kbDetailPath(slug));

export const kbCanonical = (): string => canon(kbPath());

export const kbDetailCanonical = (slug: string): string =>
  canon(kbDetailPath(slug));
