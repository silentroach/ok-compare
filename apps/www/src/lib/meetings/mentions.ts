import { extractFirstMarkdownText } from '@shelkovo/markdown';

import { createSiteMentionRegistry } from '../mentions/normalize';
import { createEntityMentionSourceRefs } from '../mentions/source-refs';
import type {
  EntityMentionSourceRef,
  EntityMentionTarget,
  SiteMentionRegistry,
} from '../mentions/types';
import type { RawMeetingFrontmatter } from './raw-schema';
import { meetingMarkdownUrl, meetingUrl } from './routes';
import type { Meeting } from './types';

export interface MeetingMentionTarget extends EntityMentionTarget {
  readonly type: 'meeting';
  readonly title: string;
  readonly date: string;
}

interface RawMeetingMentionEntryLike {
  readonly id: string;
  readonly data: RawMeetingFrontmatter;
}

type MeetingMentionRefSource = Pick<
  Meeting,
  | 'id'
  | 'routeId'
  | 'date'
  | 'slug'
  | 'title'
  | 'url'
  | 'markdownUrl'
  | 'body'
  | 'mentions'
>;

const SPACE = /\s+/gu;

const excerpt = (markdown: string | undefined): string | undefined => {
  if (!markdown) {
    return undefined;
  }

  const first = extractFirstMarkdownText(markdown);

  return first ? first.replace(SPACE, ' ').trim() : undefined;
};

export const createMeetingMentionTarget = (
  entry: RawMeetingMentionEntryLike,
): MeetingMentionTarget => {
  const slug = `${entry.data.date}-${entry.data.slug}`;
  const route = { date: entry.data.date, slug: entry.data.slug };

  return {
    type: 'meeting',
    slug,
    label: entry.data.title,
    title: entry.data.title,
    date: entry.data.date,
    htmlUrl: meetingUrl(route),
    markdownUrl: meetingMarkdownUrl(route),
  };
};

export const createMeetingMentionRegistry = (
  entries: readonly RawMeetingMentionEntryLike[],
): SiteMentionRegistry =>
  createSiteMentionRegistry(entries.map(createMeetingMentionTarget));

export const createMeetingMentionRefs = (
  meeting: MeetingMentionRefSource,
): readonly EntityMentionSourceRef[] =>
  createEntityMentionSourceRefs(meeting.mentions, {
    source: {
      section: 'meetings',
      kind: 'meeting',
      id: meeting.id,
    },
    sourceEntity: { type: 'meeting', slug: meeting.id },
    title: meeting.title,
    htmlUrl: meeting.url,
    markdownUrl: meeting.markdownUrl,
    excerpt: excerpt(meeting.body),
    mentionedAt: `${meeting.date}T00:00:00.000+03:00`,
    sortKey: Date.parse(`${meeting.date}T00:00:00.000+03:00`),
  });
