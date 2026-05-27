import { compareRuText } from '@shelkovo/format';
import type { CollectionEntry } from 'astro:content';

import type { SiteMentionRegistry } from '../mentions';
import {
  RawMeetingTranscriptSchema,
  type RawMeetingTranscript,
} from './raw-schema';
import { mapRawMeeting } from './mapper';
import { createMeetingMentionRegistry } from './mentions';
import type { Meeting, MeetingsDataset } from './types';

export type MeetingEntry = Pick<
  CollectionEntry<'meetings'>,
  'id' | 'data' | 'body'
>;

export interface BuildMeetingsDatasetOptions {
  readonly transcripts?: ReadonlyMap<string, RawMeetingTranscript>;
  readonly mentionRegistry?: SiteMentionRegistry;
}

let cache: Promise<MeetingsDataset> | undefined;

const compareMeetings = (a: Meeting, b: Meeting): number => {
  const date = b.date.localeCompare(a.date);

  if (date) {
    return date;
  }

  return compareRuText(a.title, b.title) || compareRuText(a.id, b.id);
};

const transcriptKey = (entry: MeetingEntry): string | undefined => {
  const transcript = entry.data.transcript;

  if (!transcript) {
    return undefined;
  }

  if (transcript.includes('/') || transcript.includes('\\')) {
    throw new Error(
      `meeting "${entry.id}" transcript must reference a file next to index.md`,
    );
  }

  return `${entry.id}/${transcript}`;
};

function validateUniqueIds(items: readonly Meeting[]): void {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`duplicate meeting id "${item.id}"`);
    }

    seen.add(item.id);
  }
}

function validateUniqueEntryMentionIds(entries: readonly MeetingEntry[]): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    const id = `${entry.data.date}-${entry.data.slug}`;

    if (seen.has(id)) {
      throw new Error(`duplicate meeting id "${id}"`);
    }

    seen.add(id);
  }
}

export function buildMeetingsDataset(
  entries: readonly MeetingEntry[],
  opts?: BuildMeetingsDatasetOptions,
): MeetingsDataset {
  const transcripts = opts?.transcripts ?? new Map();
  validateUniqueEntryMentionIds(entries);

  const mentionRegistry =
    opts?.mentionRegistry ?? createMeetingMentionRegistry(entries);
  const meetings = entries
    .map((entry) => {
      const key = transcriptKey(entry);
      const transcript = key ? transcripts.get(key) : undefined;

      if (key && !transcript) {
        throw new Error(
          `meeting "${entry.id}" references missing transcript "${key}"`,
        );
      }

      return mapRawMeeting(entry, {
        transcript,
        mentionRegistry,
      });
    })
    .sort(compareMeetings);

  validateUniqueIds(meetings);

  return {
    meetings,
    byId: new Map(meetings.map((item) => [item.id, item])),
    byRouteId: new Map(meetings.map((item) => [item.routeId, item])),
  };
}

const transcriptModules = import.meta.glob<RawMeetingTranscript>(
  '../../data/meetings/**/transcript.yaml',
  {
    eager: true,
    import: 'default',
  },
);

const loadTranscriptMap = (): ReadonlyMap<string, RawMeetingTranscript> =>
  new Map(
    Object.entries(transcriptModules).map(([path, raw]) => [
      path.replace('../../data/meetings/', ''),
      RawMeetingTranscriptSchema.parse(raw),
    ]),
  );

async function buildMeetingsData(): Promise<MeetingsDataset> {
  const { getCollection } = await import('astro:content');
  const [{ loadSiteMentionRegistry }, entries] = await Promise.all([
    import('../mentions/site-registry'),
    getCollection('meetings') as Promise<readonly MeetingEntry[]>,
  ]);

  return buildMeetingsDataset(entries, {
    transcripts: loadTranscriptMap(),
    mentionRegistry: await loadSiteMentionRegistry(),
  });
}

export const loadMeetingsData = (): Promise<MeetingsDataset> => {
  cache ??= buildMeetingsData();
  return cache;
};

export const loadMeetings = async (): Promise<readonly Meeting[]> =>
  (await loadMeetingsData()).meetings;

export const loadMeeting = async (id: string): Promise<Meeting | undefined> =>
  (await loadMeetingsData()).byId.get(id);

export const loadMeetingByRouteId = async (
  routeId: string,
): Promise<Meeting | undefined> =>
  (await loadMeetingsData()).byRouteId.get(routeId);
