import type { StatusDuration, StatusKind } from './schema';

export const STATUS_TIMELINE_DAY_MS = 24 * 60 * 60 * 1000;

export interface StatusTimelineIncidentInput {
  readonly id: string;
  readonly url: string;
  readonly has_page: boolean;
  readonly title: string;
  readonly kind: StatusKind;
  readonly started_iso: string;
  readonly started_has_time: boolean;
  readonly ended_iso?: string;
  readonly ended_has_time: boolean;
  readonly is_active: boolean;
  readonly duration?: StatusDuration;
}

export interface StatusTimelineRange {
  readonly startMs: number;
  readonly endMs: number;
  readonly days: number;
  readonly spanMs: number;
}

export interface StatusTimelineSpan {
  readonly startMs: number;
  readonly endMs: number;
}

export interface StatusTimelineProblemSegment extends StatusTimelineSpan {
  readonly id: string;
  readonly href?: string;
  readonly tone: 'amber' | 'red';
  readonly leftPercent: number;
  readonly widthPercent: number;
  readonly startedIso: string;
  readonly endedIso?: string;
}

export interface StatusTimelineStableSegment extends StatusTimelineSpan {
  readonly leftPercent: number;
  readonly widthPercent: number;
}

export interface StatusTimelineSegmentGeometry {
  readonly leftPercent: number;
  readonly widthPercent: number;
}

interface BuildStatusTimelineProblemSegmentsInput {
  readonly incidents: readonly StatusTimelineIncidentInput[];
  readonly range: StatusTimelineRange;
}

interface ClipStatusTimelineSpanInput {
  readonly startMs: number;
  readonly endMs?: number;
}

const hasValidRange = (range: StatusTimelineRange): boolean =>
  Number.isFinite(range.startMs) &&
  Number.isFinite(range.endMs) &&
  range.spanMs > 0 &&
  range.endMs > range.startMs;

const toStatusTimelinePercent = (
  valueMs: number,
  range: StatusTimelineRange,
): number => ((valueMs - range.startMs) / range.spanMs) * 100;

export const getStatusTimelineSegmentGeometry = (
  span: StatusTimelineSpan,
  range: StatusTimelineRange,
): StatusTimelineSegmentGeometry => ({
  leftPercent: toStatusTimelinePercent(span.startMs, range),
  widthPercent: ((span.endMs - span.startMs) / range.spanMs) * 100,
});

const toStatusTimelineSegment = <T extends StatusTimelineSpan>(
  span: T,
  range: StatusTimelineRange,
): T & StatusTimelineSegmentGeometry => ({
  ...span,
  ...getStatusTimelineSegmentGeometry(span, range),
});

export const getStatusTimelineRange = (
  nowMs: number,
  days: number,
): StatusTimelineRange => {
  if (!Number.isFinite(nowMs) || !Number.isFinite(days) || days <= 0) {
    return {
      startMs: 0,
      endMs: 0,
      days: 0,
      spanMs: 0,
    };
  }

  const spanMs = days * STATUS_TIMELINE_DAY_MS;

  return {
    startMs: nowMs - spanMs,
    endMs: nowMs,
    days,
    spanMs,
  };
};

export const clipStatusTimelineSpan = (
  input: ClipStatusTimelineSpanInput,
  range: StatusTimelineRange,
): StatusTimelineSpan | undefined => {
  if (!hasValidRange(range) || !Number.isFinite(input.startMs)) {
    return undefined;
  }

  const endMs = input.endMs ?? range.endMs;

  if (!Number.isFinite(endMs) || endMs <= input.startMs) {
    return undefined;
  }

  if (endMs <= range.startMs || input.startMs >= range.endMs) {
    return undefined;
  }

  const startMs = Math.max(range.startMs, input.startMs);
  const clippedEndMs = Math.min(range.endMs, endMs);

  if (clippedEndMs <= startMs) {
    return undefined;
  }

  return {
    startMs,
    endMs: clippedEndMs,
  };
};

export const buildStatusTimelineProblemSegments = ({
  incidents,
  range,
}: BuildStatusTimelineProblemSegmentsInput): readonly StatusTimelineProblemSegment[] => {
  if (!hasValidRange(range)) {
    return [];
  }

  return incidents
    .map((incident) => {
      const startMs = Date.parse(incident.started_iso);
      const endMs = incident.ended_iso
        ? Date.parse(incident.ended_iso)
        : undefined;
      const span = clipStatusTimelineSpan(
        {
          startMs,
          ...(endMs !== undefined ? { endMs } : {}),
        },
        range,
      );

      if (!span) {
        return undefined;
      }

      return toStatusTimelineSegment(
        {
          id: incident.id,
          ...(incident.has_page ? { href: incident.url } : {}),
          tone: incident.kind === 'maintenance' ? 'amber' : 'red',
          startedIso: incident.started_iso,
          ...(incident.ended_iso ? { endedIso: incident.ended_iso } : {}),
          ...span,
        },
        range,
      ) satisfies StatusTimelineProblemSegment;
    })
    .filter((segment) => segment !== undefined)
    .sort(
      (a, b) =>
        a.startMs - b.startMs || a.endMs - b.endMs || a.id.localeCompare(b.id),
    );
};

export const mergeStatusTimelineSpans = (
  spans: readonly StatusTimelineSpan[],
): readonly StatusTimelineSpan[] => {
  const sorted = spans
    .filter(
      (span) =>
        Number.isFinite(span.startMs) &&
        Number.isFinite(span.endMs) &&
        span.endMs > span.startMs,
    )
    .toSorted((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

  if (sorted.length === 0) {
    return [];
  }

  return sorted.reduce<StatusTimelineSpan[]>((merged, span) => {
    const last = merged.at(-1);

    if (!last || span.startMs > last.endMs) {
      merged.push(span);
      return merged;
    }

    merged[merged.length - 1] = {
      startMs: last.startMs,
      endMs: Math.max(last.endMs, span.endMs),
    };

    return merged;
  }, []);
};

export const buildStatusTimelineStableSegments = (
  problemSegments: readonly StatusTimelineSpan[],
  range: StatusTimelineRange,
): readonly StatusTimelineStableSegment[] => {
  if (!hasValidRange(range)) {
    return [];
  }

  const merged = mergeStatusTimelineSpans(problemSegments);

  if (merged.length === 0) {
    return [
      toStatusTimelineSegment(
        {
          startMs: range.startMs,
          endMs: range.endMs,
        },
        range,
      ),
    ];
  }

  const stable: StatusTimelineStableSegment[] = [];
  let cursor = range.startMs;

  merged.forEach((span) => {
    if (span.startMs > cursor) {
      stable.push(
        toStatusTimelineSegment(
          {
            startMs: cursor,
            endMs: span.startMs,
          },
          range,
        ),
      );
    }

    cursor = Math.max(cursor, span.endMs);
  });

  if (cursor < range.endMs) {
    stable.push(
      toStatusTimelineSegment(
        {
          startMs: cursor,
          endMs: range.endMs,
        },
        range,
      ),
    );
  }

  return stable;
};
