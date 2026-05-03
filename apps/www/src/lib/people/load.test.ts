import { beforeAll, describe, expect, it } from 'vitest';

import type { NewsArticleEntry, NewsAuthorEntry } from '../news/load';
import type { StatusIncidentEntry } from '../status/load';
import type { StatusArea, StatusKind, StatusService } from '../status/schema';
import type { PersonProfileEntry } from './load';

let buildPeopleDataset: typeof import('./load').buildPeopleDataset;
let buildPeopleGraphDataset: typeof import('./load').buildPeopleGraphDataset;
let buildNewsDataset: typeof import('../news/load').buildNewsDataset;
let buildStatusDataset: typeof import('../status/load').buildStatusDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildPeopleDataset, buildPeopleGraphDataset } = await import('./load'));
  ({ buildNewsDataset } = await import('../news/load'));
  ({ buildStatusDataset } = await import('../status/load'));
});

const entry = (input: {
  readonly id: string;
  readonly name: string;
  readonly body?: string;
  readonly contacts?: readonly {
    readonly type: 'phone' | 'telegram';
    readonly value: string;
  }[];
}): PersonProfileEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    name: input.name,
    contacts: [...(input.contacts ?? [])],
  },
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
    readonly title?: string;
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
            ...(item.title ? { title: item.title } : {}),
            ...(item.body ? { body: item.body } : {}),
          })),
        }
      : {}),
  },
});

const incident = (input: {
  readonly id: string;
  readonly title: string;
  readonly service: StatusService;
  readonly kind: StatusKind;
  readonly started_at: string;
  readonly ended_at?: string;
  readonly areas?: readonly StatusArea[];
  readonly body?: string;
}): StatusIncidentEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    title: input.title,
    service: input.service,
    kind: input.kind,
    started_at: input.started_at,
    ...(input.ended_at ? { ended_at: input.ended_at } : {}),
    ...(input.areas ? { areas: [...input.areas] } : {}),
    source_url: `https://example.com/${input.id}`,
  },
});

describe('buildPeopleDataset', () => {
  it('accepts a valid person entry with normalized contacts and body mentions', () => {
    const data = buildPeopleDataset([
      entry({
        id: 'kschemelinin',
        name: 'Кирилл Щемелинин',
        body: 'Профиль Кирилла.',
        contacts: [
          {
            type: 'telegram',
            value: 'Kirill_ZemlyaMO',
          },
          {
            type: 'phone',
            value: '+7 (916) 555-12-34',
          },
        ],
      }),
      entry({
        id: 'apetrov',
        name: 'Андрей Петров',
        body: 'Работал вместе с @kschemelinin над разбором аварии.',
      }),
    ]);

    expect(data.by_slug.get('apetrov')?.body).toBe(
      'Работал вместе с [Кирилл Щемелинин](/people/kschemelinin/) над разбором аварии.',
    );
    expect(
      data.by_slug.get('apetrov')?.mentions.map((item) => item.slug),
    ).toEqual(['kschemelinin']);
    expect(data.by_slug.get('kschemelinin')?.contacts).toEqual([
      {
        type: 'telegram',
        value: 'Kirill_ZemlyaMO',
        display: '@Kirill_ZemlyaMO',
        href: 'https://t.me/Kirill_ZemlyaMO',
      },
      {
        type: 'phone',
        value: '+7 (916) 555-12-34',
        display: '+7 (916) 555-12-34',
        href: 'tel:+79165551234',
      },
    ]);
  });

  it('fails on duplicate person slugs', () => {
    expect(() =>
      buildPeopleDataset([
        entry({
          id: 'kschemelinin',
          name: 'Кирилл Щемелинин',
        }),
        entry({
          id: 'kschemelinin',
          name: 'Другой Кирилл',
        }),
      ]),
    ).toThrow('duplicate person profile slug in mention registry');
  });

  it('builds grouped backlinks from news, status, and people mentions', () => {
    const people = buildPeopleDataset([
      entry({
        id: 'kschemelinin',
        name: 'Кирилл Щемелинин',
        body: 'Публичный профиль Кирилла.',
      }),
      entry({
        id: 'apetrov',
        name: 'Андрей Петров',
        body: 'Работал вместе с @kschemelinin над разбором аварии.',
      }),
    ]);
    const news = buildNewsDataset(
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
              title: 'Комментарий специалиста',
              body: 'Уточнение после комментария @kschemelinin.',
            },
          ],
        }),
      ],
      {
        people_registry: people.mention_registry,
      },
    );
    const status = buildStatusDataset(
      [
        incident({
          id: '2026/04/electricity-river-10kv-line-damage',
          title: 'Отключение электричества в Шелково Ривер',
          service: 'electricity',
          kind: 'incident',
          started_at: '22.04.2026 11:30',
          ended_at: '23.04.2026 00:06',
          areas: ['river'],
          body: 'Как отметил @kschemelinin, повреждение было редким.',
        }),
      ],
      {
        people_registry: people.mention_registry,
      },
    );
    const graph = buildPeopleGraphDataset(people, { news, status });

    expect(graph.by_slug.get('kschemelinin')?.backlinks).toMatchObject({
      news: [
        {
          kind: 'addendum',
          source_id: '2026/05/electricity#addendum-1',
          title: 'Авария на линии — Комментарий специалиста',
        },
        {
          kind: 'article',
          source_id: '2026/05/electricity',
          title: 'Авария на линии',
        },
      ],
      status: [
        {
          kind: 'incident',
          source_id: '2026/04/electricity-river-10kv-line-damage',
          title: 'Отключение электричества в Шелково Ривер',
          markdown_url:
            '/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md',
          excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
        },
      ],
      people: [
        {
          kind: 'person',
          source_id: 'apetrov',
          title: 'Андрей Петров',
        },
      ],
    });
  });
});
