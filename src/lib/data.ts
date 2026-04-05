import { getCollection } from 'astro:content';
import type { Settlement, Stats, ComparisonResult } from './schema';
import { computeStats } from './stats';
import { compareSettlements } from './comparisons';

/**
 * Load all settlements from content collection
 */
export async function loadSettlements(): Promise<Settlement[]> {
  const settlements = await getCollection('settlements');
  return settlements.map(entry => entry.data);
}

/**
 * Find the baseline settlement (Shelkovo)
 */
export function findBaseline(settlements: Settlement[]): Settlement | undefined {
  return settlements.find(s => s.is_baseline);
}

/**
 * Load settlements with computed statistics
 */
export async function loadSettlementsWithStats(): Promise<{
  settlements: Settlement[];
  stats: Stats;
}> {
  const settlements = await loadSettlements();
  const stats = computeStats(settlements);

  return { settlements, stats };
}

/**
 * Compare all settlements with Shelkovo baseline
 * Returns a Map of slug -> ComparisonResult
 */
export function compareAllSettlements(
  settlements: Settlement[]
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
}> {
  const { settlements, stats } = await loadSettlementsWithStats();
  const comparisons = compareAllSettlements(settlements);

  return { settlements, stats, comparisons };
}
