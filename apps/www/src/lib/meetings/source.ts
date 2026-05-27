import { normalizeMeetingDate } from './raw-schema';

const MEETING_ENTRY = /^([^/]+)\/([^/]+)\/index\.md$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const hasMeetingDate = (
  data: unknown,
): data is { readonly date: string | Date } =>
  typeof data === 'object' &&
  data !== null &&
  'date' in data &&
  (typeof data.date === 'string' || data.date instanceof Date);

const hasMeetingSlug = (data: unknown): data is { readonly slug: string } =>
  typeof data === 'object' &&
  data !== null &&
  'slug' in data &&
  typeof data.slug === 'string';

const failMeetingSource = (entry: string, reason: string): never => {
  throw new Error(`meeting source path "${entry}" ${reason}`);
};

export const createMeetingSourceId = (entry: string, data: unknown): string => {
  const match = MEETING_ENTRY.exec(entry);

  if (!match) {
    throw new Error(
      `meeting source path "${entry}" must resolve to YYYY-MM-DD/[slug]/index.md`,
    );
  }

  const date = match[1];
  const slug = match[2];

  if (!normalizeMeetingDate(date)) {
    failMeetingSource(entry, 'date directory must use YYYY-MM-DD');
  }

  if (!SLUG.test(slug)) {
    failMeetingSource(
      entry,
      'slug must use lower-case Latin letters, digits, and hyphen',
    );
  }

  const frontmatterDate = hasMeetingDate(data)
    ? normalizeMeetingDate(data.date)
    : undefined;

  if (frontmatterDate && frontmatterDate !== date) {
    failMeetingSource(entry, 'must match the frontmatter date');
  }

  if (hasMeetingSlug(data) && data.slug !== slug) {
    failMeetingSource(entry, 'must match the frontmatter slug');
  }

  return `${date}/${slug}`;
};
