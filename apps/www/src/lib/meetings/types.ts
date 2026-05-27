import type { PreprocessedSiteMarkdownBody } from '../markdown/render';
import type { EntityMentionTarget } from '../mentions';

export interface MeetingDocument {
  readonly title: string;
  readonly url: string;
}

export interface MeetingTranscriptSpeaker {
  readonly id: string;
  readonly name: string;
  readonly role?: string;
}

export interface MeetingTranscriptSegment {
  readonly start: string;
  readonly end?: string;
  readonly anchor: string;
  readonly speaker?: string;
  readonly speakerLabel?: string;
  readonly text: string;
}

export interface MeetingTranscript {
  readonly speakers: readonly MeetingTranscriptSpeaker[];
  readonly segments: readonly MeetingTranscriptSegment[];
}

export interface Meeting {
  readonly id: string;
  readonly routeId: string;
  readonly date: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly url: string;
  readonly markdownUrl: string;
  readonly canonical: string;
  readonly format?: string;
  readonly sourceUrl?: string;
  readonly recordingUrl?: string;
  readonly highlights: readonly string[];
  readonly agenda: readonly string[];
  readonly decisions: readonly string[];
  readonly actionItems: readonly string[];
  readonly questions: readonly string[];
  readonly participants: readonly string[];
  readonly documents: readonly MeetingDocument[];
  readonly body?: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly EntityMentionTarget[];
  readonly transcript?: MeetingTranscript;
}

export interface MeetingsDataset {
  readonly meetings: readonly Meeting[];
  readonly byId: ReadonlyMap<string, Meeting>;
  readonly byRouteId: ReadonlyMap<string, Meeting>;
}

export interface MeetingMetaItem {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}
