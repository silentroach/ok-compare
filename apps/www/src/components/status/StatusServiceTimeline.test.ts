/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import StatusServiceTimeline from './StatusServiceTimeline.astro';
import type { StatusTimelineIncidentInput } from '@/lib/status/timeline';

const NBSP = '\u00A0';

interface IncidentInput {
  readonly id: string;
  readonly kind?: StatusTimelineIncidentInput['kind'];
  readonly title?: string;
  readonly started_iso: string;
  readonly started_has_time?: boolean;
  readonly ended_iso?: string;
  readonly ended_has_time?: boolean;
  readonly is_active?: boolean;
}

const incident = (input: IncidentInput): StatusTimelineIncidentInput => ({
  id: input.id,
  url: `/status/incidents/${input.id}`,
  title: input.title ?? `Запись ${input.id}`,
  kind: input.kind ?? 'incident',
  started_iso: input.started_iso,
  started_has_time: input.started_has_time ?? true,
  ...(input.ended_iso ? { ended_iso: input.ended_iso } : {}),
  ended_has_time: input.ended_has_time ?? true,
  is_active: input.is_active ?? !input.ended_iso,
});

const renderTimeline = async (
  incidents: readonly StatusTimelineIncidentInput[],
): Promise<string> => {
  const container = await AstroContainer.create();

  return container.renderToString(StatusServiceTimeline, {
    props: {
      service: 'water',
      incidents,
      timelineDays: 10,
    },
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-10T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('StatusServiceTimeline', () => {
  it('renders visible segments plus hidden future incidents in SSR HTML', async () => {
    const html = await renderTimeline([
      incident({
        id: 'old-past',
        started_iso: '2026-04-20T00:00:00Z',
        ended_iso: '2026-04-22T00:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'maintenance-visible',
        kind: 'maintenance',
        started_iso: '2026-05-02T00:00:00Z',
        ended_iso: '2026-05-03T00:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'incident-active',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
      }),
      incident({
        id: 'maintenance-future',
        kind: 'maintenance',
        started_iso: '2026-05-12T00:00:00Z',
        ended_iso: '2026-05-13T00:00:00Z',
        is_active: false,
      }),
    ]);

    expect(html.match(/data-status-problem/g)?.length ?? 0).toBe(3);
    expect(html).not.toContain('data-status-segment="green"');
    expect(html).not.toContain('data-incident-id="old-past"');
    expect(html).toContain('data-incident-id="maintenance-visible"');
    expect(html).toContain('data-incident-id="incident-active"');
    expect(html).toMatch(
      /data-incident-id="maintenance-future"[^>]*data-status-problem[^>]*hidden/,
    );
  });

  it('keeps data attributes needed for later client hydration', async () => {
    const html = await renderTimeline([
      incident({
        id: 'maintenance-visible',
        kind: 'maintenance',
        started_iso: '2026-05-02T00:00:00Z',
        ended_iso: '2026-05-03T00:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'incident-active',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
      }),
      incident({
        id: 'maintenance-future',
        kind: 'maintenance',
        started_iso: '2026-05-12T00:00:00Z',
        ended_iso: '2026-05-13T00:00:00Z',
        is_active: false,
      }),
    ]);

    expect(html).toMatch(
      /data-incident-id="maintenance-visible"[^>]*data-status-problem[^>]*data-start="2026-05-02T00:00:00Z"[^>]*data-end="2026-05-03T00:00:00Z"/,
    );
    expect(html).toMatch(
      /data-incident-id="maintenance-visible"[^>]*data-tooltip-service-label="Вода"[^>]*data-tooltip-kind-label="Плановые работы"[^>]*data-tooltip-phase-label="завершено"/,
    );
    expect(html).toMatch(
      /data-incident-id="incident-active"[^>]*data-status-problem[^>]*data-start="2026-05-09T00:00:00Z"[^>]*data-tooltip-phase-icon="alert"/,
    );
    expect(html).not.toMatch(
      /data-incident-id="incident-active"[^>]*data-end=/,
    );
    expect(html).toMatch(
      /data-incident-id="maintenance-future"[^>]*data-status-problem[^>]*data-start="2026-05-12T00:00:00Z"[^>]*data-end="2026-05-13T00:00:00Z"[^>]*data-tooltip-phase-label="запланировано"[^>]*hidden/,
    );
  });

  it('collapses multiple same-day incidents into one timeline marker with grouped tooltip data', async () => {
    const html = await renderTimeline([
      incident({
        id: 'same-day-a',
        started_iso: '2026-05-09T03:00:00Z',
        ended_iso: '2026-05-09T03:40:00Z',
        is_active: false,
      }),
      incident({
        id: 'same-day-b',
        started_iso: '2026-05-09T08:10:00Z',
        ended_iso: '2026-05-09T08:45:00Z',
        is_active: false,
      }),
      incident({
        id: 'same-day-c',
        started_iso: '2026-05-09T19:20:00Z',
        ended_iso: '2026-05-09T20:05:00Z',
        is_active: false,
      }),
    ]);

    expect(html.match(/data-status-problem/g)?.length ?? 0).toBe(1);
    expect(html).toContain('data-tooltip-group-title="3');
    expect(html).toContain('data-tooltip-items="[');
    expect(html).not.toContain('data-tooltip-kind-label="Инцидент"');
  });

  it('renders typographic non-breaking spaces in tooltip date labels', async () => {
    const html = await renderTimeline([
      incident({
        id: 'incident-active',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
      }),
    ]);

    expect(html).toContain(
      `data-tooltip-period-label="Начиная с${NBSP}9${NBSP}мая, 03:00"`,
    );
    expect(html).toContain(
      `aria-label="Вода. Инцидент. Запись incident-active. Статус: идет. Начиная с${NBSP}9${NBSP}мая, 03:00"`,
    );
  });

  it('renders a shared tooltip shell in SSR HTML', async () => {
    const html = await renderTimeline([
      incident({
        id: 'incident-active',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
      }),
    ]);

    expect(html).toContain('data-status-timeline-tooltip');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('data-status-tooltip-title');
    expect(html).toContain('data-status-tooltip-phase-icon-alert');
    expect(html).toContain('data-status-tooltip-phase-icon-check');
  });

  it('uses different tone classes for maintenance and incident entries', async () => {
    const html = await renderTimeline([
      incident({
        id: 'maintenance-visible',
        kind: 'maintenance',
        started_iso: '2026-05-02T00:00:00Z',
        ended_iso: '2026-05-03T00:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'incident-visible',
        started_iso: '2026-05-05T00:00:00Z',
        ended_iso: '2026-05-06T00:00:00Z',
        is_active: false,
      }),
    ]);

    expect(html).toMatch(
      /data-incident-id="maintenance-visible"[^>]*status-service-timeline__segment--amber/,
    );
    expect(html).toMatch(
      /data-incident-id="incident-visible"[^>]*status-service-timeline__segment--red/,
    );
  });

  it('marks active incidents that reach now so they can visually touch the right edge', async () => {
    const html = await renderTimeline([
      incident({
        id: 'incident-active',
        started_iso: '2026-05-09T23:40:00Z',
        is_active: true,
      }),
    ]);

    expect(html).toMatch(
      /data-incident-id="incident-active"[^>]*status-service-timeline__segment--problem-active-end/,
    );
  });
});
