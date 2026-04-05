import { DateTime } from 'luxon';
import type { Tariff } from './schema';

/**
 * Calculate distance between two points on Earth using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format a number as Russian rubles
 * 1234.56 → "1 235 ₽"
 */
export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });
  return formatted + ' ₽';
}

/**
 * Format distance in kilometers with special formatting rules:
 * - Less than 10 km: show exact integer value (e.g., "5 км")
 * - 10 km or more: round to tens and add tilde prefix (e.g., "~20 км")
 */
export function formatDistance(value: number): string {
  if (value < 10) {
    // Less than 10 km: show exact integer
    return `${Math.round(value)} км`;
  } else {
    // 10 km or more: round to tens with tilde
    const roundedToTens = Math.round(value / 10) * 10;
    return `~${roundedToTens} км`;
  }
}

/**
 * Format a decimal as percentage with sign
 * 0.4567 → "+45.7%"
 * -0.2345 → "−23.5%"
 * Uses U+2212 minus sign for negative values
 */
export function formatPercentage(
  value: number,
  opts?: { signed?: boolean },
): string {
  const percentage = value * 100;
  // Round to 1 decimal place using half-up rounding
  // Multiply by 10, add 0.5 (or subtract for negatives), floor, then divide
  const factor = 10;
  const rounded =
    percentage >= 0
      ? Math.floor(percentage * factor + 0.5) / factor
      : Math.ceil(percentage * factor - 0.5) / factor;

  if (rounded === 0) {
    return '0%';
  }

  const signed = opts?.signed ?? true;
  const sign = rounded > 0 ? '+' : '−';
  const absValue = Math.abs(rounded);

  // Format with one decimal place, but remove trailing .0
  const formatted = Number.isInteger(absValue)
    ? absValue.toString()
    : absValue.toFixed(1);

  return `${signed ? sign : ''}${formatted}%`;
}

/**
 * Format tariff as currency per sotka per month
 * 4500 → "4 500 ₽/сотка"
 */
export function formatTariff(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });
  return `${formatted} ₽/сотка`;
}

function months(period: Tariff['period']): number {
  if (period === 'month') return 1;
  if (period === 'quarter') return 3;
  return 12;
}

function num(value: number): string {
  return value.toLocaleString('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format normalized tariff and add '~' for estimated values.
 */
export function formatTariffAuto(tariff: Tariff): string {
  const text = formatTariff(tariff.normalized_per_sotka_month);
  if (!tariff.normalized_is_estimate) return text;
  return `~${text}`;
}

/**
 * Build formula tooltip for estimated normalized tariff.
 */
export function getTariffHint(tariff: Tariff): string | undefined {
  if (!tariff.normalized_is_estimate) return;

  const size = 10;
  const m = months(tariff.period);
  const monthly = tariff.value / m;
  const normalized = monthly / size;
  const source =
    tariff.unit === 'rub_per_lot'
      ? 'Тариф указан за участок.'
      : 'Тариф указан фиксированной суммой за участок.';

  return `${source} Пересчет: (${num(tariff.value)} ₽ / ${m}) / ${size} соток = ${num(normalized)} ₽/сотка в месяц.`;
}

/**
 * Format ISO date (YYYY-MM-DD) to Russian format using Luxon
 * "2026-04-03" → "03 апреля 2026"
 */
export function formatDate(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate, { locale: 'ru' });
  return dt.toFormat('d MMMM yyyy');
}
