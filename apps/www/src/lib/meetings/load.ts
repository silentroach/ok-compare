import type { CollectionEntry } from 'astro:content';

import { compareRuText } from '@shelkovo/format';

import type { SiteMentionRegistry } from '@/lib/mentions';
import { loadPeopleMentionRegistry } from '@/lib/people/registry';

import { mapRawMeeting } from './mapper';
import type { Meeting, MeetingsDataset } from './types';

export type MeetingEntry = Pick<
  CollectionEntry<'meetingEntries'>,
  'id' | 'data'
>;
export type MeetingTranscriptEntry = Pick<
  CollectionEntry<'meetingTranscripts'>,
  'id' | 'data'
>;

let cache: Promise<MeetingsDataset> | undefined;

const compareMeetingsDesc = (a: Meeting, b: Meeting): number => {
  const date = b.date.at.valueOf() - a.date.at.valueOf();

  if (date) {
    return date;
  }

  return compareRuText(a.title, b.title) || compareRuText(a.slug, b.slug);
};

const transcriptMap = (
  transcripts: readonly MeetingTranscriptEntry[],
): ReadonlyMap<string, MeetingTranscriptEntry> => {
  const byId = new Map(transcripts.map((entry) => [entry.id, entry]));

  if (byId.size !== transcripts.length) {
    throw new Error('duplicate meeting transcript id');
  }

  return byId;
};

export const buildMeetingsDataset = (
  entries: readonly MeetingEntry[],
  transcripts: readonly MeetingTranscriptEntry[],
  opts?: {
    readonly mentionRegistry?: SiteMentionRegistry;
  },
): MeetingsDataset => {
  const mentionRegistry = opts?.mentionRegistry ?? new Map();
  const transcriptsById = transcriptMap(transcripts);
  const entryIds = new Set(entries.map((entry) => entry.id));

  for (const transcript of transcripts) {
    if (!entryIds.has(transcript.id)) {
      throw new Error(
        `meeting transcript "${transcript.id}" has no matching entry`,
      );
    }
  }

  const meetings = entries
    .map((entry) => {
      const transcript = transcriptsById.get(entry.id);

      if (!transcript) {
        throw new Error(`meeting "${entry.id}" has no matching transcript`);
      }

      return mapRawMeeting(entry, transcript, { mentionRegistry });
    })
    .sort(compareMeetingsDesc);

  return {
    meetings,
    bySlug: new Map(meetings.map((meeting) => [meeting.slug, meeting])),
  };
};

const buildMeetingsData = async (): Promise<MeetingsDataset> => {
  const [{ getCollection }, mentionRegistry] = await Promise.all([
    import('astro:content'),
    loadPeopleMentionRegistry(),
  ]);
  const [entries, transcripts] = await Promise.all([
    getCollection('meetingEntries') as Promise<readonly MeetingEntry[]>,
    getCollection('meetingTranscripts') as Promise<
      readonly MeetingTranscriptEntry[]
    >,
  ]);

  return buildMeetingsDataset(entries, transcripts, { mentionRegistry });
};

export const loadMeetingsData = (): Promise<MeetingsDataset> => {
  cache ??= buildMeetingsData();

  return cache;
};

export const loadMeetings = async (): Promise<readonly Meeting[]> =>
  (await loadMeetingsData()).meetings;

export const loadMeeting = async (
  slug: string,
): Promise<Meeting | undefined> => {
  const normalized = slug.trim();

  if (!normalized) {
    return undefined;
  }

  return (await loadMeetingsData()).bySlug.get(normalized);
};
