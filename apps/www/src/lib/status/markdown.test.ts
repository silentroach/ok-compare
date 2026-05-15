import { beforeAll, describe, expect, it } from 'vitest';

import type { StatusIncident, StatusServiceSummary } from './schema';

let buildStatusHomeMarkdown: typeof import('./markdown').buildStatusHomeMarkdown;
let buildStatusIncidentMarkdown: typeof import('./markdown').buildStatusIncidentMarkdown;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildStatusHomeMarkdown, buildStatusIncidentMarkdown } =
    await import('./markdown'));
});

const incident = (input?: Partial<StatusIncident>): StatusIncident => ({
  id: '2026/05/electricity-river-outage',
  title: 'Отключение электричества в Шелково Ривер',
  service: 'electricity',
  kind: 'incident',
  year: 2026,
  month: 5,
  slug: 'electricity-river-outage',
  url: '/status/incidents/2026/05/electricity-river-outage/',
  canonical:
    'https://example.com/status/incidents/2026/05/electricity-river-outage/',
  started_at: new Date('2026-05-01T04:32:00.000Z'),
  started_iso: '2026-05-01T07:32:00+03:00',
  started_has_time: true,
  ended_at: new Date('2026-05-01T13:38:00.000Z'),
  ended_iso: '2026-05-01T16:38:00+03:00',
  ended_has_time: true,
  is_active: false,
  applies_to_all_areas: false,
  areas: ['river'],
  source_url: 'https://example.com/source',
  has_page: true,
  body: 'Основной текст инцидента.',
  mentions: [],
  sort_started_at: new Date('2026-05-01T04:32:00.000Z').valueOf(),
  sort_last_change_at: new Date('2026-05-01T13:38:00.000Z').valueOf(),
  duration: { total_minutes: 546 },
  ...input,
});

const summary = (
  input?: Partial<StatusServiceSummary>,
): StatusServiceSummary => ({
  service: 'electricity',
  service_status: 'green',
  incidents: [incident()],
  active_incidents: [],
  active_maintenance: [],
  days_without_incidents: { mode: 'count', days: 3 },
  ...input,
});

describe('buildStatusHomeMarkdown', () => {
  it('keeps service and incident public Markdown links', () => {
    const testIncident = incident();
    const testSummary = summary({ incidents: [testIncident] });
    const markdown = buildStatusHomeMarkdown({
      incidents: [testIncident],
      active: [],
      services: [testSummary],
      by_id: new Map([[testIncident.id, testIncident]]),
      by_service: new Map([['electricity', testSummary]]),
    });

    expect(markdown).toContain(
      '[Электричество](https://example.com/status/electricity/index.md)',
    );
    expect(markdown).toContain(
      '[Отключение электричества в Шелково Ривер](https://example.com/status/incidents/2026/05/electricity-river-outage/index.md)',
    );
  });
});

describe('buildStatusIncidentMarkdown', () => {
  it('puts incident metadata into frontmatter and starts body without a wrapper heading', () => {
    expect(buildStatusIncidentMarkdown(incident())).toMatchInlineSnapshot(`
      "---
      title: Отключение электричества в Шелково Ривер
      service:
        id: electricity
        name: Электричество
      kind:
        id: incident
        name: Инцидент
      phase: восстановлено
      started_at: 2026-05-01T07:32:00+03:00
      started_has_time: true
      ended_at: 2026-05-01T16:38:00+03:00
      ended_has_time: true
      areas:
        - Шелково Ривер
      source_url: https://example.com/source
      ---

      # Отключение электричества в Шелково Ривер

      Основной текст инцидента.
      "
    `);
  });

  it('omits settlement-wide areas from frontmatter', () => {
    const markdown = buildStatusIncidentMarkdown(
      incident({
        applies_to_all_areas: true,
        areas: ['river', 'forest', 'park', 'village'],
      }),
    );

    expect(markdown).not.toContain('\nareas:\n');
    expect(markdown).not.toContain('## Метаданные');
    expect(markdown).not.toContain('## Описание');
  });

  it('parses incident body as Markdown fragment without nested frontmatter', () => {
    expect(
      buildStatusIncidentMarkdown(
        incident({
          body: [
            '---',
            'draft: true',
            '---',
            '',
            'Тело с [ссылкой](https://example.com/body).',
            '',
            '- пункт 1',
          ].join('\n'),
        }),
      ),
    ).toMatchInlineSnapshot(`
      "---
      title: Отключение электричества в Шелково Ривер
      service:
        id: electricity
        name: Электричество
      kind:
        id: incident
        name: Инцидент
      phase: восстановлено
      started_at: 2026-05-01T07:32:00+03:00
      started_has_time: true
      ended_at: 2026-05-01T16:38:00+03:00
      ended_has_time: true
      areas:
        - Шелково Ривер
      source_url: https://example.com/source
      ---

      # Отключение электричества в Шелково Ривер

      Тело с [ссылкой](https://example.com/body).

      - пункт 1
      "
    `);
  });
});
