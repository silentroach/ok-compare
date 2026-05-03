import { describe, expect, it } from 'vitest';

import {
  buildStatusTimelineProblemSegments,
  buildStatusTimelineStableSegments,
  clipStatusTimelineSpan,
  getStatusTimelineRange,
  mergeStatusTimelineSpans,
  STATUS_TIMELINE_DAY_MS,
  type StatusTimelineIncidentInput,
} from './timeline';

const NOW_MS = Date.parse('2026-05-10T00:00:00Z');
const RANGE = getStatusTimelineRange(NOW_MS, 10);

interface IncidentInput {
  readonly id: string;
  readonly kind?: StatusTimelineIncidentInput['kind'];
  readonly url?: string;
  readonly has_page?: boolean;
  readonly title?: string;
  readonly started_iso: string;
  readonly started_has_time?: boolean;
  readonly ended_iso?: string;
  readonly ended_has_time?: boolean;
  readonly is_active?: boolean;
}

const incident = (input: IncidentInput): StatusTimelineIncidentInput => ({
  id: input.id,
  url: input.url ?? `/status/incidents/${input.id}`,
  has_page: input.has_page ?? true,
  title: input.title ?? `Incident ${input.id}`,
  kind: input.kind ?? 'incident',
  started_iso: input.started_iso,
  started_has_time: input.started_has_time ?? true,
  ...(input.ended_iso ? { ended_iso: input.ended_iso } : {}),
  ended_has_time: input.ended_has_time ?? true,
  is_active: input.is_active ?? !input.ended_iso,
});

describe('getStatusTimelineRange', () => {
  it('builds a trailing window from now and day count', () => {
    const range = getStatusTimelineRange(NOW_MS, 10);

    expect(range).toEqual({
      startMs: NOW_MS - 10 * STATUS_TIMELINE_DAY_MS,
      endMs: NOW_MS,
      days: 10,
      spanMs: 10 * STATUS_TIMELINE_DAY_MS,
    });
  });
});

describe('clipStatusTimelineSpan', () => {
  it('clips a span that starts before the visible range', () => {
    expect(
      clipStatusTimelineSpan(
        {
          startMs: Date.parse('2026-04-25T00:00:00Z'),
          endMs: Date.parse('2026-05-02T00:00:00Z'),
        },
        RANGE,
      ),
    ).toEqual({
      startMs: Date.parse('2026-04-30T00:00:00Z'),
      endMs: Date.parse('2026-05-02T00:00:00Z'),
    });
  });
});

describe('buildStatusTimelineProblemSegments', () => {
  it('builds an incident fully inside the range', () => {
    const [segment] = buildStatusTimelineProblemSegments({
      incidents: [
        incident({
          id: 'inside',
          started_iso: '2026-05-02T00:00:00Z',
          ended_iso: '2026-05-04T00:00:00Z',
        }),
      ],
      range: RANGE,
    });

    expect(segment).toMatchObject({
      id: 'inside',
      tone: 'red',
      startMs: Date.parse('2026-05-02T00:00:00Z'),
      endMs: Date.parse('2026-05-04T00:00:00Z'),
    });
    expect(segment.leftPercent).toBeCloseTo(20);
    expect(segment.widthPercent).toBeCloseTo(20);
  });

  it('omits href for incidents without detail pages', () => {
    const [segment] = buildStatusTimelineProblemSegments({
      incidents: [
        incident({
          id: 'no-page',
          has_page: false,
          started_iso: '2026-05-02T00:00:00Z',
          ended_iso: '2026-05-04T00:00:00Z',
        }),
      ],
      range: RANGE,
    });

    expect(segment.href).toBeUndefined();
  });

  it('clips entries that end after now', () => {
    const [segment] = buildStatusTimelineProblemSegments({
      incidents: [
        incident({
          id: 'right-clipped',
          started_iso: '2026-05-08T00:00:00Z',
          ended_iso: '2026-05-12T00:00:00Z',
        }),
      ],
      range: RANGE,
    });

    expect(segment).toMatchObject({
      startMs: Date.parse('2026-05-08T00:00:00Z'),
      endMs: NOW_MS,
    });
    expect(segment.leftPercent).toBeCloseTo(80);
    expect(segment.widthPercent).toBeCloseTo(20);
  });

  it('clips active incidents without an end date to now', () => {
    const [segment] = buildStatusTimelineProblemSegments({
      incidents: [
        incident({
          id: 'active',
          started_iso: '2026-05-09T00:00:00Z',
        }),
      ],
      range: RANGE,
    });

    expect(segment).toMatchObject({
      startMs: Date.parse('2026-05-09T00:00:00Z'),
      endMs: NOW_MS,
    });
    expect(segment.endedIso).toBeUndefined();
    expect(segment.leftPercent).toBeCloseTo(90);
    expect(segment.widthPercent).toBeCloseTo(10);
  });

  it('skips incidents that are fully outside the past range', () => {
    expect(
      buildStatusTimelineProblemSegments({
        incidents: [
          incident({
            id: 'past',
            started_iso: '2026-04-20T00:00:00Z',
            ended_iso: '2026-04-22T00:00:00Z',
          }),
        ],
        range: RANGE,
      }),
    ).toEqual([]);
  });

  it('skips future maintenance outside the current window', () => {
    expect(
      buildStatusTimelineProblemSegments({
        incidents: [
          incident({
            id: 'future-maintenance',
            kind: 'maintenance',
            started_iso: '2026-05-12T00:00:00Z',
            ended_iso: '2026-05-13T00:00:00Z',
          }),
        ],
        range: RANGE,
      }),
    ).toEqual([]);
  });

  it('returns an empty list for invalid ranges', () => {
    expect(
      buildStatusTimelineProblemSegments({
        incidents: [
          incident({
            id: 'invalid-range',
            started_iso: '2026-05-02T00:00:00Z',
            ended_iso: '2026-05-04T00:00:00Z',
          }),
        ],
        range: getStatusTimelineRange(NOW_MS, 0),
      }),
    ).toEqual([]);
  });
});

