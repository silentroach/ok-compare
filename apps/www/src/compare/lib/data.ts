import { getCollection, type CollectionEntry } from 'astro:content';
import type { ComparisonResult, Settlement, Stats } from './settlement/types';
import { computeStats } from './stats';
import { compareSettlements } from './comparisons';
import { buildRatings, type Rating } from './rating';
import { mapRawSettlement } from './settlement/mapper';
import type { RawSettlement } from './settlement/schema';

/**
 * Load all settlements from content collection
 */
export async function loadSettlements(): Promise<Settlement[]> {
  const settlements = await getCollection('settlements');
  return settlements.map(
    (entry: CollectionEntry<'settlements'>): Settlement =>
      mapRawSettlement(entry.data as RawSettlement),
  );
}

/**
 * Find the baseline settlement (Shelkovo)
 */
export function findBaseline(
  settlements: Settlement[],
): Settlement | undefined {
  return settlements.find((s) => s.isBaseline);
}

/**
 * Load settlements with computed statistics
 */
export async function loadSettlementsWithStats(): Promise<{
  settlements: Settlement[];
  stats: Stats;
  ratings: Map<string, Rating>;
}> {
  const settlements = await loadSettlements();
  const ratings = buildRatings(settlements);
  const stats = computeStats(settlements, ratings);

  return { settlements, stats, ratings };
}

/**
 * Compare all settlements with Shelkovo baseline
 * Returns a Map of slug -> ComparisonResult
 */
export function compareAllSettlements(
  settlements: Settlement[],
): Map<string, ComparisonResult> {
  const baseline = findBaseline(settlements);

  if (!baseline) {
    throw new Error('Baseline settlement (Shelkovo) not found');
  }

  const comparisons = new Map<string, ComparisonResult>();

  for (const settlement of settlements) {
    const comparison = compareSettlements(baseline, settlement);
    comparisons.set(settlement.slug, comparison);
  }

  return comparisons;
}

/**
 * Load all data needed for the application
 */
export async function loadAllData(): Promise<{
  settlements: Settlement[];
  stats: Stats;
  comparisons: Map<string, ComparisonResult>;
  ratings: Map<string, Rating>;
}> {
  const { settlements, stats, ratings } = await loadSettlementsWithStats();
  const comparisons = compareAllSettlements(settlements);

  return { settlements, stats, comparisons, ratings };
}
