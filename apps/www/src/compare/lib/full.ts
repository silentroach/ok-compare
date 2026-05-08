import { calculateDistance } from './format';
import { getKm, getRing, type Rating } from './rating';
import type { ComparisonResult, Settlement, Stats } from './schema';

export interface FullDistance {
  moscow_km: number;
  mkad_km: number;
  shelkovo_km: number;
}

export type FullSettlement = Omit<Settlement, 'sources'> & {
  rating: number;
  distance: FullDistance;
};

export interface FullPayload {
  settlements: FullSettlement[];
  comparisons: Record<string, ComparisonResult>;
  stats: Stats;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function toFull(
  settlements: Settlement[],
  ratings: Map<string, Rating>,
): FullSettlement[] {
  const base = settlements.find((item) => item.is_baseline);

  if (!base) {
    throw new Error('Baseline settlement (Shelkovo) not found');
  }

  return settlements.map((item) => ({
    ...(({ sources, ...rest }) => rest)(item),
    rating: ratings.get(item.slug)?.score ?? 0,
    distance: {
      moscow_km:
        ratings.get(item.slug)?.km ??
        round(getKm(item.location.lat, item.location.lng)),
      mkad_km:
        ratings.get(item.slug)?.ring ??
        round(getRing(item.location.lat, item.location.lng)),
      shelkovo_km: item.is_baseline
        ? 0
        : round(
            calculateDistance(
              base.location.lat,
              base.location.lng,
              item.location.lat,
              item.location.lng,
            ),
          ),
    },
  }));
}
