/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import StatusServiceTimeline from './StatusServiceTimeline.astro';
import type { StatusArea } from '@/lib/status/schema';
import type { StatusTimelineIncidentInput } from '@/lib/status/timeline';

const NBSP = '\u00A0';

interface IncidentInput {
  readonly id: string;
  readonly kind?: StatusTimelineIncidentInput['kind'];
  readonly has_page?: boolean;
  readonly title?: string;
  readonly started_iso: string;
  readonly started_has_time?: boolean;
  readonly ended_iso?: string;
  readonly ended_has_time?: boolean;
  readonly is_active?: boolean;
  readonly areas?: readonly StatusArea[];
}

const incident = (input: IncidentInput): StatusTimelineIncidentInput => ({
  id: input.id,
  url: `/status/incidents/${input.id}`,
  has_page: input.has_page ?? true,
  title: input.title ?? `Запись ${input.id}`,
  kind: input.kind ?? 'incident',
  started_iso: input.started_iso,
  started_has_time: input.started_has_time ?? true,
  ...(input.ended_iso ? { ended_iso: input.ended_iso } : {}),
  ended_has_time: input.ended_has_time ?? true,
  is_active: input.is_active ?? !input.ended_iso,
  ...(input.areas ? { areas: input.areas } : {}),
});

const renderTimeline = async (
  incidents: readonly StatusTimelineIncidentInput[],
  timelineDays = 10,
): Promise<string> => {
  const container = await AstroContainer.create();

  return container.renderToString(StatusServiceTimeline, {
    props: {
      service: 'water',
      incidents,
      timelineDays,
    },
  });
};

const astroGeneratedAttribute =
  /\sdata-astro-(?:cid-[^=\s>]+="true"|source-(?:file|loc)="[^"]*")/gu;
const normalizeHtml = (html: string): string =>
  html
    .replace(astroGeneratedAttribute, '')
    .replaceAll('&quot;', '&#34;')
    .replaceAll(NBSP, '·')
    .replace(/>\s+</gu, '><')
    .replace(/</gu, '\n<')
    .trim();

