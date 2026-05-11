import { describe, expect, it } from 'vitest';

import { calculateDistance, getCivilTwilight, isCivilDaylight } from './index';

const shelkovo = {
  lat: 55.065422,
  lng: 37.733096,
} as const;

describe('geo package', () => {
  it('returns zero for identical points', () => {
    expect(calculateDistance(55.7, 37, 55.7, 37)).toBe(0);
  });

  it('matches expected distance for known nearby points', () => {
    expect(calculateDistance(55.7, 37, 55.8, 37.1)).toBeCloseTo(12.8, 1);
  });

  it('is symmetric', () => {
    const a = calculateDistance(55.7, 37, 55.8, 37.1);
    const b = calculateDistance(55.8, 37.1, 55.7, 37);

    expect(a).toBeCloseTo(b, 10);
  });

  it('calculates civil dawn and dusk for Shelkovo', () => {
    const twilight = getCivilTwilight(
      new Date('2026-05-11T12:00:00Z'),
      shelkovo,
    );

    expect({
      dawn: twilight.dawn.toISOString(),
      dusk: twilight.dusk.toISOString(),
    }).toMatchInlineSnapshot(`
      {
        "dawn": "2026-05-11T00:44:05.189Z",
        "dusk": "2026-05-11T18:09:29.055Z",
      }
    `);
  });

  it('treats the civil twilight interval as daylight', () => {
    expect(isCivilDaylight(new Date('2026-05-11T00:43:00Z'), shelkovo)).toBe(
      false,
    );
    expect(isCivilDaylight(new Date('2026-05-11T00:45:00Z'), shelkovo)).toBe(
      true,
    );
    expect(isCivilDaylight(new Date('2026-05-11T18:09:00Z'), shelkovo)).toBe(
      true,
    );
    expect(isCivilDaylight(new Date('2026-05-11T18:10:00Z'), shelkovo)).toBe(
      false,
    );
  });

  it('follows seasonal civil twilight instead of fixed clock hours', () => {
    expect(isCivilDaylight(new Date('2026-01-11T05:06:00Z'), shelkovo)).toBe(
      false,
    );
    expect(isCivilDaylight(new Date('2026-01-11T05:07:00Z'), shelkovo)).toBe(
      true,
    );
    expect(isCivilDaylight(new Date('2026-01-11T14:09:00Z'), shelkovo)).toBe(
      true,
    );
    expect(isCivilDaylight(new Date('2026-01-11T14:10:00Z'), shelkovo)).toBe(
      false,
    );
  });
});
