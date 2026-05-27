import { formatDate } from '@shelkovo/format';

import type { Meeting, MeetingMetaItem } from './types';

export const MEETING_PROSE = 'ui-prose max-w-[70ch]';

const hasItems = (items: readonly unknown[]): boolean => items.length > 0;

export const formatMeetingDate = (value: string): string => formatDate(value);

export const hasMeetingSummary = (meeting: Meeting): boolean =>
  meeting.summary.trim().length > 0 ||
  hasItems(meeting.highlights) ||
  hasItems(meeting.decisions) ||
  hasItems(meeting.questions);

export const hasMeetingProtocol = (meeting: Meeting): boolean =>
  hasItems(meeting.agenda) ||
  hasItems(meeting.decisions) ||
  hasItems(meeting.actionItems) ||
  hasItems(meeting.questions);

export const hasMeetingRecording = (meeting: Meeting): boolean =>
  Boolean(meeting.recordingUrl) || Boolean(meeting.transcript?.segments.length);

export const meetingDescription = (meeting: Meeting): string =>
  meeting.summary.trim().length > 0
    ? meeting.summary
    : `Материалы встречи от ${formatMeetingDate(meeting.date)}: протокол, запись и расшифровка, если они опубликованы.`;

export const describeMeetingMeta = (
  meeting: Meeting,
): readonly MeetingMetaItem[] => {
  const items: MeetingMetaItem[] = [
    {
      label: 'Дата',
      value: formatMeetingDate(meeting.date),
    },
  ];

  if (meeting.format) {
    items.push({ label: 'Формат', value: meeting.format });
  }

  if (meeting.participants.length > 0) {
    items.push({ label: 'Участники', value: meeting.participants.join(', ') });
  }

  if (meeting.sourceUrl) {
    items.push({
      label: 'Источник',
      value: 'открыть источник',
      href: meeting.sourceUrl,
    });
  }

  return items;
};
