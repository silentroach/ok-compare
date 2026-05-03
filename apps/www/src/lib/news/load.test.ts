import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import type { NewsArticleEntry, NewsAuthorEntry } from './load';

let buildNewsDataset: typeof import('./load').buildNewsDataset;

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
});
