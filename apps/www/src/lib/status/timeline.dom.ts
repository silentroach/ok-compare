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
  readonly kind?: 'incident' | 'maintenance';
  readonly startMs: number;
  readonly endMs?: number;
}

interface StatusTimelineTooltipData {
  readonly title: string;
  readonly phaseIcon?: 'alert' | 'check';
  readonly periodLabel: string;
}

interface StatusTimelineTooltipElements {
  readonly shell: HTMLElement;
  readonly title: HTMLElement;
  readonly phaseAlertIcon: HTMLElement;
  readonly phaseCheckIcon: HTMLElement;
  readonly period: HTMLElement;
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
const STATUS_TIMELINE_TOOLTIP_SELECTOR = '[data-status-timeline-tooltip]';
const STATUS_TIMELINE_TOOLTIP_MARGIN_PX = 8;

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

const getStatusTimelineTooltip = (
  root: HTMLElement,
): StatusTimelineTooltipElements | undefined => {
  const shell = root.querySelector(STATUS_TIMELINE_TOOLTIP_SELECTOR);

  if (!(shell instanceof HTMLElement)) {
    return undefined;
  }

  const title = shell.querySelector('[data-status-tooltip-title]');
  const phaseAlertIcon = shell.querySelector(
    '[data-status-tooltip-phase-icon-alert]',
  );
  const phaseCheckIcon = shell.querySelector(
    '[data-status-tooltip-phase-icon-check]',
  );
  const period = shell.querySelector('[data-status-tooltip-period]');

  if (
    !(title instanceof HTMLElement) ||
    !(phaseAlertIcon instanceof HTMLElement) ||
    !(phaseCheckIcon instanceof HTMLElement) ||
    !(period instanceof HTMLElement)
  ) {
    return undefined;
  }

  return {
    shell,
    title,
    phaseAlertIcon,
    phaseCheckIcon,
    period,
  };
};

const readStatusTimelineTooltipData = (
  trigger: HTMLElement,
): StatusTimelineTooltipData | undefined => {
  const title = trigger.dataset.tooltipTitle;
  const phaseIcon = trigger.dataset.tooltipPhaseIcon;
  const periodLabel = trigger.dataset.tooltipPeriodLabel;

  if (!title || !periodLabel) {
    return undefined;
  }

  return {
    title,
    ...(phaseIcon === 'alert' || phaseIcon === 'check' ? { phaseIcon } : {}),
    periodLabel,
  };
};

const setStatusTimelineProblemAriaLabel = (element: HTMLElement): void => {
  const serviceLabel = element.dataset.tooltipServiceLabel;
  const kindLabel = element.dataset.tooltipKindLabel;
  const title = element.dataset.tooltipTitle;
  const phaseLabel = element.dataset.tooltipPhaseLabel;
  const periodLabel = element.dataset.tooltipPeriodLabel;

  if (!serviceLabel || !kindLabel || !title || !phaseLabel || !periodLabel) {
    return;
  }

  element.setAttribute(
    'aria-label',
    [serviceLabel, kindLabel, title, `Статус: ${phaseLabel}`, periodLabel].join(
      '. ',
    ),
  );
};

const syncStatusTimelineProblemPhase = (
  problemNode: StatusTimelineProblemNode,
  nowMs: number,
): void => {
  if (problemNode.kind !== 'incident' && problemNode.kind !== 'maintenance') {
    return;
  }

  if (problemNode.startMs > nowMs) {
    problemNode.element.dataset.tooltipPhaseLabel =
      problemNode.kind === 'maintenance' ? 'запланировано' : 'ожидается';
    delete problemNode.element.dataset.tooltipPhaseIcon;
    setStatusTimelineProblemAriaLabel(problemNode.element);
    return;
  }

  if (problemNode.endMs === undefined || problemNode.endMs > nowMs) {
    problemNode.element.dataset.tooltipPhaseLabel = 'идет';

    if (problemNode.kind === 'incident') {
      problemNode.element.dataset.tooltipPhaseIcon = 'alert';
    } else {
      delete problemNode.element.dataset.tooltipPhaseIcon;
    }

    setStatusTimelineProblemAriaLabel(problemNode.element);
    return;
  }

  problemNode.element.dataset.tooltipPhaseLabel =
    problemNode.kind === 'maintenance' ? 'завершено' : 'восстановлено';

  if (problemNode.kind === 'incident') {
    problemNode.element.dataset.tooltipPhaseIcon = 'check';
  } else {
    delete problemNode.element.dataset.tooltipPhaseIcon;
  }

  setStatusTimelineProblemAriaLabel(problemNode.element);
};

const closeStatusTimelineTooltip = (
  root: HTMLElement,
  tooltip: StatusTimelineTooltipElements,
): void => {
  root.querySelectorAll(STATUS_TIMELINE_PROBLEM_SELECTOR).forEach((node) => {
    if (
      node instanceof HTMLElement &&
      node.getAttribute('aria-describedby') === tooltip.shell.id
    ) {
      node.removeAttribute('aria-describedby');
    }
  });

  tooltip.shell.hidden = true;
  tooltip.shell.setAttribute('aria-hidden', 'true');
  delete root.dataset.statusTooltipOpen;
};

const positionStatusTimelineTooltip = (
  root: HTMLElement,
  trigger: HTMLElement,
  tooltip: HTMLElement,
): void => {
  const rootRect = root.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipHeight = tooltip.offsetHeight;
  const center = triggerRect.left - rootRect.left + triggerRect.width / 2;
  const minLeft = tooltip.offsetWidth / 2 + STATUS_TIMELINE_TOOLTIP_MARGIN_PX;
  const maxLeft = Math.max(
    minLeft,
    rootRect.width -
      tooltip.offsetWidth / 2 -
      STATUS_TIMELINE_TOOLTIP_MARGIN_PX,
  );
  const left = Math.min(Math.max(center, minLeft), maxLeft);
  const spaceBelow = window.innerHeight - rootRect.bottom;
  const spaceAbove = rootRect.top;
  const side =
    spaceBelow >= tooltipHeight + STATUS_TIMELINE_TOOLTIP_MARGIN_PX ||
    spaceBelow >= spaceAbove
      ? 'below'
      : 'above';

  tooltip.dataset.side = side;
  tooltip.style.left = `${left}px`;
};

const openStatusTimelineTooltip = (
  root: HTMLElement,
  trigger: HTMLElement,
  tooltip: StatusTimelineTooltipElements,
): void => {
  const data = readStatusTimelineTooltipData(trigger);

  if (!data || !tooltip.shell.id) {
    closeStatusTimelineTooltip(root, tooltip);
    return;
  }

  root.querySelectorAll(STATUS_TIMELINE_PROBLEM_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement && node !== trigger) {
      node.removeAttribute('aria-describedby');
    }
  });

  tooltip.title.textContent = data.title;
  tooltip.phaseAlertIcon.hidden = data.phaseIcon !== 'alert';
  tooltip.phaseCheckIcon.hidden = data.phaseIcon !== 'check';
  tooltip.period.textContent = data.periodLabel;
  tooltip.shell.hidden = false;
  tooltip.shell.setAttribute('aria-hidden', 'false');
  root.dataset.statusTooltipOpen = 'true';
  positionStatusTimelineTooltip(root, trigger, tooltip.shell);
  trigger.setAttribute('aria-describedby', tooltip.shell.id);
};

