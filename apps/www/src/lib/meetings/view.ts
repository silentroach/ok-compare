import { dateTimeFromISO } from '@shelkovo/format';
import { formatDynamicHtml } from '@shelkovo/markdown';

import type {
  Meeting,
  MeetingMoment,
  MeetingSpeaker,
  MeetingTranscriptTime,
} from './types';

const META_DESCRIPTION_LIMIT = 170;
const SPACE = /\s+/gu;
const LINE_BREAK = /\r\n|\r|\n/gu;

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeMetaText = (value: string): string => value.replace(SPACE, ' ');

const trimMetaDescription = (value: string): string => {
  if (value.length <= META_DESCRIPTION_LIMIT) {
    return value;
  }

  const textLimit = META_DESCRIPTION_LIMIT - 3;
  const trimmed = value.slice(0, textLimit + 1);
  const lastSpace = trimmed.lastIndexOf(' ');
  const cut =
    lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed.slice(0, textLimit);

  return `${cut.replace(/[,.!?;:]$/u, '')}...`;
};

const transcriptSourcePhrase = (meeting: Meeting): string =>
  meeting.sourceUrl
    ? 'Полная транскрипция встречи с временными отметками и ссылкой на источник.'
    : 'Полная транскрипция встречи с временными отметками в архиве.';

export const formatMeetingDate = (date: MeetingMoment): string => {
  const value = dateTimeFromISO(date.iso);
  const visibleDate = value.toFormat('d MMMM yyyy');

  return date.hasTime
    ? `${visibleDate}, ${value.toFormat('HH:mm')}`
    : visibleDate;
};

export const formatMeetingMetaDate = (date: MeetingMoment): string =>
  date.hasTime ? date.iso : date.iso.slice(0, 10);

export const describeMeeting = (meeting: Meeting): string => {
  const context = normalizeMetaText(meeting.context).trim();
  const description =
    context.length < 80
      ? `${context} ${transcriptSourcePhrase(meeting)}`
      : context;

  return trimMetaDescription(description);
};

export const formatTranscriptTime = (time: MeetingTranscriptTime): string =>
  time.value;

export const formatMeetingSpeakerAnchor = (
  speaker: Pick<MeetingSpeaker, 'id'>,
): string => `speaker-${speaker.id}`;

export const formatTranscriptTextHtml = (text: string): string =>
  formatDynamicHtml(escapeHtml(text)).replace(LINE_BREAK, '<br>');
