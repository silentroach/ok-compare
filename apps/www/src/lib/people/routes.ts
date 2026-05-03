import { canon, withBase } from '../site';

const PEOPLE_ROOT = '/people/';

const need = (value: string, name: string): string => {
  const text = value.trim();

  if (!text) {
    throw new Error(`${name} is required`);
  }

  return text;
};

export const personPath = (slug: string): string =>
  `${PEOPLE_ROOT}${need(slug, 'slug')}/`;

export const personMarkdownPath = (slug: string): string =>
  `${personPath(slug)}index.md`;

export const personUrl = (slug: string): string => withBase(personPath(slug));

export const personMarkdownUrl = (slug: string): string =>
  withBase(personMarkdownPath(slug));

export const personCanonical = (slug: string): string =>
  canon(personPath(slug));
