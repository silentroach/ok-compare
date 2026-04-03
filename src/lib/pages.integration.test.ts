import { describe, it, expect } from 'vitest';
import { compareSettlements } from './comparisons';
import { computeStats } from './stats';
import type { Settlement } from './schema';

// Mock settlements data for integration testing
const mockSettlements: Settlement[] = [
  {
    name: 'Коттеджный посёлок Шелково',
    short_name: 'Шелково',
    slug: 'shelkovo',
    website: 'https://shelkovo-kp.ru',
    management_company: 'УК Шелково',
    is_baseline: true,
    location: {
      address_text: 'МО, Истринский р-н, КП Шелково',
      lat: 55.8234,
      lng: 37.1456,
      district: 'Истринский',
      area: 'Новорижское направление'
    },
    distance_from_shelkovo_km: 0,
    tariff: {
      value: 120,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 120,
      note: 'Тариф с января 2026 года'
    },
    settlement_status: 'mostly_complete',
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
      playgrounds: 'yes',
      sports: 'yes',
      public_spaces: 'yes',
      beach_or_water_access: 'yes',
      admin_building: 'no',
      retail_or_services: 'no'
    },
    service_model: {
      garbage_collection: 'yes',
      snow_removal: 'yes',
      road_cleaning: 'yes',
      landscaping: 'yes',
      emergency_service: 'yes',
      dispatcher: 'yes'
    },
    promises_vs_fact: {
      promised: [],
      actual: [],
      notes: ''
    },
    transparency: {
      has_public_tariff: true,
      has_website: true,
      has_phone: true,
      has_management_info: true,
      notes: ''
    },
    sources: [
      {
        title: 'Сайт УК КП Шелково',
        url: 'https://shelkovo-kp.ru',
        type: 'official',
        date_checked: '2026-03-10',
        comment: ''
      }
    ],
    comparison_notes: []
  },
  {
    name: 'Коттеджный посёлок Лесное',
    short_name: 'Лесное',
    slug: 'lesnoe',
    website: 'https://lesnoe-kp.ru',
    management_company: 'УК Лесное',
    is_baseline: false,
    location: {
      address_text: 'МО, Истринский р-н, КП Лесное',
      lat: 55.8432,
      lng: 37.1234,
      district: 'Истринский',
      area: 'Новорижское направление'
    },
    distance_from_shelkovo_km: 3.2,
    tariff: {
      value: 95,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 95,
      note: ''
    },
    settlement_status: 'complete',
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
      playgrounds: 'yes',
      sports: 'yes',
      public_spaces: 'yes',
      beach_or_water_access: 'no',
      admin_building: 'yes',
      retail_or_services: 'yes'
    },
    service_model: {
      garbage_collection: 'yes',
      snow_removal: 'yes',
      road_cleaning: 'yes',
      landscaping: 'yes',
      emergency_service: 'yes',
      dispatcher: 'yes'
    },
    promises_vs_fact: {
      promised: [],
      actual: [],
      notes: ''
    },
    transparency: {
      has_public_tariff: true,
      has_website: true,
      has_phone: true,
      has_management_info: true,
      notes: ''
    },
    sources: [
      {
        title: 'Сайт КП Лесное',
        url: 'https://lesnoe-kp.ru',
        type: 'official',
        date_checked: '2026-03-10',
        comment: ''
      }
    ],
    comparison_notes: []
  }
];

