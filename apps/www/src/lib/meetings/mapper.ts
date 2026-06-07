import type { SiteMentionRegistry } from '@/lib/mentions';

import { parseMeetingTimestamp } from './date';
import type { RawMeeting, RawMeetingTranscript } from './raw-schema';
import { meetingCanonical, meetingUrl } from './routes';
import type {
  Meeting,
  MeetingMoment,
  MeetingSpeaker,
  MeetingTranscriptSegment,
  MeetingTranscriptTime,
} from './types';

export interface RawMeetingEntryInput {
  readonly id: string;
  readonly data: RawMeeting;
}

export interface RawMeetingTranscriptEntryInput {
  readonly id: string;
  readonly data: RawMeetingTranscript;
}

interface MapRawMeetingOptions {
  readonly mentionRegistry: SiteMentionRegistry;
}

const TRANSCRIPT_TIME =
  /^(?<hours>\d{2}):(?<minutes>[0-5]\d):(?<seconds>[0-5]\d)$/;

const parseMoment = (value: string, context: string): MeetingMoment => {
  const timestamp = parseMeetingTimestamp(value);

  if (!timestamp) {
    throw new Error(
      `${context} must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    );
  }

  return {
    at: timestamp.at,
    iso: timestamp.iso,
    hasTime: timestamp.has_time,
  };
};

export const parseMeetingTranscriptTime = (
  value: string,
  context: string,
): MeetingTranscriptTime => {
  const match = value.match(TRANSCRIPT_TIME);

  if (!match?.groups) {
    throw new Error(`${context} must use HH:MM:SS`);
  }

  const hours = Number(match.groups.hours);
  const minutes = Number(match.groups.minutes);
  const seconds = Number(match.groups.seconds);

  return {
    value,
    totalSeconds: hours * 3600 + minutes * 60 + seconds,
  };
};

const mapSpeaker = (
  id: string,
  raw: RawMeetingTranscript['speakers'][string],
  context: string,
  mentionRegistry: SiteMentionRegistry,
): MeetingSpeaker => {
  if ('person' in raw) {
    const target = mentionRegistry.get(raw.person);

    if (!target || target.type !== 'person') {
      throw new Error(`${context} references unknown person "${raw.person}"`);
    }

    const speaker: MeetingSpeaker = {
      id,
      kind: 'person',
      label: target.label,
      personSlug: target.slug,
      url: target.htmlUrl,
    };

    return target.linkTitle
      ? {
          ...speaker,
          description: target.linkTitle,
        }
      : speaker;
  }

  return {
    id,
    kind: 'local',
    label: raw.name,
  };
};

const segmentAnchor = (
  start: MeetingTranscriptTime,
  anchorCounts: Map<string, number>,
): string => {
  const base = `t-${start.value.replaceAll(':', '-')}`;
  const count = (anchorCounts.get(base) ?? 0) + 1;

  anchorCounts.set(base, count);

  return count === 1 ? base : `${base}-${count}`;
};

const mapSegment = (
  raw: RawMeetingTranscript['segments'][number],
  index: number,
  speakers: ReadonlyMap<string, MeetingSpeaker>,
  anchorCounts: Map<string, number>,
  previousStart?: MeetingTranscriptTime,
): MeetingTranscriptSegment => {
  const context = `meeting transcript segment ${index}`;
  const speaker = speakers.get(raw.speaker);

  if (!speaker) {
    throw new Error(`${context} references unknown speaker "${raw.speaker}"`);
  }

  const start = parseMeetingTranscriptTime(raw.start, `${context} start`);
  const end = raw.end
    ? parseMeetingTranscriptTime(raw.end, `${context} end`)
    : undefined;

  if (end && end.totalSeconds < start.totalSeconds) {
    throw new Error(`${context} end cannot be earlier than start`);
  }

  if (previousStart && start.totalSeconds < previousStart.totalSeconds) {
    throw new Error(`${context} start cannot be earlier than previous segment`);
  }

  return {
    anchor: segmentAnchor(start, anchorCounts),
    start,
    end,
    speakerId: raw.speaker,
    speaker,
    text: raw.text,
  };
};

export const mapRawMeeting = (
  entry: RawMeetingEntryInput,
  transcriptEntry: RawMeetingTranscriptEntryInput,
  opts: MapRawMeetingOptions,
): Meeting => {
  if (entry.id !== transcriptEntry.id) {
    throw new Error(
      `meeting "${entry.id}" transcript id must match entry id "${transcriptEntry.id}"`,
    );
  }

  const date = parseMoment(entry.data.date, `meeting "${entry.id}" date`);
  const updatedAt = entry.data.updated_at
    ? parseMoment(entry.data.updated_at, `meeting "${entry.id}" updated_at`)
    : undefined;

  if (updatedAt && updatedAt.at.valueOf() < date.at.valueOf()) {
    throw new Error(
      `meeting "${entry.id}" updated_at cannot be earlier than date`,
    );
  }

  const speakerList = Object.entries(transcriptEntry.data.speakers).map(
    ([id, raw]) =>
      mapSpeaker(
        id,
        raw,
        `meeting "${entry.id}" speaker "${id}"`,
        opts.mentionRegistry,
      ),
  );
  const speakers = new Map(speakerList.map((speaker) => [speaker.id, speaker]));
  const anchorCounts = new Map<string, number>();
  let previousStart: MeetingTranscriptTime | undefined;
  const segments = transcriptEntry.data.segments.map((raw, index) => {
    const segment = mapSegment(
      raw,
      index,
      speakers,
      anchorCounts,
      previousStart,
    );

    previousStart = segment.start;
    return segment;
  });

  return {
    id: entry.id,
    slug: entry.id,
    title: entry.data.title,
    date,
    updatedAt,
    context: entry.data.context,
    sourceUrl: entry.data.source_url,
    url: meetingUrl(entry.id),
    canonical: meetingCanonical(entry.id),
    transcript: {
      speakers: speakerList,
      segments,
    },
  } satisfies Meeting;
};
