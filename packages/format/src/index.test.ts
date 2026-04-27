import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatPercentage,
  formatTariff,
} from './index';

describe('format package', () => {
  describe('formatCurrency', () => {
    it('formats rounded rubles', () => {
      expect(formatCurrency(1234.56)).toBe('1\u00A0235 ₽');
      expect(formatCurrency(1000)).toBe('1\u00A0000 ₽');
      expect(formatCurrency(100)).toBe('100 ₽');
      expect(formatCurrency(0)).toBe('0 ₽');
    });

    it('uses nearest integer rounding', () => {
      expect(formatCurrency(1234.4)).toBe('1\u00A0234 ₽');
      expect(formatCurrency(1234.5)).toBe('1\u00A0235 ₽');
    });
  });

  describe('formatDistance', () => {
    it('formats distances below ten as whole kilometers', () => {
      expect(formatDistance(5.7)).toBe('6 км');
      expect(formatDistance(0.5)).toBe('1 км');
      expect(formatDistance(9.4)).toBe('9 км');
      expect(formatDistance(0)).toBe('0 км');
      expect(formatDistance(5)).toBe('5 км');
      expect(formatDistance(9)).toBe('9 км');
    });

    it('formats longer distances with tilde and tens rounding', () => {
      expect(formatDistance(10)).toBe('~10 км');
      expect(formatDistance(15)).toBe('~20 км');
      expect(formatDistance(24)).toBe('~20 км');
      expect(formatDistance(25)).toBe('~30 км');
      expect(formatDistance(95)).toBe('~100 км');
    });
  });

  describe('formatPercentage', () => {
    it('formats signed percentages', () => {
      expect(formatPercentage(0.4567)).toBe('+45.7%');
      expect(formatPercentage(-0.2345)).toBe('−23.5%');
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(1)).toBe('+100%');
      expect(formatPercentage(-1)).toBe('−100%');
    });

    it('uses math minus instead of hyphen', () => {
      const text = formatPercentage(-0.5);

      expect(text).toBe('−50%');
      expect(text.charAt(0)).toBe('−');
      expect(text.charAt(0)).not.toBe('-');
    });

    it('rounds to one decimal place', () => {
      expect(formatPercentage(0.1234)).toBe('+12.3%');
      expect(formatPercentage(0.1256)).toBe('+12.6%');
    });

    it('can omit sign', () => {
      expect(formatPercentage(0.4567, { signed: false })).toBe('45.7%');
      expect(formatPercentage(-0.2345, { signed: false })).toBe('23.5%');
      expect(formatPercentage(0, { signed: false })).toBe('0%');
    });
  });

  describe('formatTariff', () => {
    it('formats tariffs per sotka', () => {
      expect(formatTariff(4500)).toBe('4\u00A0500 ₽/сотка');
      expect(formatTariff(120)).toBe('120 ₽/сотка');
      expect(formatTariff(10000)).toBe('10\u00A0000 ₽/сотка');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates in Russian', () => {
      expect(formatDate('2026-04-03')).toBe('3 апреля 2026');
      expect(formatDate('2026-01-15')).toBe('15 января 2026');
      expect(formatDate('2026-12-31')).toBe('31 декабря 2026');
      expect(formatDate('2026-05-01')).toBe('1 мая 2026');
      expect(formatDate('2024-02-29')).toBe('29 февраля 2024');
    });
  });
});