describe('mergeStatusTimelineSpans', () => {
  it('merges overlapping spans before stable gaps are calculated', () => {
    expect(
      mergeStatusTimelineSpans([
        {
          startMs: Date.parse('2026-05-02T00:00:00Z'),
          endMs: Date.parse('2026-05-05T00:00:00Z'),
        },
        {
          startMs: Date.parse('2026-05-04T00:00:00Z'),
          endMs: Date.parse('2026-05-06T00:00:00Z'),
        },
      ]),
    ).toEqual([
      {
        startMs: Date.parse('2026-05-02T00:00:00Z'),
        endMs: Date.parse('2026-05-06T00:00:00Z'),
      },
    ]);
  });
});

describe('buildStatusTimelineStableSegments', () => {
  it('creates stable gaps before, between, and after problem spans', () => {
    const stable = buildStatusTimelineStableSegments(
      buildStatusTimelineProblemSegments({
        incidents: [
          incident({
            id: 'first',
            started_iso: '2026-05-02T00:00:00Z',
            ended_iso: '2026-05-03T00:00:00Z',
          }),
          incident({
            id: 'second',
            started_iso: '2026-05-05T00:00:00Z',
            ended_iso: '2026-05-07T00:00:00Z',
          }),
        ],
        range: RANGE,
      }),
      RANGE,
    );

    expect(stable).toHaveLength(3);
    expect(stable[0]?.leftPercent).toBeCloseTo(0);
    expect(stable[0]?.widthPercent).toBeCloseTo(20);
    expect(stable[1]?.leftPercent).toBeCloseTo(30);
    expect(stable[1]?.widthPercent).toBeCloseTo(20);
    expect(stable[2]?.leftPercent).toBeCloseTo(70);
    expect(stable[2]?.widthPercent).toBeCloseTo(30);
  });

  it('does not create a false green gap between overlapping problems', () => {
    const stable = buildStatusTimelineStableSegments(
      buildStatusTimelineProblemSegments({
        incidents: [
          incident({
            id: 'overlap-a',
            started_iso: '2026-05-02T00:00:00Z',
            ended_iso: '2026-05-05T00:00:00Z',
          }),
          incident({
            id: 'overlap-b',
            started_iso: '2026-05-04T00:00:00Z',
            ended_iso: '2026-05-06T00:00:00Z',
          }),
        ],
        range: RANGE,
      }),
      RANGE,
    );

    expect(stable).toHaveLength(2);
    expect(stable[0]?.widthPercent).toBeCloseTo(20);
    expect(stable[1]?.leftPercent).toBeCloseTo(60);
    expect(stable[1]?.widthPercent).toBeCloseTo(40);
  });

  it('covers the full range when there are no incidents', () => {
    expect(buildStatusTimelineStableSegments([], RANGE)).toEqual([
      {
        startMs: RANGE.startMs,
        endMs: RANGE.endMs,
        leftPercent: 0,
        widthPercent: 100,
      },
    ]);
  });

  it('returns an empty list for invalid ranges', () => {
    expect(
      buildStatusTimelineStableSegments([], getStatusTimelineRange(NOW_MS, -1)),
    ).toEqual([]);
  });
});
