/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import type { StatusIncident } from '@/lib/status/schema';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import StatusIncidentRow from './StatusIncidentRow.astro';

const incident = {
  id: '2026/05/outage',
  title: 'Отключение электричества',
  service: 'electricity',
  kind: 'incident',
  year: 2026,
  month: 5,
  slug: 'outage',
  url: '/status/incidents/2026/05/outage/',
  canonical: 'https://kpshelkovo.online/status/incidents/2026/05/outage/',
  started_at: new Date('2026-05-01T07:32:00+03:00'),
  started_iso: '2026-05-01T07:32:00+03:00',
  started_has_time: true,
  ended_at: new Date('2026-05-01T16:38:00+03:00'),
  ended_iso: '2026-05-01T16:38:00+03:00',
  ended_has_time: true,
  is_active: false,
  applies_to_all_areas: true,
  areas: [],
  has_page: true,
  body: '',
  mentions: [],
  sort_started_at: new Date('2026-05-01T07:32:00+03:00').valueOf(),
  sort_last_change_at: new Date('2026-05-01T16:38:00+03:00').valueOf(),
  duration: { total_minutes: 9 * 60 + 6 },
} satisfies StatusIncident;

describe('StatusIncidentRow', () => {
  it('renders incident title links without leading whitespace', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusIncidentRow, {
      props: { incident },
    });

    expect(html).toMatch(
      /<a(?=[^>]*href="\/status\/incidents\/2026\/05\/outage\/")(?=[^>]*class="ui-link")[^>]*>Отключение электричества<\/a>/u,
    );
    expect(html).not.toMatch(/<a(?=[^>]*class="ui-link")[^>]*>\s+Отключение/u);
  });
});
