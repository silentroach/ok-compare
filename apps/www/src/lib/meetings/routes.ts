import { canon, withBase } from '@/lib/site';

const MEETINGS_ROOT = '/meetings/';

const need = (value: string, name: string): string => {
  const text = value.trim();

  if (!text) {
    throw new Error(`${name} is required`);
  }

  return text;
};

export const meetingPath = (slug: string): string =>
  `${MEETINGS_ROOT}${need(slug, 'slug')}/`;

export const meetingPattern = (): string => '/meetings/:slug/';

export const meetingUrl = (slug: string): string => withBase(meetingPath(slug));

export const meetingCanonical = (slug: string): string =>
  canon(meetingPath(slug));
