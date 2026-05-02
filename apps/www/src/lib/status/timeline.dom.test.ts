// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest';

import { hydrateStatusTimeline, hydrateStatusTimelines } from './timeline.dom';

interface TooltipInput {
  readonly serviceLabel: string;
  readonly kindLabel: string;
  readonly title: string;
  readonly phaseLabel: string;
  readonly phaseIcon?: 'alert' | 'check';
  readonly periodLabel: string;
}

interface ProblemNodeInput {
  readonly id: string;
  readonly start: string;
  readonly end?: string;
  readonly tone?: 'amber' | 'red';
  readonly tooltip?: Partial<TooltipInput>;
}

const escapeAttribute = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const buildTooltip = (
  id: string,
  tooltip?: Partial<TooltipInput>,
): TooltipInput => ({
  serviceLabel: 'Вода',
  kindLabel: 'Инцидент',
  title: `Запись ${id}`,
  phaseLabel: 'идет',
  phaseIcon: 'alert',
  periodLabel: 'Начиная с 8 мая, 07:32',
  ...tooltip,
});

const buildTooltipLabel = (tooltip: TooltipInput): string =>
  [
    tooltip.serviceLabel,
    tooltip.kindLabel,
    tooltip.title,
    `Статус: ${tooltip.phaseLabel}`,
    tooltip.periodLabel,
  ].join('. ');

