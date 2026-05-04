import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import type { NewsArticleEntry, NewsAuthorEntry } from './load';

let buildNewsDataset: typeof import('./load').buildNewsDataset;

type ArticleEventInput = NonNullable<NewsArticleEntry['data']['event']>;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildNewsDataset } = await import('./load'));
});

const author = (input: {
  readonly id: string;
  readonly name: string;
  readonly kind?: 'official' | 'community' | 'editorial' | 'other';
}): NewsAuthorEntry => ({
  id: input.id,
  data: {
    name: input.name,
    kind: input.kind ?? 'editorial',
  },
});

const article = (input: {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly date: string;
  readonly body?: string;
  readonly pinned?: boolean;
  readonly pinned_until?: string;
  readonly event?: ArticleEventInput;
  readonly addenda?: readonly {
    readonly date: string;
    readonly body?: string;
  }[];
}): NewsArticleEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    title: input.title,
    summary: input.summary,
    date: input.date,
    author: { id: 'ig' } as NewsArticleEntry['data']['author'],
    ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
    ...(input.pinned_until ? { pinned_until: input.pinned_until } : {}),
    ...(input.event ? { event: input.event } : {}),
    ...(input.addenda
      ? {
          addenda: input.addenda.map((item) => ({
            date: item.date,
            ...(item.body ? { body: item.body } : {}),
          })),
        }
      : {}),
  },
});

