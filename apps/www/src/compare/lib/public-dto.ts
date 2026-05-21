export interface PublicStats {
  readonly shelkovoTariff: number;
  readonly medianTariff: number;
  readonly peerMedianTariff: number;
  readonly meanTariff: number;
  readonly minTariff: number;
  readonly maxTariff: number;
  readonly shelkovoRank: number;
  readonly totalSettlements: number;
  readonly cheaperCount: number;
  readonly moreExpensiveCount: number;
  readonly shelkovoVsMedianPercent: number;
  readonly shelkovoVsPeerMedianPercent: number;
  readonly shelkovoVsMeanPercent: number;
}

export interface PublicComparison {
  readonly tariffDelta: number;
  readonly tariffDeltaPercent: number;
  readonly isCheaper: boolean;
}

export type PublicComparisons = Record<string, PublicComparison>;

export const toPublicStats = (stats: PublicStats): PublicStats => ({
  shelkovoTariff: stats.shelkovoTariff,
  medianTariff: stats.medianTariff,
  peerMedianTariff: stats.peerMedianTariff,
  meanTariff: stats.meanTariff,
  minTariff: stats.minTariff,
  maxTariff: stats.maxTariff,
  shelkovoRank: stats.shelkovoRank,
  totalSettlements: stats.totalSettlements,
  cheaperCount: stats.cheaperCount,
  moreExpensiveCount: stats.moreExpensiveCount,
  shelkovoVsMedianPercent: stats.shelkovoVsMedianPercent,
  shelkovoVsPeerMedianPercent: stats.shelkovoVsPeerMedianPercent,
  shelkovoVsMeanPercent: stats.shelkovoVsMeanPercent,
});

export const toPublicComparisons = (
  comparisons: ReadonlyMap<string, PublicComparison>,
): PublicComparisons =>
  Object.fromEntries(
    Array.from(comparisons.entries()).map(([slug, comparison]) => [
      slug,
      {
        tariffDelta: comparison.tariffDelta,
        tariffDeltaPercent: comparison.tariffDeltaPercent,
        isCheaper: comparison.isCheaper,
      },
    ]),
  );
