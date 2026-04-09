import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  calculatePercentile,
  computeStats,
  rankSettlements,
} from './stats';
import type { Settlement } from './schema';

describe('Stats Module', () => {
  describe('calculateMedian', () => {
    it('should calculate median for odd count array', () => {
      const values = [1, 2, 3, 4, 5];
      expect(calculateMedian(values)).toBe(3);
    });

    it('should calculate median for even count array', () => {
      const values = [1, 2, 3, 4];
      expect(calculateMedian(values)).toBe(2.5);
    });

    it('should return single value for single element array', () => {
      const values = [42];
      expect(calculateMedian(values)).toBe(42);
    });

    it('should throw error for empty array', () => {
      expect(() => calculateMedian([])).toThrow(
        'Cannot calculate median of empty array',
      );
    });

    it('should handle unsorted arrays', () => {
      const values = [5, 2, 8, 1, 9];
      expect(calculateMedian(values)).toBe(5);
    });

    it('should handle decimal values', () => {
      const values = [1.5, 2.5, 3.5];
      expect(calculateMedian(values)).toBe(2.5);
    });
  });

  describe('rankSettlements', () => {
    it('should share ranks for equal tariffs', () => {
      const settlements: Settlement[] = [
        {
          name: 'Gamma',
          short_name: 'Гамма',
          slug: 'gamma',
          website: 'https://gamma.test',
          is_baseline: false,
          location: {
            address_text: 'МО',
            lat: 55,
            lng: 37,
            district: 'Test',
          },
          tariff: {
            value: 200,
            unit: 'rub_per_sotka',
            period: 'month',
            normalized_per_sotka_month: 200,
            normalized_is_estimate: false,
          },
          infrastructure: {},
          common_spaces: {},
          service_model: {},
          sources: [
            {
              title: 'Test',
              url: 'https://test.com',
              type: 'official',
              date_checked: '2026-04-03',
              comment: '',
            },
          ],
        },
        {
          name: 'Alpha',
          short_name: 'Альфа',
          slug: 'alpha',
          website: 'https://alpha.test',
          is_baseline: true,
          location: {
            address_text: 'МО',
            lat: 55.1,
            lng: 37.1,
            district: 'Test',
          },
          tariff: {
            value: 100,
            unit: 'rub_per_sotka',
            period: 'month',
            normalized_per_sotka_month: 100,
            normalized_is_estimate: false,
          },
          infrastructure: {},
          common_spaces: {},
          service_model: {},
          sources: [
            {
              title: 'Test',
              url: 'https://test.com',
              type: 'official',
              date_checked: '2026-04-03',
              comment: '',
            },
          ],
        },
        {
          name: 'Beta',
          short_name: 'Бета',
          slug: 'beta',
          website: 'https://beta.test',
          is_baseline: false,
          location: {
            address_text: 'МО',
            lat: 55.2,
            lng: 37.2,
            district: 'Test',
          },
          tariff: {
            value: 100,
            unit: 'rub_per_sotka',
            period: 'month',
            normalized_per_sotka_month: 100,
            normalized_is_estimate: false,
          },
          infrastructure: {},
          common_spaces: {},
          service_model: {},
          sources: [
            {
              title: 'Test',
              url: 'https://test.com',
              type: 'official',
              date_checked: '2026-04-03',
              comment: '',
            },
          ],
        },
      ];

      const ranks = rankSettlements(settlements);

      expect(ranks.get('alpha')).toBe(1);
      expect(ranks.get('beta')).toBe(1);
      expect(ranks.get('gamma')).toBe(2);
    });
  });

  describe('calculatePercentile', () => {
    it('should calculate positive percentile when value is higher', () => {
      // Shelkovo 120, median 80 → +50%
      expect(calculatePercentile(120, 80)).toBe(50);
    });

    it('should calculate negative percentile when value is lower', () => {
      // Shelkovo 120, median 150 → -20%
      expect(calculatePercentile(120, 150)).toBe(-20);
    });

    it('should return 0 when value equals median', () => {
      expect(calculatePercentile(100, 100)).toBe(0);
    });

    it('should handle decimal percentages', () => {
      // Shelkovo 100, median 66.67 → +50%
      expect(calculatePercentile(100, 66.666666)).toBeCloseTo(50, 1);
    });
  });

  describe('computeStats', () => {
    const mockSettlements: Settlement[] = [
      {
        name: 'Shelkovo',
        short_name: 'Shelkovo',
        slug: 'shelkovo',
        website: 'https://shelkovo.ru',
        management_company: 'УК Шелково',
        is_baseline: true,
        location: {
          address_text: 'МО, Шелково',
          lat: 55.0,
          lng: 37.0,
          district: 'Test',
        },
        tariff: {
          value: 4500,
          unit: 'rub_per_sotka',
          period: 'month',
          normalized_per_sotka_month: 4500,
          normalized_is_estimate: false,
          note: '',
        },
        infrastructure: {
          roads: 'partial_asphalt',
          sidewalks: 'no',
          lighting: 'yes',
          gas: 'yes',
          water: 'yes',
          sewage: 'no',
          drainage: 'open',
          checkpoints: 'yes',
          security: 'yes',
          fencing: 'yes',
          video_surveillance: 'checkpoint_only',
          underground_electricity: 'partial',
          admin_building: 'no',
          retail_or_services: 'no',
        },
        common_spaces: {
          club_infrastructure: 'yes',
          playgrounds: 'yes',
          sports: 'yes',
          pool: 'no',
          fitness_club: 'no',
          restaurant: 'no',
          spa_center: 'no',
          walking_routes: 'no',
          water_access: 'yes',
          beach_zones: 'no',
          kids_club: 'no',
          sports_camp: 'no',
          primary_school: 'no',
          bbq_zones: 'no',
        },
        service_model: {
          garbage_collection: 'yes',
          snow_removal: 'yes',
          road_cleaning: 'yes',
          landscaping: 'yes',
          emergency_service: 'yes',
          dispatcher: 'yes',
        },
        sources: [
          {
            title: 'Test',
            url: 'https://test.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      },
      {
        name: 'Lesnoe',
        short_name: 'Lesnoe',
        slug: 'lesnoe',
        website: 'https://lesnoe.ru',
        management_company: 'УК Лесное',
        is_baseline: false,
        location: {
          address_text: 'МО, Лесное',
          lat: 55.1,
          lng: 37.1,
          district: 'Test',
        },
        tariff: {
          value: 3500,
          unit: 'rub_per_sotka',
          period: 'month',
          normalized_per_sotka_month: 3500,
          normalized_is_estimate: false,
          note: '',
        },
        infrastructure: {
          roads: 'asphalt',
          sidewalks: 'yes',
          lighting: 'yes',
          gas: 'yes',
          water: 'yes',
          sewage: 'yes',
          drainage: 'closed',
          checkpoints: 'yes',
          security: 'yes',
          fencing: 'yes',
          video_surveillance: 'full',
          underground_electricity: 'full',
          admin_building: 'yes',
          retail_or_services: 'yes',
        },
        common_spaces: {
          club_infrastructure: 'yes',
          playgrounds: 'yes',
          sports: 'yes',
          pool: 'yes',
          fitness_club: 'yes',
          restaurant: 'yes',
          spa_center: 'yes',
          walking_routes: 'yes',
          water_access: 'yes',
          beach_zones: 'yes',
          kids_club: 'no',
          sports_camp: 'no',
          primary_school: 'no',
          bbq_zones: 'yes',
        },
        service_model: {
          garbage_collection: 'yes',
          snow_removal: 'yes',
          road_cleaning: 'yes',
          landscaping: 'yes',
          emergency_service: 'yes',
          dispatcher: 'yes',
        },
        sources: [
          {
            title: 'Test',
            url: 'https://test.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      },
      {
        name: 'Usadby',
        short_name: 'Usadby',
        slug: 'usadby',
        website: 'https://usadby.ru',
        management_company: 'УК Усадьбы',
        is_baseline: false,
        location: {
          address_text: 'МО, Усадьбы',
          lat: 55.2,
          lng: 37.2,
          district: 'Test',
        },
        tariff: {
          value: 5500,
          unit: 'rub_per_sotka',
          period: 'month',
          normalized_per_sotka_month: 5500,
          normalized_is_estimate: false,
          note: '',
        },
        infrastructure: {
          roads: 'asphalt',
          sidewalks: 'yes',
          lighting: 'yes',
          gas: 'yes',
          water: 'yes',
          sewage: 'yes',
          drainage: 'closed',
          checkpoints: 'yes',
          security: 'yes',
          fencing: 'yes',
          video_surveillance: 'full',
          underground_electricity: 'full',
          admin_building: 'yes',
          retail_or_services: 'yes',
        },
        common_spaces: {
          club_infrastructure: 'yes',
          playgrounds: 'yes',
          sports: 'yes',
          pool: 'yes',
          fitness_club: 'yes',
          restaurant: 'yes',
          spa_center: 'yes',
          walking_routes: 'yes',
          water_access: 'yes',
          beach_zones: 'yes',
          kids_club: 'yes',
          sports_camp: 'yes',
          primary_school: 'yes',
          bbq_zones: 'yes',
        },
        service_model: {
          garbage_collection: 'yes',
          snow_removal: 'yes',
          road_cleaning: 'yes',
          landscaping: 'yes',
          emergency_service: 'yes',
          dispatcher: 'yes',
        },
        sources: [
          {
            title: 'Test',
            url: 'https://test.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      },
    ];

    it('should compute correct stats for settlements', () => {
      const stats = computeStats(mockSettlements);

      expect(stats.shelkovoTariff).toBe(4500);
      expect(stats.medianTariff).toBe(4500); // Middle value of [3500, 4500, 5500]
      expect(stats.meanTariff).toBe(4500); // (3500 + 4500 + 5500) / 3
      expect(stats.minTariff).toBe(3500);
      expect(stats.maxTariff).toBe(5500);
      expect(stats.shelkovoRank).toBe(2); // 2nd cheapest out of 3
      expect(stats.totalSettlements).toBe(3);
      expect(stats.cheaperCount).toBe(1); // Lesnoe is cheaper
      expect(stats.moreExpensiveCount).toBe(1); // Usadby is more expensive
      expect(stats.shelkovoVsMedianPercent).toBe(0); // 4500 vs 4500
      expect(stats.shelkovoVsMeanPercent).toBe(0); // 4500 vs 4500
    });

    it('should use unique tariff levels for baseline rank', () => {
      const tied = [
        ...mockSettlements,
        {
          ...mockSettlements[1],
          name: 'Lesnoe 2',
          short_name: 'Lesnoe 2',
          slug: 'lesnoe-2',
          website: 'https://lesnoe-2.ru',
        },
      ];

      const stats = computeStats(tied);

      expect(stats.shelkovoRank).toBe(2);
    });

    it('should throw error when no baseline settlement found', () => {
      const noBaselineSettlements = mockSettlements.map((s) => ({
        ...s,
        is_baseline: false,
      }));
      expect(() => computeStats(noBaselineSettlements)).toThrow(
        'Baseline settlement (Shelkovo) not found',
      );
    });

    it('should throw error when settlements array is empty', () => {
      expect(() => computeStats([])).toThrow('No settlements provided');
    });
  });
});