// Integration tests for page generation
describe('Page Generation Integration', () => {
  const baseline = mockSettlements.find(s => s.is_baseline)!;
  
  describe('Baseline Settlement', () => {
    it('should find baseline settlement', () => {
      expect(baseline).toBeDefined();
      expect(baseline.slug).toBe('shelkovo');
      expect(baseline.is_baseline).toBe(true);
    });

    it('should have baseline tariff', () => {
      expect(baseline.tariff.normalized_per_sotka_month).toBe(120);
    });
  });

  describe('Settlement Data Structure', () => {
    it('should have required fields for each settlement', () => {
      for (const settlement of mockSettlements) {
        expect(settlement.slug).toBeDefined();
        expect(typeof settlement.slug).toBe('string');
        expect(settlement.name).toBeDefined();
        expect(typeof settlement.name).toBe('string');
        expect(settlement.tariff).toBeDefined();
        expect(settlement.tariff.normalized_per_sotka_month).toBeGreaterThan(0);
      }
    });

    it('should have unique slugs', () => {
      const slugs = mockSettlements.map(s => s.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('Comparisons', () => {
    it('should compare baseline with itself', () => {
      const comparison = compareSettlements(baseline, baseline);
      expect(comparison.tariffDelta).toBe(0);
      expect(comparison.tariffDeltaPercent).toBe(0);
      expect(comparison.isCheaper).toBe(false);
    });

    it('should correctly identify cheaper settlements', () => {
      const lesnoe = mockSettlements.find(s => s.slug === 'lesnoe')!;
      const comparison = compareSettlements(baseline, lesnoe);
      
      // Delta is positive when baseline is more expensive
      expect(comparison.tariffDelta).toBe(25);
      expect(comparison.isCheaper).toBe(true);
    });

    it('should generate comparisons for all settlements', () => {
      const comparisons = new Map();
      
      for (const settlement of mockSettlements) {
        const comparison = compareSettlements(baseline, settlement);
        comparisons.set(settlement.slug, comparison);
      }
      
      expect(comparisons.size).toBe(mockSettlements.length);
      
      for (const settlement of mockSettlements) {
        expect(comparisons.has(settlement.slug)).toBe(true);
      }
    });
  });

  describe('Statistics Computation', () => {
    it('should compute stats for all settlements', () => {
      const stats = computeStats(mockSettlements);
      
      expect(stats.totalSettlements).toBe(2);
      expect(stats.shelkovoTariff).toBe(120);
      expect(stats.minTariff).toBe(95);
      expect(stats.maxTariff).toBe(120);
      expect(stats.medianTariff).toBe(107.5);
    });
  });

  describe('Static Paths Generation', () => {
    it('should generate static paths for all settlements', () => {
      const paths = mockSettlements.map(s => ({ 
        params: { slug: s.slug } 
      }));
      
      expect(paths.length).toBe(mockSettlements.length);
      
      for (const path of paths) {
        expect(path.params.slug).toBeDefined();
        expect(typeof path.params.slug).toBe('string');
        expect(path.params.slug.length).toBeGreaterThan(0);
      }
    });

    it('should include Shelkovo in static paths', () => {
      const paths = mockSettlements.map(s => s.slug);
      expect(paths).toContain('shelkovo');
    });
  });

  describe('Page Content Requirements', () => {
    it('should have all data needed for settlement pages', () => {
      for (const settlement of mockSettlements) {
        // Required for page rendering
        expect(settlement.name).toBeTruthy();
        expect(settlement.tariff.normalized_per_sotka_month).toBeGreaterThan(0);
        expect(settlement.location).toBeDefined();
        expect(settlement.infrastructure).toBeDefined();
        expect(settlement.service_model).toBeDefined();
      }
    });

    it('should have comparison data for context', () => {
      for (const settlement of mockSettlements) {
        const comparison = compareSettlements(baseline, settlement);
        expect(typeof comparison.tariffDelta).toBe('number');
        expect(typeof comparison.tariffDeltaPercent).toBe('number');
        expect(typeof comparison.isCheaper).toBe('boolean');
      }
    });
  });

  describe('Settlement Detail Page Components', () => {
    it('should have all infrastructure data for InfrastructureTable', () => {
      for (const settlement of mockSettlements) {
        const infraKeys = Object.keys(settlement.infrastructure);
        // Infrastructure table expects 17 items (all schema fields)
        expect(infraKeys.length).toBeGreaterThanOrEqual(15);

        // Check required fields exist
        expect(settlement.infrastructure.roads).toBeDefined();
        expect(settlement.infrastructure.gas).toBeDefined();
        expect(settlement.infrastructure.water).toBeDefined();
        expect(settlement.infrastructure.security).toBeDefined();
      }
    });

    it('should have all service data for ServiceTable', () => {
      for (const settlement of mockSettlements) {
        const serviceKeys = Object.keys(settlement.service_model);
        // Service table expects 6 items
        expect(serviceKeys.length).toBeGreaterThanOrEqual(6);

        // Check required fields exist
        expect(settlement.service_model.garbage_collection).toBeDefined();
        expect(settlement.service_model.snow_removal).toBeDefined();
        expect(settlement.service_model.emergency_service).toBeDefined();
      }
    });

    it('should have sources data for SourcesList', () => {
      for (const settlement of mockSettlements) {
        expect(Array.isArray(settlement.sources)).toBe(true);

        if (settlement.sources.length > 0) {
          const firstSource = settlement.sources[0];
          expect(firstSource.title).toBeDefined();
          expect(firstSource.url).toBeDefined();
          expect(firstSource.type).toBeDefined();
          expect(firstSource.date_checked).toBeDefined();
        }
      }
    });

    it('should provide Shelkovo data for comparison column', () => {
      // Baseline should have same data as itself for comparison
      expect(baseline.infrastructure).toBeDefined();
      expect(baseline.service_model).toBeDefined();

      // Non-baseline settlements can be compared with baseline
      const lesnoe = mockSettlements.find(s => s.slug === 'lesnoe')!;
      expect(lesnoe.infrastructure).toBeDefined();
      expect(lesnoe.service_model).toBeDefined();

      // Comparison should work
      const infraDiff = Object.keys(lesnoe.infrastructure).filter(
        key => lesnoe.infrastructure[key as keyof typeof lesnoe.infrastructure] !==
               baseline.infrastructure[key as keyof typeof baseline.infrastructure]
      );
      expect(Array.isArray(infraDiff)).toBe(true);
    });

    it('should generate page props with shelkovo data', () => {
      // Simulate getStaticPaths props generation
      for (const settlement of mockSettlements) {
        const props = {
          settlement,
          comparison: compareSettlements(baseline, settlement),
          shelkovo: baseline
        };

        expect(props.settlement).toBeDefined();
        expect(props.comparison).toBeDefined();
        expect(props.shelkovo).toBeDefined();
        expect(props.shelkovo.is_baseline).toBe(true);
      }
    });
  });
});
