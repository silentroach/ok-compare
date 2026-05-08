import type { ComparisonResult, Settlement, Stats } from './schema';
import type { Rating } from './rating';

export type ExplorerLocation = Pick<
  Settlement['location'],
  'lat' | 'lng' | 'district'
>;

export interface ExplorerTariff {
  normalized_per_sotka_month: Settlement['tariff']['normalized_per_sotka_month'];
  normalized_is_estimate: Settlement['tariff']['normalized_is_estimate'];
}

export type ExplorerCompany = string | { title: string };

export interface ExplorerSettlement {
  name: Settlement['name'];
  short_name: Settlement['short_name'];
  slug: Settlement['slug'];
  rating: number;
  rabstvo?: Settlement['rabstvo'];
  management_company?: ExplorerCompany;
  is_baseline: Settlement['is_baseline'];
  location: ExplorerLocation;
  tariff: ExplorerTariff;
}

export interface ExplorerPayload {
  settlements: ExplorerSettlement[];
  comparisons: Record<string, ComparisonResult>;
  stats: Stats;
}

export function toExplorer(
  settlements: Settlement[],
  ratings: Map<string, Rating>,
): ExplorerSettlement[] {
  return settlements.map((item) => {
    const company = item.management_company;

    return {
      name: item.name,
      short_name: item.short_name,
      slug: item.slug,
      rating: ratings.get(item.slug)?.score ?? 0,
      ...(item.rabstvo ? { rabstvo: true } : {}),
      ...(company
        ? {
            management_company:
              typeof company === 'string' ? company : { title: company.title },
          }
        : {}),
      is_baseline: item.is_baseline,
      location: {
        lat: item.location.lat,
        lng: item.location.lng,
        district: item.location.district,
      },
      tariff: {
        normalized_per_sotka_month: item.tariff.normalized_per_sotka_month,
        normalized_is_estimate: item.tariff.normalized_is_estimate,
      },
    };
  });
}
