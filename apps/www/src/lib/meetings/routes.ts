import { canon, withBase } from '../site';

const MEETINGS_ROOT = '/meetings/';
const MEETINGS_DATA = '/meetings/data/meetings.json';
const MEETINGS_LLMS = '/meetings/llms.txt';
const MEETINGS_LLMS_FULL = '/meetings/llms-full.txt';

export interface MeetingRouteInput {
  readonly date: string;
  readonly slug: string;
}

const need = (value: string, name: string): string => {
  const text = value.trim();

  if (!text) {
    throw new Error(`${name} is required`);
  }

  return text;
};

export const meetingsPath = (): string => MEETINGS_ROOT;

export const meetingPath = (input: MeetingRouteInput): string =>
  `${MEETINGS_ROOT}${need(input.date, 'date')}/${need(input.slug, 'slug')}/`;

export const meetingMarkdownPath = (input: MeetingRouteInput): string =>
  `${meetingPath(input)}index.md`;

export const meetingsDataPath = (): string => MEETINGS_DATA;

export const meetingsLlmsPath = (): string => MEETINGS_LLMS;

export const meetingsLlmsFullPath = (): string => MEETINGS_LLMS_FULL;

export const meetingPattern = (): string => '/meetings/:date/:slug/';

export const meetingMarkdownPattern = (): string =>
  '/meetings/:date/:slug/index.md';

export const meetingsUrl = (): string => withBase(MEETINGS_ROOT);

export const meetingUrl = (input: MeetingRouteInput): string =>
  withBase(meetingPath(input));

export const meetingMarkdownUrl = (input: MeetingRouteInput): string =>
  withBase(meetingMarkdownPath(input));

export const meetingsDataUrl = (): string => withBase(MEETINGS_DATA);

export const meetingsLlmsUrl = (): string => withBase(MEETINGS_LLMS);

export const meetingsLlmsFullUrl = (): string => withBase(MEETINGS_LLMS_FULL);

export const meetingsCanonical = (): string => canon(MEETINGS_ROOT);

export const meetingCanonical = (input: MeetingRouteInput): string =>
  canon(meetingPath(input));