describe('buildNewsDataset', () => {
  it('keeps pinned news only before pinned_until date', () => {
    const now = Date.now;
    Date.now = () => new Date('2026-05-06T12:00:00.000Z').valueOf();

    try {
      const data = buildNewsDataset(
        [author({ id: 'ig', name: 'Редакция' })],
        [
          article({
            id: '2026/05/pinned-active',
            title: 'Активный пин',
            summary: 'До срока',
            date: '04.05.2026',
            pinned: true,
            pinned_until: '2026-05-07',
          }),
          article({
            id: '2026/05/pinned-expired',
            title: 'Истекший пин',
            summary: 'После срока',
            date: '03.05.2026',
            pinned: true,
            pinned_until: '2026-05-05',
          }),
        ],
      );

      expect(data.home.pinned.map((item) => item.id)).toEqual([
        '2026/05/pinned-active',
      ]);
    } finally {
      Date.now = now;
    }
  });

  it('shows multiple pinned news on top in publication-date order', () => {
    const data = buildNewsDataset(
      [author({ id: 'ig', name: 'Редакция' })],
      [
        article({
          id: '2026/05/pinned-new',
          title: 'Новый пин',
          summary: 'Новый',
          date: '05.05.2026 10:00',
          pinned: true,
        }),
        article({
          id: '2026/05/pinned-old',
          title: 'Старый пин',
          summary: 'Старый',
          date: '04.05.2026 10:00',
          pinned: true,
        }),
        article({
          id: '2026/05/regular',
          title: 'Обычная новость',
          summary: 'Без пина',
          date: '06.05.2026 10:00',
        }),
      ],
    );

    expect(data.home.pinned.map((item) => item.id)).toEqual([
      '2026/05/pinned-new',
      '2026/05/pinned-old',
    ]);
    expect(data.home.latest.map((item) => item.id)).toEqual([
      '2026/05/regular',
    ]);
  });

  it('normalizes mentions in article and addendum bodies', () => {
    const data = buildNewsDataset(
      [author({ id: 'ig', name: 'Редакция' })],
      [
        article({
          id: '2026/05/electricity',
          title: 'Авария на линии',
          summary: 'Краткая сводка',
          date: '03.05.2026 09:00',
          body: 'Основной текст про @kschemelinin.',
          addenda: [
            {
              date: '03.05.2026 12:00',
              body: 'Уточнение после комментария @kschemelinin.',
            },
          ],
        }),
      ],
      {
        people_registry: new Map([
          [
            'kschemelinin',
            createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
          ],
        ]),
      },
    );

    expect(data.articles[0]?.body).toBe(
      'Основной текст про [Кирилл Щемелинин](/people/kschemelinin/).',
    );
    expect(data.articles[0]?.addenda[0]?.body).toBe(
      'Уточнение после комментария [Кирилл Щемелинин](/people/kschemelinin/).',
    );
  });

  it('normalizes a valid event for article and list data', () => {
    const data = buildNewsDataset(
      [author({ id: 'ig', name: 'Редакция' })],
      [
        article({
          id: '2026/05/event',
          title: 'Встреча по регламенту',
          summary: 'Коротко о встрече',
          date: '04.05.2026 10:00',
          event: {
            title: 'Встреча по регламенту',
            starts_at: '31.05.2026 19:00',
            ends_at: '31.05.2026 21:00',
            location: 'КП Шелково, эко-клуб',
            coordinates: {
              lat: 55,
              lng: 38,
            },
          },
        }),
      ],
    );

    expect(data.articles[0]?.event).toMatchObject({
      title: 'Встреча по регламенту',
      starts_iso: '2026-05-31T19:00:00+03:00',
      starts_time: '19:00',
      ends_iso: '2026-05-31T21:00:00+03:00',
      ends_time: '21:00',
      ics_url: '/news/2026/05/event/event.ics',
      location: 'КП Шелково, эко-клуб',
      coordinates: {
        lat: 55,
        lng: 38,
      },
    });
    expect(data.articles[0]?.event?.starts_at).toBeInstanceOf(Date);
    expect(data.articles[0]?.event?.ends_at).toBeInstanceOf(Date);
    expect(data.home.latest[0]?.event?.starts_iso).toBe(
      '2026-05-31T19:00:00+03:00',
    );
  });

  it('rejects an event start without time', () => {
    expect(() =>
      buildNewsDataset(
        [author({ id: 'ig', name: 'Редакция' })],
        [
          article({
            id: '2026/05/event',
            title: 'Встреча по регламенту',
            summary: 'Коротко о встрече',
            date: '04.05.2026 10:00',
            event: {
              title: 'Встреча по регламенту',
              starts_at: '31.05.2026',
              ends_at: '31.05.2026 21:00',
            },
          }),
        ],
      ),
    ).toThrow(/event starts_at must include time/);
  });

  it('rejects an event end without time', () => {
    expect(() =>
      buildNewsDataset(
        [author({ id: 'ig', name: 'Редакция' })],
        [
          article({
            id: '2026/05/event',
            title: 'Встреча по регламенту',
            summary: 'Коротко о встрече',
            date: '04.05.2026 10:00',
            event: {
              title: 'Встреча по регламенту',
              starts_at: '31.05.2026 19:00',
              ends_at: '31.05.2026',
            },
          }),
        ],
      ),
    ).toThrow(/event ends_at must include time/);
  });

  it('rejects an event that does not end after it starts', () => {
    expect(() =>
      buildNewsDataset(
        [author({ id: 'ig', name: 'Редакция' })],
        [
          article({
            id: '2026/05/event',
            title: 'Встреча по регламенту',
            summary: 'Коротко о встрече',
            date: '04.05.2026 10:00',
            event: {
              title: 'Встреча по регламенту',
              starts_at: '31.05.2026 19:00',
              ends_at: '31.05.2026 19:00',
            },
          }),
        ],
      ),
    ).toThrow(/event ends_at must be later than starts_at/);
  });

  it('rejects invalid event coordinates', () => {
    expect(() =>
      buildNewsDataset(
        [author({ id: 'ig', name: 'Редакция' })],
        [
          article({
            id: '2026/05/event',
            title: 'Встреча по регламенту',
            summary: 'Коротко о встрече',
            date: '04.05.2026 10:00',
            event: {
              title: 'Встреча по регламенту',
              starts_at: '31.05.2026 19:00',
              ends_at: '31.05.2026 21:00',
              coordinates: {
                lat: 91,
                lng: 38,
              },
            },
          }),
        ],
      ),
    ).toThrow(/coordinates\.lat must be between -90 and 90/);
  });

  it('keeps articles without event unchanged', () => {
    const data = buildNewsDataset(
      [author({ id: 'ig', name: 'Редакция' })],
      [
        article({
          id: '2026/05/plain',
          title: 'Обычная новость',
          summary: 'Без события',
          date: '04.05.2026 10:00',
        }),
      ],
    );

    expect(data.articles[0]?.event).toBeUndefined();
    expect(data.home.latest[0]?.event).toBeUndefined();
  });
});
