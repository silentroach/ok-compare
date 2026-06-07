import { count } from '@shelkovo/format';
import {
  createMarkdownDocument,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

import { absoluteUrl } from '@/lib/site';

import {
  meetingMarkdownPath,
  meetingTranscriptPartMarkdownPath,
  meetingsMarkdownPath,
} from './routes';
import type {
  Meeting,
  MeetingSpeaker,
  MeetingTranscriptPart,
  MeetingTranscriptSegment,
} from './types';
import {
  formatMeetingDate,
  formatTranscriptPartLabel,
  formatTranscriptTime,
} from './view';

export const MEETINGS_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];
type MarkdownListItem = ReturnType<typeof md.listItem>;

const serialize = (children: readonly MarkdownNode[]): string =>
  serializeMarkdownDocument(createMarkdownDocument({ children }));

const inline = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const abs = (path: string): string => absoluteUrl(path);

const linkedItem = (label: string, url: string): MarkdownListItem =>
  md.listItem([md.paragraph([md.link(url, label), md.text('.')])]);

const segmentCount = (meeting: Meeting): string =>
  count(meeting.transcript.segments.length, [
    'фрагмент транскрипта',
    'фрагмента транскрипта',
    'фрагментов транскрипта',
  ]);

const partsCount = (meeting: Meeting): string =>
  count(meeting.transcript.parts.length, ['часть', 'части', 'частей']);

const partSegmentCount = (part: MeetingTranscriptPart): string =>
  count(part.segments.length, ['фрагмент', 'фрагмента', 'фрагментов']);

const partRange = (part: MeetingTranscriptPart): string => {
  const first = part.segments[0];
  const last = part.segments.at(-1);

  return first && last
    ? `${formatTranscriptTime(first.start)}-${formatTranscriptTime(last.start)}`
    : 'без таймкодов';
};

const meetingLine = (meeting: Meeting): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(abs(meetingMarkdownPath(meeting.slug)), meeting.title),
      md.text(
        ` — ${formatMeetingDate(meeting.date)}; ${partsCount(meeting)}, ${segmentCount(meeting)}.`,
      ),
    ]),
    md.paragraph(inline(meeting.context)),
  ]);

const speakerLine = (speaker: MeetingSpeaker): MarkdownListItem => {
  const label = speaker.url
    ? [md.link(abs(speaker.url), speaker.label)]
    : [md.text(speaker.label)];

  return md.listItem([
    md.paragraph([
      ...label,
      ...(speaker.description
        ? [md.text(` — ${inline(speaker.description)}`)]
        : []),
    ]),
  ]);
};

const transcriptPartLine = (
  meeting: Meeting,
  part: MeetingTranscriptPart,
): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(
        abs(meetingTranscriptPartMarkdownPath(meeting.slug, part.index)),
        formatTranscriptPartLabel(part),
      ),
      md.text(` — ${partSegmentCount(part)}; ${partRange(part)}.`),
    ]),
  ]);

const segmentLine = (
  meeting: Meeting,
  segment: MeetingTranscriptSegment,
): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(
        abs(`${meeting.url}#${segment.anchor}`),
        formatTranscriptTime(segment.start),
      ),
      md.text(` — ${segment.speaker.label}: ${inline(segment.text)}`),
    ]),
  ]);

const navigationItems = (
  meeting: Meeting,
  part: MeetingTranscriptPart,
): readonly MarkdownListItem[] => {
  const previous = meeting.transcript.parts.find(
    (item) => item.index === part.index - 1,
  );
  const next = meeting.transcript.parts.find(
    (item) => item.index === part.index + 1,
  );

  return [
    md.listItem([
      md.paragraph([
        md.link(abs(meeting.url), 'HTML-страница встречи'),
        md.text('.'),
      ]),
    ]),
    md.listItem([
      md.paragraph([
        md.link(abs(meetingMarkdownPath(meeting.slug)), 'Описание встречи'),
        md.text('.'),
      ]),
    ]),
    ...(previous
      ? [
          md.listItem([
            md.paragraph([
              md.link(
                abs(
                  meetingTranscriptPartMarkdownPath(
                    meeting.slug,
                    previous.index,
                  ),
                ),
                `Предыдущая часть: ${formatTranscriptPartLabel(previous)}`,
              ),
              md.text('.'),
            ]),
          ]),
        ]
      : []),
    ...(next
      ? [
          md.listItem([
            md.paragraph([
              md.link(
                abs(
                  meetingTranscriptPartMarkdownPath(meeting.slug, next.index),
                ),
                `Следующая часть: ${formatTranscriptPartLabel(next)}`,
              ),
              md.text('.'),
            ]),
          ]),
        ]
      : []),
  ];
};

