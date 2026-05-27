import { preprocessSiteMarkdownContent } from '../markdown/render';
import type { SiteMentionRegistry } from '../mentions';
import type { RawMeetingFrontmatter, RawMeetingTranscript } from './raw-schema';
import {
  meetingCanonical,
  meetingMarkdownUrl,
  meetingUrl,
  type MeetingRouteInput,
} from './routes';
import type {
  Meeting,
  MeetingDocument,
  MeetingTranscript,
  MeetingTranscriptSegment,
  MeetingTranscriptSpeaker,
} from './types';

export interface RawMeetingEntryLike {
  readonly id: string;
  readonly data: RawMeetingFrontmatter;
  readonly body?: string;
}

export interface MapRawMeetingOptions {
  readonly transcript?: RawMeetingTranscript;
  readonly mentionRegistry?: SiteMentionRegistry;
}

const timecodeSeconds = (value: string): number => {
  const [hours, minutes, seconds] = value.split(':').map(Number);

  return hours * 3600 + minutes * 60 + seconds;
};

const transcriptAnchor = (start: string): string =>
  `t-${start.replaceAll(':', '-')}`;

const optionalList = (
  items: readonly string[] | undefined,
): readonly string[] => (items ? [...items] : []);

const documents = (
  items: readonly MeetingDocument[] | undefined,
): readonly MeetingDocument[] =>
  items?.map((item) => ({ title: item.title, url: item.url })) ?? [];

const routeParts = (
  entry: RawMeetingEntryLike,
): MeetingRouteInput & { readonly routeId: string } => {
  const parts = entry.id.split('/');
  const [date, slug] = parts;

  if (!date || !slug || parts.length !== 2) {
    throw new Error(
      `meeting source id "${entry.id}" must use YYYY-MM-DD/[slug]`,
    );
  }

  if (date !== entry.data.date) {
    throw new Error(
      `meeting source id "${entry.id}" must match frontmatter date "${entry.data.date}"`,
    );
  }

  if (slug !== entry.data.slug) {
    throw new Error(
      `meeting source id "${entry.id}" must match frontmatter slug "${entry.data.slug}"`,
    );
  }

  return { date, slug, routeId: entry.id };
};

function normalizeSpeakers(
  raw: RawMeetingTranscript,
): readonly MeetingTranscriptSpeaker[] {
  return raw.speakers?.map((item) => ({ ...item })) ?? [];
}

function normalizeTranscriptSegment(
  raw: RawMeetingTranscript['segments'][number],
  speakers: ReadonlyMap<string, MeetingTranscriptSpeaker>,
  context: string,
): MeetingTranscriptSegment {
  if (raw.end && timecodeSeconds(raw.end) <= timecodeSeconds(raw.start)) {
    throw new Error(`${context} end must be later than start`);
  }

  const speaker = raw.speaker ? speakers.get(raw.speaker) : undefined;

  if (raw.speaker && !speaker) {
    throw new Error(`${context} references missing speaker "${raw.speaker}"`);
  }

  return {
    start: raw.start,
    end: raw.end,
    anchor: transcriptAnchor(raw.start),
    speaker: raw.speaker,
    speakerLabel: speaker?.name,
    text: raw.text,
  };
}

function normalizeTranscript(
  raw: RawMeetingTranscript,
  context: string,
): MeetingTranscript {
  const speakers = normalizeSpeakers(raw);
  const speakersById = new Map(speakers.map((item) => [item.id, item]));
  const seenAnchors = new Set<string>();
  const segments = raw.segments.map((item, index) => {
    const segment = normalizeTranscriptSegment(
      item,
      speakersById,
      `${context} segments[${index}]`,
    );

    if (seenAnchors.has(segment.anchor)) {
      throw new Error(
        `${context} duplicate transcript anchor "${segment.anchor}"`,
      );
    }

    seenAnchors.add(segment.anchor);

    return segment;
  });

  return { speakers, segments };
}

export function mapRawMeeting(
  entry: RawMeetingEntryLike,
  opts?: MapRawMeetingOptions,
): Meeting {
  const route = routeParts(entry);
  const id = `${route.date}-${route.slug}`;
  const body = preprocessSiteMarkdownContent(
    entry.body ?? '',
    `meeting "${entry.id}" body`,
    opts?.mentionRegistry ?? new Map(),
    { type: 'meeting', slug: id },
  );

  return {
    id,
    routeId: route.routeId,
    date: route.date,
    slug: route.slug,
    title: entry.data.title,
    summary: entry.data.summary,
    url: meetingUrl(route),
    markdownUrl: meetingMarkdownUrl(route),
    canonical: meetingCanonical(route),
    format: entry.data.format,
    sourceUrl: entry.data.source_url,
    recordingUrl: entry.data.video_url,
    highlights: optionalList(entry.data.highlights),
    agenda: optionalList(entry.data.agenda),
    decisions: optionalList(entry.data.decisions),
    actionItems: optionalList(entry.data.action_items),
    questions: optionalList(entry.data.questions),
    participants: optionalList(entry.data.participants),
    documents: documents(entry.data.documents),
    body: body.markdown ? body.markdown : undefined,
    mentions: body.mentions,
    transcript: opts?.transcript
      ? normalizeTranscript(opts.transcript, `meeting "${entry.id}" transcript`)
      : undefined,
  };
}
