import { beforeAll, describe, expect, it } from 'vitest';

import type { NewsArticle, NewsEvent } from './schema';

let articleEventIcsUrl: typeof import('./routes').articleEventIcsUrl;
let buildArticleEventIcs: typeof import('./calendar').buildArticleEventIcs;
let hasArticleEvent: typeof import('./calendar').hasArticleEvent;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ articleEventIcsUrl } = await import('./routes'));
  ({ buildArticleEventIcs, hasArticleEvent } = await import('./calendar'));
});

const event = (input?: {
  readonly title?: string;
  readonly location?: string;
  readonly coordinates?: NewsEvent['coordinates'];
  readonly ends?: boolean;
}): NewsEvent => ({
  title: input?.title ?? 'Встреча по регламенту',
  starts_at: new Date('2026-05-31T16:00:00.000Z'),
  starts_iso: '2026-05-31T19:00:00+03:00',
  starts_time: '19:00',
  ics_url: '/news/2026/04/ok-meeting-regulation/event.ics',
  ...(input?.ends === false
    ? {}
    : {
        ends_at: new Date('2026-05-31T18:00:00.000Z'),
        ends_iso: '2026-05-31T21:00:00+03:00',
        ends_time: '21:00',
      }),
  ...(input?.location ? { location: input.location } : {}),
  ...(input?.coordinates ? { coordinates: input.coordinates } : {}),
});

const article = (input?: {
  readonly summary?: string;
  readonly event?: NewsEvent;
}): NewsArticle => ({
  id: '2026/04/ok-meeting-regulation',
  title: 'ОК согласились на встречу',
  author: {
    id: 'ig',
    name: 'Редакция',
    kind: 'editorial',
    is_official: false,
  },
  year: 2026,
  month: 4,
  day: 29,
  entry: 'ok-meeting-regulation',
  url: '/news/2026/04/ok-meeting-regulation/',
  markdown_url: '/news/2026/04/ok-meeting-regulation/index.md',
  canonical: 'https://example.com/news/2026/04/ok-meeting-regulation/',
  published_at: new Date('2026-04-28T21:00:00.000Z'),
  published_iso: '2026-04-29T00:00:00+03:00',
  is_official: false,
  applies_to_all_areas: true,
  areas: ['river', 'forest', 'park', 'village'],
  tags: [],
  pinned: false,
  photos: [],
  attachments: [],
  ...(input?.event ? { event: input.event } : {}),
  addenda: [],
  summary: input?.summary ?? 'Коротко о встрече',
  body: '',
  has_addenda: false,
  mentions: [],
});

describe('buildArticleEventIcs', () => {
  it('builds a valid calendar skeleton', () => {
    const ics = buildArticleEventIcs(article({ event: event() }));

    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('BEGIN:VEVENT\r\n');
    expect(ics).toContain('END:VEVENT\r\n');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replaceAll('\r\n', '')).not.toContain('\n');
  });

  it('converts Moscow event time to UTC', () => {
    const ics = buildArticleEventIcs(article({ event: event() }));

    expect(ics).toContain('DTSTART:20260531T160000Z\r\n');
    expect(ics).toContain('DTEND:20260531T180000Z\r\n');
    expect(ics).toContain('DTSTAMP:20260428T210000Z\r\n');
  });

  it('defaults omitted event end to two hours in ICS only', () => {
    const ics = buildArticleEventIcs(
      article({ event: event({ ends: false }) }),
    );

    expect(ics).toContain('DTSTART:20260531T160000Z\r\n');
    expect(ics).toContain('DTEND:20260531T180000Z\r\n');
  });

  it('escapes text values', () => {
    const ics = buildArticleEventIcs(
      article({
        summary: 'Comma, semi; slash \\ and\nbreak',
        event: event({
          title: 'Comma, semi; slash \\ and\nbreak',
        }),
      }),
    );

    expect(ics).toContain(
      'SUMMARY:Comma\\, semi\\; slash \\\\ and\\nbreak\r\n',
    );
    expect(ics).toContain(
      'DESCRIPTION:Comma\\, semi\\; slash \\\\ and\\nbreak\r\n',
    );
  });

  it('includes article identity, location, geo, and URL', () => {
    const ics = buildArticleEventIcs(
      article({
        event: event({
          location: 'КП Шелково, эко-клуб',
          coordinates: {
            lat: 55,
            lng: 38,
          },
        }),
      }),
    );
    const unfolded = ics.replaceAll('\r\n ', '');

    expect(ics).toContain(
      'UID:news-event-2026-04-ok-meeting-regulation@example.com\r\n',
    );
    expect(ics).toContain(
      'URL:https://example.com/news/2026/04/ok-meeting-regulation/\r\n',
    );
    expect(ics).toContain('LOCATION:КП Шелково\\, эко-клуб\r\n');
    expect(ics).toContain('GEO:55;38\r\n');
    expect(unfolded).toContain(
      'X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-RADIUS=100;',
    );
    expect(unfolded).toContain('X-TITLE="КП Шелково, эко-клуб":geo:55,38\r\n');
  });

  it('throws for article without event', () => {
    expect(() => buildArticleEventIcs(article())).toThrow(
      /news article "2026\/04\/ok-meeting-regulation" has no event/,
    );
  });
});

describe('article event route helpers', () => {
  it('builds article-local event URLs', () => {
    expect(
      articleEventIcsUrl({
        year: 2026,
        month: 4,
        entry: 'ok-meeting-regulation',
      }),
    ).toBe('/news/2026/04/ok-meeting-regulation/event.ics');
  });

  it('marks only event articles as event-route eligible', () => {
    expect(hasArticleEvent(article({ event: event() }))).toBe(true);
    expect(hasArticleEvent(article())).toBe(false);
  });
});
