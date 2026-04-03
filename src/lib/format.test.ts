import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatPercentage,
  formatTariff
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
    it('should format 5.7 as "5.7 км"', () => {
      expect(formatDistance(5.7)).toBe('5.7 км');
    });

    it('should format 10 as "10 км"', () => {
      expect(formatDistance(10)).toBe('10 км');
    });

    it('should format 0.5 as "0.5 км"', () => {
      expect(formatDistance(0.5)).toBe('0.5 км');
    });

    it('should format 0 as "0 км"', () => {
      expect(formatDistance(0)).toBe('0 км');
    });

    it('should handle integer values without decimal', () => {
      expect(formatDistance(5)).toBe('5 км');
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