const incidentSegmentTag = (html: string, id: string): string =>
  normalizeHtml(
    html.match(
      new RegExp(
        `<(?:a|button|span)\\b[^>]*data-incident-id="${id}"[^>]*>`,
        'u',
      ),
    )?.[0] ?? '',
  );

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

  it('serializes area icons only for explicitly scoped incidents', async () => {
    const html = await renderTimeline([
      incident({
        id: 'park-outage',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
        areas: ['park'],
      }),
      incident({
        id: 'all-village-outage',
        started_iso: '2026-05-08T00:00:00Z',
        ended_iso: '2026-05-08T01:00:00Z',
        is_active: false,
      }),
    ]);

    expect(normalizeHtml(html)).toMatch(
      /data-incident-id="park-outage"[^>]*data-tooltip-areas="\[&#34;park&#34;\]"/,
    );
    expect(html).toMatch(
      new RegExp(
        `data-incident-id="park-outage"[^>]*data-tooltip-area-label="Шелково${NBSP}Парк"`,
      ),
    );
    expect(html).not.toMatch(
      /data-incident-id="all-village-outage"[^>]*data-tooltip-areas=/,
    );
  });

  it('applies typography to tooltip titles', async () => {
    const html = await renderTimeline([
      incident({
        id: 'park-outage',
        title: 'Нет воды в Шелково Парк',
        started_iso: '2026-05-09T00:00:00Z',
        is_active: true,
      }),
    ]);

    expect(html).toContain(
      `data-tooltip-title="Нет воды в${NBSP}Шелково${NBSP}Парк"`,
    );
  });

  it('renders links and tooltip-only markers with semantic segment elements', async () => {
    const html = await renderTimeline([
      incident({
        id: 'no-page',
        has_page: false,
        started_iso: '2026-05-08T00:00:00Z',
        ended_iso: '2026-05-08T01:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'with-page',
        started_iso: '2026-05-09T00:00:00Z',
        ended_iso: '2026-05-09T01:00:00Z',
        is_active: false,
      }),
    ]);

    expect([
      incidentSegmentTag(html, 'no-page'),
      incidentSegmentTag(html, 'with-page'),
    ]).toMatchInlineSnapshot(`
      [
        "<button type="button" title="Вода. Инцидент. Запись no-page. Статус: восстановлено. 8·мая, 03:00·—·04:00" aria-label="Вода. Инцидент. Запись no-page. Статус: восстановлено. 8·мая, 03:00·—·04:00" data-incident-id="no-page" data-status-problem="true" data-status-kind="incident" data-status-service="water" data-start="2026-05-08T00:00:00Z" data-end="2026-05-08T01:00:00Z" data-geometry-start="2026-05-07T21:00:00.000Z" data-geometry-end="2026-05-08T21:00:00.000Z" data-tooltip-service-label="Вода" data-tooltip-kind-label="Инцидент" data-tooltip-title="Запись no-page" data-tooltip-phase-label="восстановлено" data-tooltip-phase-icon="check" data-tooltip-period-label="8·мая, 03:00·—·04:00" style="--segment-left: 78.75; --segment-width: 10;" class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--compact-marker status-service-timeline__segment--red">",
        "<a href="/status/incidents/with-page" title="Вода. Инцидент. Запись with-page. Статус: восстановлено. 9·мая, 03:00·—·04:00" aria-label="Вода. Инцидент. Запись with-page. Статус: восстановлено. 9·мая, 03:00·—·04:00" data-incident-id="with-page" data-status-problem="true" data-status-kind="incident" data-status-service="water" data-start="2026-05-09T00:00:00Z" data-end="2026-05-09T01:00:00Z" data-geometry-start="2026-05-08T21:00:00.000Z" data-geometry-end="2026-05-09T21:00:00.000Z" data-tooltip-service-label="Вода" data-tooltip-kind-label="Инцидент" data-tooltip-title="Запись with-page" data-tooltip-phase-label="восстановлено" data-tooltip-phase-icon="check" data-tooltip-period-label="9·мая, 03:00·—·04:00" style="--segment-left: 88.75; --segment-width: 10;" class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--compact-marker status-service-timeline__segment--red">",
      ]
    `);
  });

  it('marks any affected single day with the full visible day slot', async () => {
    const html = await renderTimeline([
      incident({
        id: 'short-single-day',
        started_iso: '2026-05-07T00:00:00Z',
        ended_iso: '2026-05-07T00:15:00Z',
        is_active: false,
      }),
      incident({
        id: 'long-single-day',
        started_iso: '2026-05-08T00:00:00Z',
        ended_iso: '2026-05-08T09:00:00Z',
        is_active: false,
      }),
      incident({
        id: 'active-single-day',
        started_iso: '2026-05-09T21:00:00Z',
        is_active: true,
      }),
    ]);

    expect(incidentSegmentTag(html, 'short-single-day')).toContain(
      '--segment-width: 10;',
    );
    expect(incidentSegmentTag(html, 'long-single-day')).toContain(
      '--segment-width: 10;',
    );
    expect(incidentSegmentTag(html, 'active-single-day')).toContain(
      '--segment-width: 10;',
    );
    expect(incidentSegmentTag(html, 'long-single-day')).toContain(
      'status-service-timeline__segment--compact-marker',
    );
    expect(incidentSegmentTag(html, 'active-single-day')).toContain(
      'status-service-timeline__segment--compact-marker',
    );

    const shorterRangeHtml = await renderTimeline(
      [
        incident({
          id: 'shorter-range-single-day',
          started_iso: '2026-05-09T00:00:00Z',
          ended_iso: '2026-05-09T01:00:00Z',
          is_active: false,
        }),
      ],
      5,
    );

    expect(
      incidentSegmentTag(shorterRangeHtml, 'shorter-range-single-day'),
    ).toContain('--segment-width: 20;');
  });

  it('marks every affected day for cross-day incidents', async () => {
    const html = await renderTimeline([
      incident({
        id: 'cross-day-short',
        started_iso: '2026-05-08T20:30:00Z',
        ended_iso: '2026-05-08T22:00:00Z',
        is_active: false,
      }),
    ]);

    expect(incidentSegmentTag(html, 'cross-day-short')).toContain(
      '--segment-width: 20;',
    );
  });

  it('keeps compact grouped markers tooltip-only', async () => {
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
    ]);

    expect(incidentSegmentTag(html, 'same-day-a')).toMatchInlineSnapshot(
      `"<button type="button" title="Вода. 2·события за·9·мая. Запись same-day-a. 9·мая, 06:00·—·06:40. Запись same-day-b. 9·мая, 11:10·—·11:45" aria-label="Вода. 2·события за·9·мая. Запись same-day-a. 9·мая, 06:00·—·06:40. Запись same-day-b. 9·мая, 11:10·—·11:45" data-incident-id="same-day-a" data-status-problem="true" data-status-kind="incident" data-status-service="water" data-start="2026-05-09T03:00:00Z" data-end="2026-05-09T08:45:00Z" data-geometry-start="2026-05-08T21:00:00.000Z" data-geometry-end="2026-05-09T21:00:00.000Z" data-tooltip-service-label="Вода" data-tooltip-group-title="2·события за·9·мая" data-tooltip-items="[{&#34;kind&#34;:&#34;incident&#34;,&#34;title&#34;:&#34;Запись same-day-a&#34;,&#34;is_active&#34;:false,&#34;started_iso&#34;:&#34;2026-05-09T03:00:00Z&#34;,&#34;started_has_time&#34;:true,&#34;ended_iso&#34;:&#34;2026-05-09T03:40:00Z&#34;,&#34;ended_has_time&#34;:true},{&#34;kind&#34;:&#34;incident&#34;,&#34;title&#34;:&#34;Запись same-day-b&#34;,&#34;is_active&#34;:false,&#34;started_iso&#34;:&#34;2026-05-09T08:10:00Z&#34;,&#34;started_has_time&#34;:true,&#34;ended_iso&#34;:&#34;2026-05-09T08:45:00Z&#34;,&#34;ended_has_time&#34;:true}]" style="--segment-left: 88.75; --segment-width: 10;" class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--compact-marker status-service-timeline__segment--red">"`,
    );
  });

  it('groups short active same-day incidents with dense compact markers', async () => {
    const html = await renderTimeline([
      incident({
        id: 'dense-ended',
        started_iso: '2026-05-09T22:10:00Z',
        ended_iso: '2026-05-09T22:30:00Z',
        is_active: false,
      }),
      incident({
        id: 'dense-active',
        started_iso: '2026-05-09T23:40:00Z',
        is_active: true,
      }),
    ]);

    expect(html.match(/data-status-problem/g)?.length ?? 0).toBe(1);
    expect(incidentSegmentTag(html, 'dense-ended')).toContain('<button');
    expect(incidentSegmentTag(html, 'dense-ended')).toContain(
      'data-tooltip-group-title="2·события за·10·мая"',
    );
    expect(incidentSegmentTag(html, 'dense-ended')).toContain(
      '&#34;title&#34;:&#34;Запись dense-active&#34;',
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