export const buildMeetingsIndexMarkdown = (
  meetings: readonly Meeting[],
): string => {
  const segments = meetings.reduce(
    (total, meeting) => total + meeting.transcript.segments.length,
    0,
  );

  return serialize([
    md.heading(1, 'Архив встреч'),
    md.paragraph(
      'Компактный Markdown-индекс встреч для автоматического чтения. Полные транскрипты не встраиваются в этот файл: открывайте описание нужной встречи и затем файлы транскрипта по частям.',
    ),
    md.paragraph(
      'Публичного HTML-индекса `/meetings/` нет; канонические страницы встреч доступны по прямым ссылкам из новостей, документов и обсуждений.',
    ),
    md.heading(2, 'Сводка'),
    md.list([
      md.listItem(
        `Опубликовано ${count(meetings.length, ['встреча', 'встречи', 'встреч'])}.`,
      ),
      md.listItem(
        `В архиве сейчас ${count(segments, ['фрагмент транскрипта', 'фрагмента транскрипта', 'фрагментов транскрипта'])}.`,
      ),
      md.listItem([
        md.paragraph([
          md.text('Этот индекс: '),
          md.link(abs(meetingsMarkdownPath()), abs(meetingsMarkdownPath())),
          md.text('; описание одной встречи: '),
          md.inlineCode('/meetings/[slug]/index.md'),
          md.text('; полный текст: '),
          md.inlineCode('/meetings/[slug]/transcript/[part].md'),
          md.text('.'),
        ]),
      ]),
    ]),
    md.heading(2, 'Встречи'),
    md.list(
      meetings.length > 0
        ? meetings.map(meetingLine)
        : [md.listItem('Встречи пока не опубликованы.')],
    ),
  ]);
};

export const buildMeetingMarkdown = (meeting: Meeting): string =>
  serialize([
    md.heading(1, meeting.title),
    md.paragraph(inline(meeting.context)),
    md.heading(2, 'Ссылки'),
    md.list([
      linkedItem('HTML-страница встречи', abs(meeting.url)),
      linkedItem('Индекс архива встреч', abs(meetingsMarkdownPath())),
      ...(meeting.sourceUrl
        ? [linkedItem('Источник записи', meeting.sourceUrl)]
        : []),
    ]),
    md.heading(2, 'Метаданные'),
    md.list([
      md.listItem(`Дата: ${formatMeetingDate(meeting.date)}.`),
      md.listItem([
        md.paragraph([
          md.text('Slug: '),
          md.inlineCode(meeting.slug),
          md.text('.'),
        ]),
      ]),
      md.listItem(
        `Транскрипт: ${partsCount(meeting)}, ${segmentCount(meeting)}.`,
      ),
    ]),
    md.heading(2, 'Участники'),
    md.list(meeting.transcript.speakers.map(speakerLine)),
    md.heading(2, 'Файлы транскрипта'),
    md.paragraph(
      'Описание встречи не дублирует полный текст. Для цитирования используйте ссылки на HTML-якоря внутри файлов транскрипта.',
    ),
    md.list(
      meeting.transcript.parts.map((part) => transcriptPartLine(meeting, part)),
    ),
  ]);

export const buildMeetingTranscriptPartMarkdown = (
  meeting: Meeting,
  part: MeetingTranscriptPart,
): string =>
  serialize([
    md.heading(1, `${meeting.title}: ${formatTranscriptPartLabel(part)}`),
    md.paragraph(
      `Полный текст ${formatTranscriptPartLabel(part).toLowerCase()} транскрипта. Время начинается внутри этой части записи; ссылки ведут на соответствующие HTML-якоря страницы встречи.`,
    ),
    md.heading(2, 'Навигация'),
    md.list(navigationItems(meeting, part)),
    md.heading(2, 'Транскрипт'),
    md.list(part.segments.map((segment) => segmentLine(meeting, segment))),
  ]);
