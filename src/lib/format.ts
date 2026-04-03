/**
 * Format a number as Russian rubles
 * 1234.56 → "1 235 ₽"
 */
export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0
  });
  return formatted + ' ₽';
}

/**
 * Format distance in kilometers
 * 5.7 → "5.7 км"
 */
export function formatDistance(value: number): string {
  // Use the value as-is, but remove trailing .0 for integers
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
  return `${formatted} км`;
}

/**
 * Format a decimal as percentage with sign
 * 0.4567 → "+45.7%"
 * -0.2345 → "−23.5%"
 * Uses U+2212 minus sign for negative values
 */
export function formatPercentage(value: number): string {
  const percentage = value * 100;
  // Round to 1 decimal place using half-up rounding
  // Multiply by 10, add 0.5 (or subtract for negatives), floor, then divide
  const factor = 10;
  const rounded = percentage >= 0
    ? Math.floor(percentage * factor + 0.5) / factor
    : Math.ceil(percentage * factor - 0.5) / factor;

  if (rounded === 0) {
    return '0%';
  }

  const sign = rounded > 0 ? '+' : '−';
  const absValue = Math.abs(rounded);

  // Format with one decimal place, but remove trailing .0
  const formatted = Number.isInteger(absValue)
    ? absValue.toString()
    : absValue.toFixed(1);

  return `${sign}${formatted}%`;
}

/**
 * Format tariff as currency per sotka per month
 * 4500 → "4 500 ₽/сотка/мес"
 */
export function formatTariff(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0
  });
  return `${formatted} ₽/сотка/мес`;
}

import { DateTime } from 'luxon';

/**
 * Format ISO date (YYYY-MM-DD) to Russian format using Luxon
 * "2026-04-03" → "03 апреля 2026"
 */
export function formatDate(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate, { locale: 'ru' });
  return dt.toFormat('d MMMM yyyy');
}