const bindStatusTimelineTooltipTrigger = (
  root: HTMLElement,
  trigger: HTMLElement,
  tooltip: StatusTimelineTooltipElements,
): void => {
  if (trigger.dataset.statusTooltipBound === 'true') {
    trigger.removeAttribute('title');
    return;
  }

  trigger.dataset.statusTooltipBound = 'true';
  trigger.removeAttribute('title');
  trigger.addEventListener('mouseenter', () => {
    openStatusTimelineTooltip(root, trigger, tooltip);
  });
  trigger.addEventListener('focusin', () => {
    openStatusTimelineTooltip(root, trigger, tooltip);
  });
  trigger.addEventListener('mouseleave', () => {
    closeStatusTimelineTooltip(root, tooltip);
  });
  trigger.addEventListener('focusout', (event) => {
    if (
      event.relatedTarget instanceof Node &&
      trigger.contains(event.relatedTarget)
    ) {
      return;
    }

    closeStatusTimelineTooltip(root, tooltip);
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeStatusTimelineTooltip(root, tooltip);
    }
  });
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
      kind:
        element.dataset.statusKind === 'incident' ||
        element.dataset.statusKind === 'maintenance'
          ? element.dataset.statusKind
          : undefined,
      startMs,
    };
  }

  const endMs = Date.parse(rawEnd);

  if (!Number.isFinite(endMs)) {
    return undefined;
  }

  return {
    element,
    kind:
      element.dataset.statusKind === 'incident' ||
      element.dataset.statusKind === 'maintenance'
        ? element.dataset.statusKind
        : undefined,
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

  const tooltip = getStatusTimelineTooltip(root);

  if (tooltip) {
    closeStatusTimelineTooltip(root, tooltip);
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

    if (tooltip) {
      bindStatusTimelineTooltipTrigger(root, node, tooltip);
    }

    hideStatusTimelineSegment(node);

    const problemNode = parseStatusTimelineProblemNode(node);

    if (!problemNode) {
      return;
    }

    syncStatusTimelineProblemPhase(problemNode, range.endMs);

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
