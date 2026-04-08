import type { Settlement, Stats } from './schema';

function sort(settlements: Settlement[]): Settlement[] {
  return [...settlements].sort((a, b) => {
    const diff =
      a.tariff.normalized_per_sotka_month - b.tariff.normalized_per_sotka_month;
    if (diff !== 0) return diff;
    return a.short_name.localeCompare(b.short_name, 'ru');
  });
}

/**
 * Calculate median of an array of numbers
 * Returns the middle value for odd-length arrays,
 * average of two middle values for even-length arrays
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Calculate stable tariff rank for every settlement.
 * Rank 1 = lowest tariff, ties are resolved by short name.
 */
export function rankSettlements(
  settlements: Settlement[],
): Map<string, number> {
  return new Map(
    sort(settlements).map((item, index) => [item.slug, index + 1]),
  );
}

/**
 * Calculate percentile difference between a value and a baseline
 * Returns percentage difference: (value - baseline) / baseline * 100
 * Positive = value is higher than baseline
 * Negative = value is lower than baseline
 */
export function calculatePercentile(value: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Math.round(((value - baseline) / baseline) * 100);
}

/**
 * Compute statistics for all settlements
 * Shelkovo is always the baseline settlement
 */
export function computeStats(settlements: Settlement[]): Stats {
  if (settlements.length === 0) {
    throw new Error('No settlements provided');
  }

  const baseline = settlements.find((s) => s.is_baseline);
  if (!baseline) {
    throw new Error('Baseline settlement (Shelkovo) not found');
  }

  const tariffs = settlements.map((s) => s.tariff.normalized_per_sotka_month);
  const shelkovoTariff = baseline.tariff.normalized_per_sotka_month;
  const ranks = rankSettlements(settlements);

  const medianTariff = calculateMedian(tariffs);
  const meanTariff = tariffs.reduce((sum, t) => sum + t, 0) / tariffs.length;
  const minTariff = Math.min(...tariffs);
  const maxTariff = Math.max(...tariffs);
  const shelkovoRank = ranks.get(baseline.slug) ?? settlements.length;
  const totalSettlements = settlements.length;
  const cheaperCount = settlements.filter(
    (s) => s.tariff.normalized_per_sotka_month < shelkovoTariff,
  ).length;
  const moreExpensiveCount = settlements.filter(
    (s) => s.tariff.normalized_per_sotka_month > shelkovoTariff,
  ).length;
  const shelkovoVsMedianPercent = calculatePercentile(
    shelkovoTariff,
    medianTariff,
  );
  const shelkovoVsMeanPercent = calculatePercentile(shelkovoTariff, meanTariff);

  return {
    shelkovoTariff,
    medianTariff,
    meanTariff,
    minTariff,
    maxTariff,
    shelkovoRank,
    totalSettlements,
    cheaperCount,
    moreExpensiveCount,
    shelkovoVsMedianPercent,
    shelkovoVsMeanPercent,
  };
}
