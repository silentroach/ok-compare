// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest';

import { hydrateStatusTimeline, hydrateStatusTimelines } from './timeline.dom';

interface ProblemNodeInput {
  readonly id: string;
  readonly start: string;
  readonly end?: string;
  readonly tone?: 'amber' | 'red';
}

const renderTimeline = (
  nodes: readonly ProblemNodeInput[],
  rangeDays = 10,
): HTMLElement => {
  document.body.innerHTML = `
    <div data-status-timeline data-range-days="${String(rangeDays)}">
      <div data-status-timeline-track>
        ${nodes
          .map(
            ({ end, id, start, tone = 'red' }) => `
              <a
                href="/status/incidents/${id}"
                data-incident-id="${id}"
                data-status-problem
                data-start="${start}"
                ${end ? `data-end="${end}"` : ''}
                class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--${tone}"
              ></a>
            `,
          )
          .join('')}
      </div>
    </div>
  `;

  return document.querySelector('[data-status-timeline]') as HTMLElement;
};

const getGreenSegments = (): HTMLElement[] =>
  Array.from(
    document.querySelectorAll('[data-status-segment="green"]'),
  ) as HTMLElement[];

const getProblemNode = (id: string): HTMLElement =>
  document.querySelector(`[data-incident-id="${id}"]`) as HTMLElement;

const readSegmentMetric = (
  element: HTMLElement,
  name: '--segment-left' | '--segment-width',
): number => Number(element.style.getPropertyValue(name));

afterEach(() => {
  document.body.innerHTML = '';
  delete window.__STATUS_TIMELINE_NOW__;
});

describe('hydrateStatusTimeline', () => {
  it('hides a problem segment that has fallen out of the client-side window', () => {
    const root = renderTimeline([
      {
        id: 'expired',
        start: '2026-05-01T00:00:00Z',
        end: '2026-05-02T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-15T00:00:00Z'),
    });

    expect(getProblemNode('expired').hidden).toBe(true);
    expect(getGreenSegments()).toHaveLength(1);
    expect(
      readSegmentMetric(getGreenSegments()[0]!, '--segment-left'),
    ).toBeCloseTo(0);
    expect(
      readSegmentMetric(getGreenSegments()[0]!, '--segment-width'),
    ).toBeCloseTo(100);
  });

  it('clips an active problem without end date to the client-side now', () => {
    const root = renderTimeline([
      {
        id: 'active',
        start: '2026-05-08T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const node = getProblemNode('active');

    expect(node.hidden).toBe(false);
    expect(readSegmentMetric(node, '--segment-left')).toBeCloseTo(80);
    expect(readSegmentMetric(node, '--segment-width')).toBeCloseTo(20);
  });

  it('adds green stable gaps before, between, and after problem segments', () => {
    const root = renderTimeline([
      {
        id: 'first',
        start: '2026-05-02T00:00:00Z',
        end: '2026-05-03T00:00:00Z',
      },
      {
        id: 'second',
        start: '2026-05-05T00:00:00Z',
        end: '2026-05-07T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const green = getGreenSegments();

    expect(green).toHaveLength(3);
    expect(readSegmentMetric(green[0]!, '--segment-left')).toBeCloseTo(0);
    expect(readSegmentMetric(green[0]!, '--segment-width')).toBeCloseTo(20);
    expect(readSegmentMetric(green[1]!, '--segment-left')).toBeCloseTo(30);
    expect(readSegmentMetric(green[1]!, '--segment-width')).toBeCloseTo(20);
    expect(readSegmentMetric(green[2]!, '--segment-left')).toBeCloseTo(70);
    expect(readSegmentMetric(green[2]!, '--segment-width')).toBeCloseTo(30);
  });

  it('does not create a false green gap between overlapping problems', () => {
    const root = renderTimeline([
      {
        id: 'overlap-a',
        start: '2026-05-02T00:00:00Z',
        end: '2026-05-05T00:00:00Z',
      },
      {
        id: 'overlap-b',
        start: '2026-05-04T00:00:00Z',
        end: '2026-05-06T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const green = getGreenSegments();

    expect(green).toHaveLength(2);
    expect(readSegmentMetric(green[0]!, '--segment-width')).toBeCloseTo(20);
    expect(readSegmentMetric(green[1]!, '--segment-left')).toBeCloseTo(60);
    expect(readSegmentMetric(green[1]!, '--segment-width')).toBeCloseTo(40);
  });

  it('remains idempotent when hydration runs multiple times', () => {
    const root = renderTimeline([
      {
        id: 'single',
        start: '2026-05-02T00:00:00Z',
        end: '2026-05-03T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });
    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    expect(getGreenSegments()).toHaveLength(2);
  });

  it('uses deterministic now overrides and exits softly on incomplete DOM', () => {
    document.body.innerHTML = `
      <section>
        <div data-status-timeline data-range-days="10">
          <div data-status-timeline-track>
            <a
              href="/status/incidents/scoped"
              data-incident-id="scoped"
              data-status-problem
              data-start="2026-05-08T00:00:00Z"
              class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--red"
            ></a>
          </div>
        </div>
        <div data-status-timeline data-range-days="10"></div>
      </section>
    `;

    window.__STATUS_TIMELINE_NOW__ = Date.parse('2026-05-10T00:00:00Z');

    expect(() => hydrateStatusTimelines(document)).not.toThrow();

    const scoped = getProblemNode('scoped');

    expect(readSegmentMetric(scoped, '--segment-left')).toBeCloseTo(80);
    expect(readSegmentMetric(scoped, '--segment-width')).toBeCloseTo(20);

    hydrateStatusTimelines(document, {
      nowMs: Date.parse('2026-05-09T00:00:00Z'),
    });

    expect(readSegmentMetric(scoped, '--segment-left')).toBeCloseTo(90);
    expect(readSegmentMetric(scoped, '--segment-width')).toBeCloseTo(10);
  });
});
