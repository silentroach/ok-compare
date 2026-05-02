import {
  buildStatusTimelineStableSegments,
  clipStatusTimelineSpan,
  getStatusTimelineSegmentGeometry,
  getStatusTimelineRange,
  type StatusTimelineSpan,
} from './timeline';

export interface StatusTimelineHydrationOptions {
  readonly nowMs?: number;
}

interface StatusTimelineProblemNode {
  readonly element: HTMLElement;
  readonly startMs: number;
  readonly endMs?: number;
}

declare global {
  interface Window {
    __STATUS_TIMELINE_NOW__?: unknown;
  }
}

const STATUS_TIMELINE_SELECTOR = '[data-status-timeline]';
const STATUS_TIMELINE_TRACK_SELECTOR = '[data-status-timeline-track]';
const STATUS_TIMELINE_PROBLEM_SELECTOR = '[data-status-problem]';
const STATUS_TIMELINE_GREEN_SELECTOR = '[data-status-segment="green"]';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const hideStatusTimelineSegment = (element: HTMLElement): void => {
  element.hidden = true;
};

const showStatusTimelineSegment = (
  element: HTMLElement,
  geometry: { readonly leftPercent: number; readonly widthPercent: number },
): void => {
  element.style.setProperty('--segment-left', String(geometry.leftPercent));
  element.style.setProperty('--segment-width', String(geometry.widthPercent));
  element.hidden = false;
};

const parseStatusTimelineProblemNode = (
  element: HTMLElement,
): StatusTimelineProblemNode | undefined => {
  const startMs = Date.parse(element.dataset.start ?? '');

  if (!Number.isFinite(startMs)) {
    return undefined;
  }

  const rawEnd = element.dataset.end;

  if (!rawEnd) {
    return {
      element,
      startMs,
    };
  }

  const endMs = Date.parse(rawEnd);

  if (!Number.isFinite(endMs)) {
    return undefined;
  }

  return {
    element,
    startMs,
    endMs,
  };
};

const appendStatusTimelineGreenSegment = (
  track: HTMLElement,
  segment: { readonly leftPercent: number; readonly widthPercent: number },
): void => {
  const element = document.createElement('span');

  element.dataset.statusSegment = 'green';
  element.className =
    'status-service-timeline__segment status-service-timeline__segment--green';
  element.title = 'Без инцидентов';
  element.setAttribute('aria-hidden', 'true');
  showStatusTimelineSegment(element, segment);
  track.append(element);
};

const getStatusTimelineNowMs = (
  opts?: StatusTimelineHydrationOptions,
): number => {
  if (isFiniteNumber(opts?.nowMs)) {
    return opts.nowMs;
  }

  // Test/fixture override keeps DOM hydration deterministic.
  if (
    typeof window !== 'undefined' &&
    isFiniteNumber(window.__STATUS_TIMELINE_NOW__)
  ) {
    return window.__STATUS_TIMELINE_NOW__;
  }

  return Date.now();
};

export const hydrateStatusTimeline = (
  root: HTMLElement,
  opts?: StatusTimelineHydrationOptions,
): void => {
  const rangeDays = Number(root.dataset.rangeDays ?? '');

  if (!Number.isFinite(rangeDays) || rangeDays <= 0) {
    return;
  }

  const track = root.querySelector(STATUS_TIMELINE_TRACK_SELECTOR);

  if (!(track instanceof HTMLElement)) {
    return;
  }

  track
    .querySelectorAll(STATUS_TIMELINE_GREEN_SELECTOR)
    .forEach((node) => node.remove());

  const range = getStatusTimelineRange(getStatusTimelineNowMs(opts), rangeDays);

  if (range.spanMs <= 0) {
    return;
  }

  const problemSpans: StatusTimelineSpan[] = [];

  track.querySelectorAll(STATUS_TIMELINE_PROBLEM_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    hideStatusTimelineSegment(node);

    const problemNode = parseStatusTimelineProblemNode(node);

    if (!problemNode) {
      return;
    }

    const span = clipStatusTimelineSpan(problemNode, range);

    if (!span) {
      return;
    }

    showStatusTimelineSegment(
      problemNode.element,
      getStatusTimelineSegmentGeometry(span, range),
    );
    problemSpans.push(span);
  });

  buildStatusTimelineStableSegments(problemSpans, range).forEach((segment) => {
    appendStatusTimelineGreenSegment(track, segment);
  });
};

export const hydrateStatusTimelines = (
  scope?: ParentNode,
  opts?: StatusTimelineHydrationOptions,
): void => {
  const rootScope =
    scope ?? (typeof document === 'undefined' ? undefined : document);

  if (!rootScope) {
    return;
  }

  const nowMs = getStatusTimelineNowMs(opts);

  rootScope.querySelectorAll(STATUS_TIMELINE_SELECTOR).forEach((root) => {
    if (root instanceof HTMLElement) {
      hydrateStatusTimeline(root, { nowMs });
    }
  });
};