const renderTimeline = (
  nodes: readonly ProblemNodeInput[],
  rangeDays = 10,
): HTMLElement => {
  document.body.innerHTML = `
    <div data-status-timeline data-range-days="${String(rangeDays)}">
      <div data-status-timeline-track>
        ${nodes
          .map(({ end, id, start, tone = 'red', tooltip: rawTooltip }) => {
            const tooltip = buildTooltip(id, rawTooltip);

            return `
              <a
                href="/status/incidents/${id}"
                title="${escapeAttribute(buildTooltipLabel(tooltip))}"
                data-incident-id="${id}"
                data-status-problem
                data-start="${start}"
                ${end ? `data-end="${end}"` : ''}
                data-tooltip-service-label="${escapeAttribute(tooltip.serviceLabel)}"
                data-tooltip-kind-label="${escapeAttribute(tooltip.kindLabel)}"
                data-tooltip-title="${escapeAttribute(tooltip.title)}"
                data-tooltip-phase-label="${escapeAttribute(tooltip.phaseLabel)}"
                ${tooltip.phaseIcon ? `data-tooltip-phase-icon="${tooltip.phaseIcon}"` : ''}
                data-tooltip-period-label="${escapeAttribute(tooltip.periodLabel)}"
                class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--${tone}"
              ></a>
            `;
          })
          .join('')}
      </div>
      <div
        id="status-service-timeline-tooltip-test"
        data-status-timeline-tooltip
        role="tooltip"
        aria-hidden="true"
        hidden
      >
        <p>
          <span data-status-tooltip-phase-icon-alert hidden></span>
          <span data-status-tooltip-phase-icon-check hidden></span>
          <span data-status-tooltip-title></span>
        </p>
        <p data-status-tooltip-period></p>
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

const getTooltip = (): HTMLElement =>
  document.querySelector('[data-status-timeline-tooltip]') as HTMLElement;

const getTooltipField = (selector: string): HTMLElement =>
  getTooltip().querySelector(selector) as HTMLElement;

const readSegmentMetric = (
  element: HTMLElement,
  name: '--segment-left' | '--segment-width',
): number => Number(element.style.getPropertyValue(name));

const mockRect = (
  element: Element,
  rect: {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  },
): void => {
  const value = {
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => '',
  } satisfies DOMRect;

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => value,
  });
};

const mockSize = (
  element: HTMLElement,
  size: { readonly width: number; readonly height: number },
): void => {
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get: () => size.width,
  });
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    get: () => size.height,
  });
};

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

  it('opens and closes the shared tooltip on hover', () => {
    const root = renderTimeline([
      {
        id: 'hover',
        start: '2026-05-08T00:00:00Z',
        tooltip: {
          serviceLabel: 'Электричество',
          kindLabel: 'Инцидент',
          title: 'Отключение электричества',
          phaseLabel: 'восстановлено',
          phaseIcon: 'check',
          periodLabel: '22 апреля, 19:30 - 23 апреля, 00:00 (4 ч. 30 мин.)',
        },
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const node = getProblemNode('hover');
    const tooltip = getTooltip();

    node.dispatchEvent(new Event('mouseenter'));

    expect(tooltip.hidden).toBe(false);
    expect(root.dataset.statusTooltipOpen).toBe('true');
    expect(node.getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(getTooltipField('[data-status-tooltip-title]').textContent).toBe(
      'Отключение электричества',
    );
    expect(
      getTooltipField('[data-status-tooltip-phase-icon-check]').hidden,
    ).toBe(false);

    node.dispatchEvent(new Event('mouseleave'));

    expect(tooltip.hidden).toBe(true);
    expect(root.dataset.statusTooltipOpen).toBeUndefined();
    expect(node.hasAttribute('aria-describedby')).toBe(false);
  });

  it('opens on focus and closes on focusout and Escape', () => {
    const root = renderTimeline([
      {
        id: 'focus',
        start: '2026-05-08T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const node = getProblemNode('focus');
    const tooltip = getTooltip();

    node.dispatchEvent(new FocusEvent('focusin'));
    expect(tooltip.hidden).toBe(false);

    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(tooltip.hidden).toBe(true);

    node.dispatchEvent(new FocusEvent('focusin'));
    node.dispatchEvent(new FocusEvent('focusout'));
    expect(tooltip.hidden).toBe(true);
  });

  it('removes the native title after hydration to avoid double tooltips', () => {
    const root = renderTimeline([
      {
        id: 'title',
        start: '2026-05-08T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    expect(getProblemNode('title').getAttribute('title')).toBeNull();
  });

  it('fills tooltip text from data attributes without injecting HTML', () => {
    const root = renderTimeline([
      {
        id: 'safe',
        start: '2026-05-08T00:00:00Z',
        tooltip: {
          title: '<strong>Опасно</strong>',
        },
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    getProblemNode('safe').dispatchEvent(new Event('mouseenter'));

    expect(getTooltipField('[data-status-tooltip-title]').textContent).toBe(
      '<strong>Опасно</strong>',
    );
    expect(getTooltipField('[data-status-tooltip-title]').innerHTML).toBe(
      '&lt;strong&gt;Опасно&lt;/strong&gt;',
    );
  });

  it('clamps tooltip position within the component width', () => {
    const root = renderTimeline([
      {
        id: 'clamp',
        start: '2026-05-08T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const node = getProblemNode('clamp');
    const tooltip = getTooltip();

    mockRect(root, { left: 100, top: 120, width: 300, height: 16 });
    mockRect(node, { left: 120, top: 123, width: 8, height: 10 });
    mockSize(tooltip, { width: 180, height: 120 });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });

    node.dispatchEvent(new Event('mouseenter'));

    expect(tooltip.style.left).toBe('98px');
    expect(tooltip.dataset.side).toBe('below');
  });

  it('flips the tooltip above for lower rows when there is not enough space below', () => {
    const root = renderTimeline([
      {
        id: 'above',
        start: '2026-05-08T00:00:00Z',
      },
    ]);

    hydrateStatusTimeline(root, {
      nowMs: Date.parse('2026-05-10T00:00:00Z'),
    });

    const node = getProblemNode('above');
    const tooltip = getTooltip();

    mockRect(root, { left: 100, top: 160, width: 320, height: 16 });
    mockRect(node, { left: 250, top: 164, width: 10, height: 10 });
    mockSize(tooltip, { width: 220, height: 140 });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 220,
    });

    node.dispatchEvent(new Event('mouseenter'));

    expect(tooltip.dataset.side).toBe('above');
  });

  it('uses deterministic now overrides and exits softly on incomplete DOM', () => {
    document.body.innerHTML = `
      <section>
        <div data-status-timeline data-range-days="10">
          <div data-status-timeline-track>
            <a
              href="/status/incidents/scoped"
              title="Вода. Инцидент. Scoped. Статус: идет. Начиная с 8 мая, 07:32"
              data-incident-id="scoped"
              data-status-problem
              data-start="2026-05-08T00:00:00Z"
              data-tooltip-service-label="Вода"
              data-tooltip-kind-label="Инцидент"
              data-tooltip-title="Scoped"
              data-tooltip-phase-label="идет"
              data-tooltip-phase-icon="alert"
              data-tooltip-period-label="Начиная с 8 мая, 07:32"
              class="status-service-timeline__segment status-service-timeline__segment--problem status-service-timeline__segment--red"
            ></a>
          </div>
          <div
            id="status-service-timeline-tooltip-scoped"
            data-status-timeline-tooltip
            role="tooltip"
            aria-hidden="true"
            hidden
          >
            <p>
              <span data-status-tooltip-phase-icon-alert hidden></span>
              <span data-status-tooltip-phase-icon-check hidden></span>
              <span data-status-tooltip-title></span>
            </p>
            <p data-status-tooltip-period></p>
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
