import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatPercentage,
  formatTariff,
  formatTariffAuto,
  getTariffHint
} from './format';

describe('Format Module', () => {
  describe('formatCurrency', () => {
    it('should format 1234.56 as "1 235 ₽"', () => {
      // toLocaleString uses non-breaking space (U+00A0) as thousands separator
      expect(formatCurrency(1234.56)).toBe('1\u00A0235 ₽');
    });

    it('should format 1000 as "1 000 ₽"', () => {
      expect(formatCurrency(1000)).toBe('1\u00A0000 ₽');
    });

    it('should format 100 as "100 ₽"', () => {
      expect(formatCurrency(100)).toBe('100 ₽');
    });

    it('should format 0 as "0 ₽"', () => {
      expect(formatCurrency(0)).toBe('0 ₽');
    });

    it('should round to nearest integer', () => {
      expect(formatCurrency(1234.4)).toBe('1\u00A0234 ₽');
      expect(formatCurrency(1234.5)).toBe('1\u00A0235 ₽');
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 10 km as whole numbers', () => {
      expect(formatDistance(5.7)).toBe('6 км');
      expect(formatDistance(0.5)).toBe('1 км');
      expect(formatDistance(9.4)).toBe('9 км');
    });

    it('should format distances of 10 km or more with tilde and rounded to tens', () => {
      expect(formatDistance(10)).toBe('~10 км');
      expect(formatDistance(15)).toBe('~20 км');
      expect(formatDistance(24)).toBe('~20 км');
      expect(formatDistance(25)).toBe('~30 км');
      expect(formatDistance(95)).toBe('~100 км');
    });

    it('should format 0 as "0 км"', () => {
      expect(formatDistance(0)).toBe('0 км');
    });

    it('should handle integer values less than 10 without decimal', () => {
      expect(formatDistance(5)).toBe('5 км');
      expect(formatDistance(9)).toBe('9 км');
    });
  });

  describe('formatPercentage', () => {
    it('should format 0.4567 as "+45.7%"', () => {
      expect(formatPercentage(0.4567)).toBe('+45.7%');
    });

    it('should format -0.2345 as "−23.5%"', () => {
      expect(formatPercentage(-0.2345)).toBe('−23.5%');
    });

    it('should format 0 as "0%"', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should format 1 as "+100%"', () => {
      expect(formatPercentage(1)).toBe('+100%');
    });

    it('should format -1 as "−100%"', () => {
      expect(formatPercentage(-1)).toBe('−100%');
    });

    it('should use minus sign (U+2212) not hyphen', () => {
      const result = formatPercentage(-0.5);
      expect(result).toBe('−50%');
      expect(result.charAt(0)).toBe('−'); // U+2212
      expect(result.charAt(0)).not.toBe('-'); // U+002D
    });

    it('should round to one decimal place', () => {
      expect(formatPercentage(0.1234)).toBe('+12.3%');
      expect(formatPercentage(0.1256)).toBe('+12.6%');
    });

    it('should format without sign when signed is false', () => {
      expect(formatPercentage(0.4567, { signed: false })).toBe('45.7%');
      expect(formatPercentage(-0.2345, { signed: false })).toBe('23.5%');
    });

    it('should keep 0 unchanged when signed is false', () => {
      expect(formatPercentage(0, { signed: false })).toBe('0%');
    });
  });

  describe('formatTariff', () => {
    it('should format tariff as currency per sotka per month', () => {
      expect(formatTariff(4500)).toBe('4\u00A0500 ₽/сотка');
    });

    it('should format small values', () => {
      expect(formatTariff(120)).toBe('120 ₽/сотка');
    });

    it('should format large values', () => {
      expect(formatTariff(10000)).toBe('10\u00A0000 ₽/сотка');
    });
  });

  describe('formatTariffAuto', () => {
    it('should keep exact tariffs without tilde', () => {
      expect(formatTariffAuto({
        value: 1000,
        unit: 'rub_per_sotka',
        period: 'month',
        normalized_per_sotka_month: 1000,
        normalized_is_estimate: false,
      })).toBe('1\u00A0000 ₽/сотка');
    });

    it('should add tilde for estimated tariffs', () => {
      expect(formatTariffAuto({
        value: 12000,
        unit: 'rub_per_lot',
        period: 'month',
        normalized_per_sotka_month: 1200,
        normalized_is_estimate: true,
      })).toBe('~1\u00A0200 ₽/сотка');
    });
  });

  describe('getTariffHint', () => {
    it('should return undefined for exact tariffs', () => {
      expect(getTariffHint({
        value: 1000,
        unit: 'rub_per_sotka',
        period: 'month',
        normalized_per_sotka_month: 1000,
        normalized_is_estimate: false,
      })).toBe(undefined);
    });

    it('should return formula for estimated tariffs', () => {
      const hint = getTariffHint({
        value: 12000,
        unit: 'rub_per_lot',
        period: 'month',
        normalized_per_sotka_month: 1200,
        normalized_is_estimate: true,
      });

      expect(hint).toContain('Пересчет');
      expect(hint).toContain('10 соток');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date to Russian format', () => {
      expect(formatDate('2026-04-03')).toBe('3 апреля 2026');
    });

    it('should format date in January', () => {
      expect(formatDate('2026-01-15')).toBe('15 января 2026');
    });

    it('should format date in December', () => {
      expect(formatDate('2026-12-31')).toBe('31 декабря 2026');
    });

    it('should handle single-digit day', () => {
      expect(formatDate('2026-05-01')).toBe('1 мая 2026');
    });

    it('should handle leap year', () => {
      expect(formatDate('2024-02-29')).toBe('29 февраля 2024');
    });
  });
});
