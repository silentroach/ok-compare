import { beforeAll, describe, expect, it } from 'vitest';

import type { StatusIncidentEntry } from './load';
import type { StatusArea, StatusKind, StatusService } from './schema';

interface EntryInput {
  readonly id: string;
  readonly title: string;
  readonly service: StatusService;
  readonly kind: StatusKind;
  readonly started_at: string;
  readonly ended_at?: string;
  readonly areas?: readonly StatusArea[];
  readonly source_url?: string;
  readonly body?: string;
}

const entry = (input: EntryInput): StatusIncidentEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    title: input.title,
    service: input.service,
    kind: input.kind,
    started_at: input.started_at,
    ...(input.ended_at ? { ended_at: input.ended_at } : {}),
    ...(input.areas ? { areas: [...input.areas] } : {}),
    source_url: input.source_url ?? `https://example.com/${input.id}`,
  },
});

let buildStatusDataset: typeof import('./load').buildStatusDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildStatusDataset } = await import('./load'));
});

describe('buildStatusDataset', () => {
  it('accepts supported status timestamp formats', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/day-only',
          title: 'Дата без времени',
          service: 'water',
          kind: 'maintenance',
          started_at: '01.05.2026',
        }),
        entry({
          id: '2026/05/day-time',
          title: 'Дата со временем',
          service: 'dam',
          kind: 'incident',
          started_at: '02.05.2026 14:05',
        }),
        entry({
          id: '2026/05/iso-day',
          title: 'ISO-дата',
          service: 'electricity',
          kind: 'incident',
          started_at: '2026-05-03',
        }),
      ],
      {
        now: new Date('2026-05-04T09:00:00+03:00'),
      },
    );

    expect(data.by_id.get('2026/05/day-only')).toMatchObject({
      started_iso: '2026-05-01T00:00:00+03:00',
      started_has_time: false,
    });
    expect(data.by_id.get('2026/05/day-time')).toMatchObject({
      started_iso: '2026-05-02T14:05:00+03:00',
      started_has_time: true,
    });
    expect(data.by_id.get('2026/05/iso-day')).toMatchObject({
      started_iso: '2026-05-03T00:00:00+03:00',
      started_has_time: false,
    });
  });

  it('derives incidents and service summaries', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/03/dam-flood-closure',
          title: 'Проезд через дамбу закрыт из-за паводка',
          service: 'dam',
          kind: 'incident',
          started_at: '15.03.2026',
          ended_at: '24.04.2026',
          body: 'Первый абзац.\nС новой строкой.\n\nВторой абзац.',
        }),
        entry({
          id: '2026/04/dam-closure-ongoing',
          title: 'Проезд через дамбу закрыт',
          service: 'dam',
          kind: 'incident',
          started_at: '27.04.2026',
        }),
        entry({
          id: '2026/05/electricity-river-outage',
          title: 'Отключение электричества в Шелково Ривер',
          service: 'electricity',
          kind: 'incident',
          started_at: '01.05.2026 07:32',
          ended_at: '01.05.2026 16:38',
          areas: ['river'],
        }),
        entry({
          id: '2026/05/water-filter-maintenance',
          title: 'Промывка фильтров водоснабжения',
          service: 'water',
          kind: 'maintenance',
          started_at: '02.05.2026 10:00',
        }),
      ],
      {
        now: new Date('2026-05-03T09:00:00+03:00'),
      },
    );

    expect(data.active.map((item) => item.id)).toEqual([
      '2026/05/water-filter-maintenance',
      '2026/04/dam-closure-ongoing',
    ]);

    const damHistory = data.by_id.get('2026/03/dam-flood-closure');

    expect(damHistory).toMatchObject({
      started_iso: '2026-03-15T00:00:00+03:00',
      ended_iso: '2026-04-24T00:00:00+03:00',
      started_has_time: false,
      ended_has_time: false,
      applies_to_all_areas: true,
      excerpt: 'Первый абзац. С новой строкой.',
      duration: {
        total_minutes: 57600,
      },
    });

    const electricity = data.by_id.get('2026/05/electricity-river-outage');

    expect(electricity).toMatchObject({
      started_has_time: true,
      ended_has_time: true,
      applies_to_all_areas: false,
      areas: ['river'],
      duration: {
        total_minutes: 546,
      },
    });

    expect(data.by_service.get('dam')).toMatchObject({
      service_status: 'red',
      days_without_incidents: {
        mode: 'active_incident',
      },
    });

    expect(data.by_service.get('water')).toMatchObject({
      service_status: 'amber',
      days_without_incidents: {
        mode: 'no_incidents',
      },
    });

    expect(data.by_service.get('electricity')).toMatchObject({
      service_status: 'green',
      days_without_incidents: {
        mode: 'count',
        days: 2,
        last_ended_iso: '2026-05-01T16:38:00+03:00',
      },
    });
  });

  it('marks active incident, active maintenance, and closed incident separately', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/electricity-active-incident',
          title: 'Активный инцидент по электричеству',
          service: 'electricity',
          kind: 'incident',
          started_at: '03.05.2026 07:30',
        }),
        entry({
          id: '2026/05/water-active-maintenance',
          title: 'Активные работы по воде',
          service: 'water',
          kind: 'maintenance',
          started_at: '03.05.2026 09:00',
        }),
        entry({
          id: '2026/05/dam-closed-incident',
          title: 'Закрытый инцидент по дамбе',
          service: 'dam',
          kind: 'incident',
          started_at: '01.05.2026',
          ended_at: '02.05.2026',
        }),
      ],
      {
        now: new Date('2026-05-03T12:00:00+03:00'),
      },
    );

    expect(
      data.by_id.get('2026/05/electricity-active-incident')?.is_active,
    ).toBe(true);
    expect(data.by_id.get('2026/05/water-active-maintenance')?.is_active).toBe(
      true,
    );
    expect(data.by_id.get('2026/05/dam-closed-incident')?.is_active).toBe(
      false,
    );
  });

  it('does not mark future events as active before they start', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/water-planned-shutdown',
          title: 'Плановое отключение воды',
          service: 'water',
          kind: 'maintenance',
          started_at: '10.05.2026 10:00',
        }),
      ],
      {
        now: new Date('2026-05-03T09:00:00+03:00'),
      },
    );

    expect(data.active).toHaveLength(0);
    expect(data.by_service.get('water')).toMatchObject({
      service_status: 'green',
      days_without_incidents: {
        mode: 'no_incidents',
      },
    });
  });

  it('resets quiet days only on incidents', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/electricity-restored',
          title: 'Электричество восстановлено',
          service: 'electricity',
          kind: 'incident',
          started_at: '01.05.2026 01:00',
          ended_at: '01.05.2026 05:00',
        }),
        entry({
          id: '2026/05/electricity-maintenance',
          title: 'Плановые работы по электричеству',
          service: 'electricity',
          kind: 'maintenance',
          started_at: '03.05.2026 12:00',
        }),
      ],
      {
        now: new Date('2026-05-04T09:00:00+03:00'),
      },
    );

    expect(data.by_service.get('electricity')).toMatchObject({
      service_status: 'amber',
      days_without_incidents: {
        mode: 'count',
        days: 3,
        last_ended_iso: '2026-05-01T05:00:00+03:00',
      },
    });
  });

  it('extracts excerpt from the first paragraph only', () => {
    const data = buildStatusDataset([
      entry({
        id: '2026/05/electricity-excerpt',
        title: 'Инцидент с описанием',
        service: 'electricity',
        kind: 'incident',
        started_at: '01.05.2026 07:32',
        ended_at: '01.05.2026 16:38',
        body: 'Первый абзац.\nСо второй строкой.\n\nВторой абзац останется за пределами excerpt.',
      }),
    ]);

    expect(data.by_id.get('2026/05/electricity-excerpt')?.excerpt).toBe(
      'Первый абзац. Со второй строкой.',
    );
  });

  it('prefers incidents over maintenance when deriving service status', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/water-maintenance',
          title: 'Плановые работы по воде',
          service: 'water',
          kind: 'maintenance',
          started_at: '03.05.2026 08:00',
        }),
        entry({
          id: '2026/05/water-incident',
          title: 'Авария по воде',
          service: 'water',
          kind: 'incident',
          started_at: '03.05.2026 09:00',
        }),
      ],
      {
        now: new Date('2026-05-03T12:00:00+03:00'),
      },
    );

    expect(data.by_service.get('water')).toMatchObject({
      service_status: 'red',
    });
  });

  it('rejects incidents that end before they start', () => {
    expect(() =>
      buildStatusDataset([
        entry({
          id: '2026/05/invalid',
          title: 'Некорректный инцидент',
          service: 'dam',
          kind: 'incident',
          started_at: '02.05.2026 10:00',
          ended_at: '02.05.2026 09:59',
        }),
      ]),
    ).toThrow('ended_at cannot be earlier than started_at');
  });
});
