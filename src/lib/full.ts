import type { Rating } from './rating';
import type { ComparisonResult, Settlement, Stats } from './schema';

export interface FullSettlement extends Settlement {
  rating: number;
}

export interface FullPayload {
  settlements: FullSettlement[];
  comparisons: Record<string, ComparisonResult>;
  stats: Stats;
}

export function toFull(
  settlements: Settlement[],
  ratings: Map<string, Rating>,
): FullSettlement[] {
  return settlements.map((item) => ({
    ...item,
    rating: ratings.get(item.slug)?.score ?? 0,
  }));
}
