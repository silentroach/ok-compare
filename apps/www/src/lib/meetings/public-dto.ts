import { absoluteUrl } from '../site';
import type {
  Meeting,
  MeetingDocument,
  MeetingsDataset,
  MeetingTranscript,
  MeetingTranscriptSegment,
  MeetingTranscriptSpeaker,
} from './types';

export interface MeetingPublicDocument {
  readonly title: string;
  readonly url: string;
}

export interface MeetingPublicTranscriptSpeaker {
  readonly id: string;
  readonly name: string;
  readonly role?: string;
}

export interface MeetingPublicTranscriptSegment {
  readonly start: string;
  readonly end?: string;
  readonly anchor: string;
  readonly speaker?: string;
  readonly speakerLabel?: string;
  readonly text: string;
}

export interface MeetingPublicTranscript {
  readonly speakers: readonly MeetingPublicTranscriptSpeaker[];
  readonly segments: readonly MeetingPublicTranscriptSegment[];
}

export interface MeetingPublicDto {
  readonly id: string;
  readonly date: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly htmlUrl: string;
  readonly markdownUrl: string;
  readonly format?: string;
  readonly sourceUrl?: string;
  readonly recordingUrl?: string;
  readonly highlights?: readonly string[];
  readonly agenda?: readonly string[];
  readonly decisions?: readonly string[];
  readonly actionItems?: readonly string[];
  readonly questions?: readonly string[];
  readonly participants?: readonly string[];
  readonly documents?: readonly MeetingPublicDocument[];
  readonly bodyMarkdown?: string;
  readonly transcript?: MeetingPublicTranscript;
}

export interface MeetingsPublicPayload {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly updatedAt: string;
  readonly totalCount: number;
  readonly meetings: readonly MeetingPublicDto[];
}

export const MEETINGS_PUBLIC_PAYLOAD_SCHEMA_VERSION = '1.0.0';

const fullUrl = (value: string): string => absoluteUrl(value);

const publicDocument = (item: MeetingDocument): MeetingPublicDocument => ({
  title: item.title,
  url: fullUrl(item.url),
});

const publicSpeaker = (
  item: MeetingTranscriptSpeaker,
): MeetingPublicTranscriptSpeaker => ({
  id: item.id,
  name: item.name,
  role: item.role,
});

const publicSegment = (
  item: MeetingTranscriptSegment,
): MeetingPublicTranscriptSegment => ({
  start: item.start,
  end: item.end,
  anchor: item.anchor,
  speaker: item.speaker,
  speakerLabel: item.speakerLabel,
  text: item.text,
});

const publicTranscript = (
  item: MeetingTranscript,
): MeetingPublicTranscript => ({
  speakers: item.speakers.map(publicSpeaker),
  segments: item.segments.map(publicSegment),
});

const optionalList = <T>(items: readonly T[]): readonly T[] | undefined =>
  items.length > 0 ? items : undefined;

function publicMeeting(item: Meeting): MeetingPublicDto {
  return {
    id: item.id,
    date: item.date,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    htmlUrl: item.canonical,
    markdownUrl: fullUrl(item.markdownUrl),
    format: item.format,
    sourceUrl: item.sourceUrl ? fullUrl(item.sourceUrl) : undefined,
    recordingUrl: item.recordingUrl ? fullUrl(item.recordingUrl) : undefined,
    highlights: optionalList(item.highlights),
    agenda: optionalList(item.agenda),
    decisions: optionalList(item.decisions),
    actionItems: optionalList(item.actionItems),
    questions: optionalList(item.questions),
    participants: optionalList(item.participants),
    documents: optionalList(item.documents.map(publicDocument)),
    bodyMarkdown: item.body,
    transcript: item.transcript ? publicTranscript(item.transcript) : undefined,
  };
}

const latestUpdate = (data: MeetingsDataset): string | undefined =>
  data.meetings[0]?.date;

export const toMeetingsPublicPayload = (
  data: MeetingsDataset,
  opts?: { readonly generatedAt?: Date },
): MeetingsPublicPayload => {
  const generatedAt = (opts?.generatedAt ?? new Date()).toISOString();

  return {
    schemaVersion: MEETINGS_PUBLIC_PAYLOAD_SCHEMA_VERSION,
    generatedAt,
    updatedAt: latestUpdate(data) ?? generatedAt,
    totalCount: data.meetings.length,
    meetings: data.meetings.map(publicMeeting),
  };
};
