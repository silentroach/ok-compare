import { describe, expect, it } from 'vitest';
import { dateTimeFromISO } from '@shelkovo/format';

import {
  buildStatusTimelineTooltipData,
  buildStatusTimelineTooltipListItemData,
  formatStatusDate,
  formatStatusIncidentPeriodText,
  formatStatusTimelineGroupTitle,
  formatStatusTimelineTooltipGroupLabel,
  formatStatusTimelineTooltipLabel,
  getStatusIncidentPeriod,
} from './view';

const NBSP = '\u00A0';
const currentYear = dateTimeFromISO(new Date().toISOString()).year;
const nextYear = currentYear + 1;

describe('getStatusIncidentPeriod', () => {
  it('shows start label when there is no end date', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: false,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      }),
    ).toEqual({
      prefix: 'Начало',
      start: {
        iso: `${currentYear}-05-01T07:32:00+03:00`,
        text: '1 мая, 07:32',
      },
    });
  });

  it('shows since label for active entries without end date', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: true,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      }),
    ).toEqual({
      prefix: 'Начиная с',
      start: {
        iso: `${currentYear}-05-01T07:32:00+03:00`,
        text: '1 мая, 07:32',
      },
    });
  });

  it('shows full date range without labels when both dates are present', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: false,
        started_iso: `${currentYear}-05-01T00:00:00+03:00`,
        started_has_time: false,
        ended_iso: `${currentYear}-05-02T00:00:00+03:00`,
        ended_has_time: false,
        duration: { total_minutes: 24 * 60 },
      }),
    ).toEqual({
      start: {
        iso: `${currentYear}-05-01T00:00:00+03:00`,
        text: '1 мая',
      },
      end: {
        iso: `${currentYear}-05-02T00:00:00+03:00`,
        text: '2 мая',
      },
      duration: '1 дн.',
    });
  });

  it('compresses same-day ranges with time into one date and two times', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: false,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_iso: `${currentYear}-05-01T16:38:00+03:00`,
        ended_has_time: true,
        duration: { total_minutes: 9 * 60 + 6 },
      }),
    ).toEqual({
      start: {
        iso: `${currentYear}-05-01T07:32:00+03:00`,
        text: '1 мая, 07:32',
      },
      end: {
        iso: `${currentYear}-05-01T16:38:00+03:00`,
        text: '16:38',
      },
      duration: '9 ч. 6 мин.',
    });
  });

  it('shows one date without duration for same-day ranges without time', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: false,
        started_iso: `${currentYear}-05-01T00:00:00+03:00`,
        started_has_time: false,
        ended_iso: `${currentYear}-05-01T00:00:00+03:00`,
        ended_has_time: false,
        duration: { total_minutes: 0 },
      }),
    ).toEqual({
      start: {
        iso: `${currentYear}-05-01T00:00:00+03:00`,
        text: '1 мая',
      },
    });
  });

  it('keeps the full end timestamp when only one side has time', () => {
    expect(
      getStatusIncidentPeriod({
        is_active: false,
        started_iso: `${currentYear}-05-01T00:00:00+03:00`,
        started_has_time: false,
        ended_iso: `${currentYear}-05-01T16:38:00+03:00`,
        ended_has_time: true,
        duration: { total_minutes: 16 * 60 + 38 },
      }),
    ).toEqual({
      start: {
        iso: `${currentYear}-05-01T00:00:00+03:00`,
        text: '1 мая',
      },
      end: {
        iso: `${currentYear}-05-01T16:38:00+03:00`,
        text: '1 мая, 16:38',
      },
      duration: '16 ч. 38 мин.',
    });
  });
});

describe('formatStatusDate', () => {
  it('keeps year for non-current years', () => {
    expect(
      formatStatusDate(`${nextYear}-05-01T07:32:00+03:00`, {
        hasTime: true,
      }),
    ).toBe(`1 мая ${nextYear}, 07:32`);
  });

  it('supports non-breaking spaces for UI dates', () => {
    expect(
      formatStatusDate(`${nextYear}-05-01T07:32:00+03:00`, {
        hasTime: true,
        nonBreaking: true,
      }),
    ).toBe(`1${NBSP}мая${NBSP}${nextYear}, 07:32`);
  });
});

describe('formatStatusIncidentPeriodText', () => {
  it('uses the same active wording as meta and timeline', () => {
    expect(
      formatStatusIncidentPeriodText({
        is_active: true,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      }),
    ).toBe('Начиная с 1 мая, 07:32');
  });

  it('supports non-breaking spaces for UI period labels', () => {
    expect(
      formatStatusIncidentPeriodText(
        {
          is_active: false,
          started_iso: `${currentYear}-05-01T07:32:00+03:00`,
          started_has_time: true,
          ended_iso: `${currentYear}-05-01T16:38:00+03:00`,
          ended_has_time: true,
          duration: { total_minutes: 9 * 60 + 6 },
        },
        { nonBreaking: true },
      ),
    ).toBe(`1${NBSP}мая, 07:32 -${NBSP}16:38 (9${NBSP}ч. 6${NBSP}мин.)`);
  });
});

