import {
  createMarkdownDocument,
  md,
  serializeMarkdownDocument,
  type MarkdownListItemInput,
} from '@shelkovo/markdown';

import { absoluteUrl } from '../site';
import type { Meeting, MeetingTranscriptSegment } from './types';
import { hasMeetingProtocol, hasMeetingRecording } from './view';

export const MEETING_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

type MarkdownNode = ReturnType<
  typeof createMarkdownDocument
>['children'][number];
type MarkdownListItem = ReturnType<typeof md.listItem>;

const abs = (value: string): string => absoluteUrl(value);

const itemsSection = (
  title: string,
  items: readonly string[],
): readonly MarkdownNode[] =>
  items.length > 0
    ? [md.heading(3, title), md.list(items.map((item) => md.listItem(item)))]
    : [];

const linkItem = (url: string, label: string): MarkdownListItem =>
  md.listItem([md.paragraph([md.link(abs(url), label)])]);

const textRange = (segment: MeetingTranscriptSegment): string =>
  segment.end ? `${segment.start}-${segment.end}` : segment.start;

const segmentLine = (segment: MeetingTranscriptSegment): string =>
  `${textRange(segment)}${segment.speakerLabel ? ` — ${segment.speakerLabel}` : ''}: ${segment.text}`;

const transcriptItem = (segment: MeetingTranscriptSegment): MarkdownListItem =>
  md.listItem([
    { type: 'html', value: `<a id="${segment.anchor}"></a>` },
    md.paragraph(segmentLine(segment)),
  ] as MarkdownListItemInput);

function frontmatter(meeting: Meeting): Readonly<Record<string, unknown>> {
  return {
    id: meeting.id,
    title: meeting.title,
    date: meeting.date,
    slug: meeting.slug,
    summary: meeting.summary,
    html_url: abs(meeting.url),
    markdown_url: abs(meeting.markdownUrl),
    canonical: meeting.canonical,
    format: meeting.format,
    source_url: meeting.sourceUrl ? abs(meeting.sourceUrl) : undefined,
    recording_url: meeting.recordingUrl ? abs(meeting.recordingUrl) : undefined,
  };
}

function summarySection(meeting: Meeting): readonly MarkdownNode[] {
  return [
    md.heading(2, 'Смысл встречи'),
    md.paragraph(meeting.summary),
    ...itemsSection('Ключевые выводы', meeting.highlights),
  ];
}

function protocolSection(meeting: Meeting): readonly MarkdownNode[] {
  return hasMeetingProtocol(meeting)
    ? [
        md.heading(2, 'Протокол'),
        ...itemsSection('Повестка', meeting.agenda),
        ...itemsSection('Решения', meeting.decisions),
        ...itemsSection('Действия', meeting.actionItems),
        ...itemsSection('Открытые вопросы', meeting.questions),
      ]
    : [];
}

function recordingSection(meeting: Meeting): readonly MarkdownNode[] {
  return hasMeetingRecording(meeting)
    ? [
        md.heading(2, 'Запись и расшифровка'),
        ...(meeting.recordingUrl
          ? [
              md.paragraph([
                md.link(abs(meeting.recordingUrl), 'Открыть запись встречи'),
              ]),
            ]
          : []),
        ...(meeting.transcript?.segments.length
          ? [
              md.list(meeting.transcript.segments.map(transcriptItem), {
                ordered: true,
              }),
            ]
          : []),
      ]
    : [];
}

function canonicalLinksSection(meeting: Meeting): readonly MarkdownNode[] {
  return [
    md.heading(2, 'Ссылки'),
    md.list([
      linkItem(meeting.url, 'HTML-страница'),
      linkItem(meeting.markdownUrl, 'Markdown-версия'),
    ]),
  ];
}

function documentsSection(meeting: Meeting): readonly MarkdownNode[] {
  const items = [
    ...meeting.documents.map((document) =>
      linkItem(document.url, document.title),
    ),
    ...(meeting.sourceUrl
      ? [linkItem(meeting.sourceUrl, 'Исходный материал')]
      : []),
  ];

  return meeting.documents.length > 0 || meeting.sourceUrl
    ? [md.heading(2, 'Документы и источники'), md.list(items)]
    : [];
}

export function buildMeetingMarkdown(meeting: Meeting): string {
  return serializeMarkdownDocument(
    createMarkdownDocument({
      frontmatter: frontmatter(meeting),
      children: [
        md.heading(1, meeting.title),
        ...summarySection(meeting),
        ...protocolSection(meeting),
        ...recordingSection(meeting),
        ...canonicalLinksSection(meeting),
        ...documentsSection(meeting),
      ],
    }),
  );
}
