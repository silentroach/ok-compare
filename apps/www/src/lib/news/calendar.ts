import type { NewsArticle, NewsEvent } from './schema';

const CRLF = '\r\n';
const MAX_CONTENT_LINE_BYTES = 75;
const DEFAULT_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;
const TEXT_ESCAPE = /\r\n|\r|\n|[\\;,]/g;
const PARAM_ESCAPE = /\r\n|\r|\n|[\\"]/g;
const encoder = new TextEncoder();

type NewsArticleWithEvent = NewsArticle & {
  readonly event: NewsEvent;
};

export const hasArticleEvent = (
  article: NewsArticle,
): article is NewsArticleWithEvent => article.event !== undefined;

const escapeText = (value: string): string =>
  value.replace(TEXT_ESCAPE, (match) => {
    if (match === '\\') {
      return '\\\\';
    }

    if (match === ';') {
      return '\\;';
    }

    if (match === ',') {
      return '\\,';
    }

    return '\\n';
  });

const foldLine = (line: string): string => {
  const parts: string[] = [];
  let part = '';
  let bytes = 0;
  let limit = MAX_CONTENT_LINE_BYTES;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;

    if (part && bytes + charBytes > limit) {
      parts.push(part);
      part = char;
      bytes = charBytes;
      limit = MAX_CONTENT_LINE_BYTES - 1;
      continue;
    }

    part += char;
    bytes += charBytes;
  }

  parts.push(part);

  return parts
    .map((item, index) => (index === 0 ? item : ` ${item}`))
    .join(CRLF);
};

const textLine = (name: string, value: string): string =>
  foldLine(`${name}:${escapeText(value)}`);

const rawLine = (value: string): string => foldLine(value);

const parameterValue = (value: string): string =>
  `"${value.replace(PARAM_ESCAPE, (match) => {
    if (match === '\\') {
      return '\\\\';
    }

    if (match === '"') {
      return '\\"';
    }

    return ' ';
  })}"`;

const formatUtcDateTime = (value: Date): string => {
  if (Number.isNaN(value.valueOf())) {
    throw new Error('ICS date must be valid');
  }

  const iso = value.toISOString();

  return `${iso.slice(0, 10).replaceAll('-', '')}T${iso
    .slice(11, 19)
    .replaceAll(':', '')}Z`;
};

const safeToken = (value: string): string => {
  const token = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return token || 'event';
};

const articleHost = (article: NewsArticle): string =>
  new URL(article.canonical).host;

export const articleEventIcsFilename = (
  article: Pick<NewsArticle, 'id'>,
): string => `${safeToken(`news-event-${article.id}`)}.ics`;

const articleEventUid = (article: NewsArticle): string =>
  `${safeToken(`news-event-${article.id}`)}@${articleHost(article)}`;

const articleEventEnd = (event: NewsEvent): Date =>
  event.ends_at ??
  new Date(event.starts_at.valueOf() + DEFAULT_EVENT_DURATION_MS);

const structuredLocation = (event: NewsEvent): string | undefined => {
  if (!event.coordinates) {
    return undefined;
  }

  const title = parameterValue(event.location ?? event.title);

  return `X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-RADIUS=100;X-TITLE=${title}:geo:${event.coordinates.lat},${event.coordinates.lng}`;
};

export function buildArticleEventIcs(article: NewsArticle): string {
  if (!article.event) {
    throw new Error(`news article "${article.id}" has no event`);
  }

  const host = articleHost(article);
  const appleLocation = structuredLocation(article.event);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    rawLine(`PRODID:-//${host}//News Events//RU`),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    rawLine(`UID:${articleEventUid(article)}`),
    rawLine(`DTSTAMP:${formatUtcDateTime(article.published_at)}`),
    rawLine(`DTSTART:${formatUtcDateTime(article.event.starts_at)}`),
    rawLine(`DTEND:${formatUtcDateTime(articleEventEnd(article.event))}`),
    textLine('SUMMARY', article.event.title),
    textLine('DESCRIPTION', article.summary),
    rawLine(`URL:${article.canonical}`),
    ...(article.event.location
      ? [textLine('LOCATION', article.event.location)]
      : []),
    ...(article.event.coordinates
      ? [
          rawLine(
            `GEO:${article.event.coordinates.lat};${article.event.coordinates.lng}`,
          ),
        ]
      : []),
    ...(appleLocation ? [rawLine(appleLocation)] : []),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ];

  return lines.join(CRLF);
}
