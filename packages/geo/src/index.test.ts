import { describe, expect, it } from 'vitest';

import { calculateDistance } from './index';

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
});
