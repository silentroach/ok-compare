/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import StatusServiceCard from './StatusServiceCard.astro';
import type { StatusIncident, StatusServiceSummary } from '@/lib/status/schema';

const incident = (): StatusIncident => ({
  id: 'overview-tooltip',
  title: 'Проверка tooltip на общей странице',
  service: 'water',
  kind: 'incident',
  year: 2026,
  month: 5,
  slug: 'overview-tooltip',
  url: '/status/incidents/overview-tooltip',
  canonical: 'https://kpshelkovo.online/status/incidents/overview-tooltip/',
  started_at: new Date('2026-05-09T00:00:00Z'),
  started_iso: '2026-05-09T00:00:00Z',
  started_has_time: true,
  ended_at: new Date('2026-05-09T01:00:00Z'),
  ended_iso: '2026-05-09T01:00:00Z',
  ended_has_time: true,
  is_active: false,
  applies_to_all_areas: true,
  areas: [],
  has_page: true,
  body: '',
  mentions: [],
  sort_started_at: Date.parse('2026-05-09T00:00:00Z'),
  sort_last_change_at: Date.parse('2026-05-09T01:00:00Z'),
  duration: { total_minutes: 60 },
});

const summary = (): StatusServiceSummary => ({
  service: 'water',
  service_status: 'green',
  incidents: [incident()],
  active_incidents: [],
  active_maintenance: [],
  days_without_incidents: { mode: 'count', days: 1 },
});

describe('StatusServiceCard', () => {
  it('keeps overview timeline tooltips available', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusServiceCard, {
      props: {
        summary: summary(),
        serviceHref: '/status/water/',
      },
    });

    expect(html).toContain('data-status-timeline-tooltip');
    expect(html).toContain('data-tooltip-title="Проверка tooltip');
    expect(html).toContain('aria-label="Вода. Инцидент');
  });

  it('renders separate mobile and desktop timeline ranges when requested', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusServiceCard, {
      props: {
        summary: summary(),
        serviceHref: '/status/water/',
        timelineDays: 30,
        mobileTimelineDays: 7,
      },
    });

    expect(html.match(/data-range-days="7"/gu)?.length ?? 0).toBe(1);
    expect(html.match(/data-range-days="30"/gu)?.length ?? 0).toBe(1);
    expect(html).toContain('class="lg:hidden"');
    expect(html).toContain('class="hidden lg:block"');
  });
});
