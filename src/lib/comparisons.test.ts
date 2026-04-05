import { describe, it, expect } from 'vitest';
import {
  compareSettlements,
  calculateTariffDelta,
  compareInfrastructure,
  compareServices
} from './comparisons';
import type { Settlement, Infrastructure, ServiceModel } from './schema';

describe('Comparisons Module', () => {
  const mockShelkovo: Settlement = {
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
      value: 120,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 120,
      normalized_is_estimate: false,
      note: ''
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
    sources: [{ title: 'Test', url: 'https://test.com', type: 'official', date_checked: '2026-04-03', comment: '' }]
  };

  describe('calculateTariffDelta', () => {
    it('should calculate positive delta when other is cheaper', () => {
      // Shelkovo 120, Other 80 -> +40 rub, +33%
      const result = calculateTariffDelta(120, 80);
      expect(result.delta).toBe(40);
      expect(result.deltaPercent).toBe(33);
      expect(result.isCheaper).toBe(true);
    });

    it('should calculate negative delta when other is more expensive', () => {
      // Shelkovo 120, Other 150 -> -30 rub, -25%
      const result = calculateTariffDelta(120, 150);
      expect(result.delta).toBe(-30);
      expect(result.deltaPercent).toBe(-25);
      expect(result.isCheaper).toBe(false);
    });

    it('should return zero delta when tariffs are equal', () => {
      const result = calculateTariffDelta(120, 120);
      expect(result.delta).toBe(0);
      expect(result.deltaPercent).toBe(0);
      expect(result.isCheaper).toBe(false);
    });
  });

  describe('compareInfrastructure', () => {
    it('should count differences correctly', () => {
      const otherInfra: Infrastructure = {
        roads: 'asphalt',  // 3 vs 2 = better
        sidewalks: 'yes',  // 2 vs 0 = better
        lighting: 'yes',
        gas: 'yes',
        water: 'yes',
        sewage: 'yes',     // 2 vs 0 = better (Shelkovo has 'no')
        drainage: 'closed', // 2 vs 1 = better
        checkpoints: 'no', // 0 vs 2 = worse
        security: 'yes',
        fencing: 'yes',
        video_surveillance: 'full', // 2 vs 1 = better
        underground_electricity: 'full', // 2 vs 1 = better
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: 'no', // 0 vs 2 = worse (Shelkovo has 'yes')
        admin_building: 'yes', // 2 vs 0 = better (Shelkovo has 'no')
        retail_or_services: 'partial' // 1 vs 0 = better (Shelkovo has 'no')
      };

      const result = compareInfrastructure(mockShelkovo.infrastructure, otherInfra);
      expect(result.betterCount).toBe(8); // roads, sidewalks, sewage, drainage, video, underground, admin, retail
      expect(result.worseCount).toBe(2); // checkpoints, beach
      expect(result.differences).toHaveLength(10);
    });

    it('should handle unknown values', () => {
      const otherInfra: Infrastructure = {
        roads: undefined,
        sidewalks: 'yes',  // 2 vs 0 = better
        lighting: 'yes',
        gas: 'yes',
        water: 'yes',
        sewage: undefined,
        drainage: undefined,
        checkpoints: 'yes',
        security: 'yes',
        fencing: 'yes',
        video_surveillance: undefined,
        underground_electricity: undefined,
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: undefined,
        admin_building: undefined,
        retail_or_services: undefined
      };

      const result = compareInfrastructure(mockShelkovo.infrastructure, otherInfra);
      // Only sidewalks differs (other is better), rest either match or skipped due to undefined
      expect(result.betterCount).toBe(1);
      expect(result.worseCount).toBe(0);
      expect(result.differences).toHaveLength(1);
    });

    it('should score infrastructure items correctly', () => {
      const shelkovoInfra: Infrastructure = {
        roads: 'asphalt', // score: 3
        sidewalks: 'partial', // score: 1
        lighting: 'no', // score: 0
        gas: undefined, // skipped
        water: 'yes', // score: 2
        sewage: 'yes', // score: 2
        drainage: 'closed', // score: 2
        checkpoints: 'yes', // score: 2
        security: 'yes', // score: 2
        fencing: 'yes', // score: 2
        video_surveillance: 'full', // score: 2
        underground_electricity: 'full', // score: 2
        playgrounds: 'yes', // score: 2
        sports: 'yes', // score: 2
        public_spaces: 'yes', // score: 2
        beach_or_water_access: 'yes', // score: 2
        admin_building: 'yes', // score: 2
        retail_or_services: 'yes' // score: 2
      };

      const otherInfra: Infrastructure = {
        roads: 'gravel', // score: 1 (worse than asphalt=3)
        sidewalks: 'yes', // score: 2 (better than partial=1)
        lighting: 'partial', // score: 1 (better than no=0)
        gas: 'yes', // score: 2 (baseline undefined, skipped)
        water: 'yes', // score: 2 (same)
        sewage: 'yes', // score: 2 (same)
        drainage: 'closed', // score: 2 (same)
        checkpoints: 'yes', // score: 2 (same)
        security: 'yes', // score: 2 (same)
        fencing: 'yes', // score: 2 (same)
        video_surveillance: 'full', // score: 2 (same)
        underground_electricity: 'full', // score: 2 (same)
        playgrounds: 'yes', // score: 2 (same)
        sports: 'yes', // score: 2 (same)
        public_spaces: 'yes', // score: 2 (same)
        beach_or_water_access: 'yes', // score: 2 (same)
        admin_building: 'yes', // score: 2 (same)
        retail_or_services: 'yes' // score: 2 (same)
      };

      const result = compareInfrastructure(shelkovoInfra, otherInfra);
      expect(result.betterCount).toBe(2); // sidewalks, lighting
      expect(result.worseCount).toBe(1); // roads
    });
  });

  describe('compareServices', () => {
    it('should count service differences', () => {
      const otherService: ServiceModel = {
        garbage_collection: 'yes',
        snow_removal: 'no', // Different
        road_cleaning: 'yes',
        landscaping: 'partial', // Different
        emergency_service: 'yes',
        dispatcher: 'yes'
      };

      const result = compareServices(mockShelkovo.service_model, otherService);
      expect(result.betterCount).toBe(0);
      expect(result.worseCount).toBe(2); // snow_removal, landscaping
    });
  });

  describe('compareSettlements', () => {
    it('should return complete comparison result', () => {
      const otherSettlement: Settlement = {
        ...mockShelkovo,
        slug: 'lesnoe',
        short_name: 'Lesnoe',
        name: 'Lesnoe',
        is_baseline: false,
        tariff: {
          value: 80,
          unit: 'rub_per_sotka',
          period: 'month',
          normalized_per_sotka_month: 80,
          normalized_is_estimate: false,
          note: ''
        }
      };

      const result = compareSettlements(mockShelkovo, otherSettlement);
      expect(result.tariffDelta).toBe(40);
      expect(result.tariffDeltaPercent).toBe(33);
      expect(result.isCheaper).toBe(true);
      expect(result.infrastructureDelta).toBeDefined();
      expect(result.servicesDelta).toBeDefined();
    });
  });
});