describe('buildStatusTimelineTooltipData', () => {
  it('builds timeline tooltip labels for an active incident', () => {
    const tooltip = buildStatusTimelineTooltipData({
      service: 'water',
      incident: {
        kind: 'incident',
        title: 'Нет воды на Центральной',
        is_active: true,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      },
    });

    expect(tooltip).toEqual({
      serviceLabel: 'Вода',
      kindLabel: 'Инцидент',
      title: 'Нет воды на Центральной',
      phaseLabel: 'идет',
      periodLabel: 'Начиная с 1 мая, 07:32',
    });
    expect(formatStatusTimelineTooltipLabel(tooltip)).toBe(
      'Вода. Инцидент. Нет воды на Центральной. Статус: идет. Начиная с 1 мая, 07:32',
    );
  });

  it('builds timeline tooltip labels for planned maintenance', () => {
    expect(
      buildStatusTimelineTooltipData({
        service: 'electricity',
        incident: {
          kind: 'maintenance',
          title: 'Плановая профилактика сети',
          is_active: false,
          started_iso: `${currentYear}-05-03T00:00:00+03:00`,
          started_has_time: false,
          ended_has_time: false,
        },
      }),
    ).toEqual({
      serviceLabel: 'Электричество',
      kindLabel: 'Плановые работы',
      title: 'Плановая профилактика сети',
      phaseLabel: 'запланировано',
      periodLabel: 'Начало 3 мая',
    });
  });

  it('keeps future maintenance with an end date in planned phase', () => {
    expect(
      buildStatusTimelineTooltipData({
        service: 'electricity',
        incident: {
          kind: 'maintenance',
          title: 'Плановая профилактика сети',
          is_active: false,
          started_iso: `${nextYear}-05-03T00:00:00+03:00`,
          started_has_time: false,
          ended_iso: `${nextYear}-05-04T00:00:00+03:00`,
          ended_has_time: false,
        },
      }),
    ).toEqual({
      serviceLabel: 'Электричество',
      kindLabel: 'Плановые работы',
      title: 'Плановая профилактика сети',
      phaseLabel: 'запланировано',
      periodLabel: `3 мая ${nextYear} - 4 мая ${nextYear}`,
    });
  });

  it('can emit non-breaking spaces for timeline UI labels', () => {
    const tooltip = buildStatusTimelineTooltipData({
      service: 'water',
      incident: {
        kind: 'incident',
        title: 'Нет воды на Центральной',
        is_active: true,
        started_iso: `${currentYear}-05-01T07:32:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      },
      nonBreaking: true,
    });

    expect(tooltip.periodLabel).toBe(`Начиная с${NBSP}1${NBSP}мая, 07:32`);
    expect(formatStatusTimelineTooltipLabel(tooltip)).toBe(
      `Вода. Инцидент. Нет воды на Центральной. Статус: идет. Начиная с${NBSP}1${NBSP}мая, 07:32`,
    );
  });
});

describe('grouped timeline tooltip text', () => {
  it('builds a compact day group title', () => {
    expect(
      formatStatusTimelineGroupTitle({
        count: 3,
        startedIso: `${currentYear}-05-09T07:32:00+03:00`,
      }),
    ).toBe('3 события за 9 мая');
  });

  it('formats grouped tooltip list items and summary labels', () => {
    const items = [
      buildStatusTimelineTooltipListItemData({
        kind: 'incident',
        title: 'Отключение 1',
        is_active: false,
        started_iso: `${currentYear}-05-09T07:32:00+03:00`,
        started_has_time: true,
        ended_iso: `${currentYear}-05-09T08:10:00+03:00`,
        ended_has_time: true,
        duration: {
          total_minutes: 38,
        },
      }),
      buildStatusTimelineTooltipListItemData({
        kind: 'incident',
        title: 'Отключение 2',
        is_active: true,
        started_iso: `${currentYear}-05-09T12:15:00+03:00`,
        started_has_time: true,
        ended_has_time: false,
      }),
    ];

    expect(items[0]).toEqual({
      title: 'Отключение 1',
      periodLabel: '9 мая, 07:32 - 08:10 (38 мин.)',
      phaseIcon: 'check',
    });
    expect(
      formatStatusTimelineTooltipGroupLabel({
        serviceLabel: 'Электричество',
        title: '2 события за 9 мая',
        items,
      }),
    ).toBe(
      'Электричество. 2 события за 9 мая. Отключение 1. 9 мая, 07:32 - 08:10 (38 мин.). Отключение 2. Начиная с 9 мая, 12:15',
    );
  });
});
