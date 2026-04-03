import { describe, it, expect } from 'vitest';
import {
  compareSettlements,
  calculateTariffDelta,
  compareInfrastructure,
  compareServices,
  compareTransparency
} from './comparisons';
import type { Settlement, Infrastructure, ServiceModel, Transparency } from './schema';

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
      area: 'Test'
    },
    distance_from_shelkovo_km: 0,
    tariff: {
      value: 120,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 120,
      note: ''
    },
    settlement_status: 'complete',
    infrastructure: {
      roads: 'yes',
      sidewalks: 'yes',
      lighting: 'yes',
      gas: 'yes',
      water: 'yes',
      sewage: 'yes',
      drainage: 'partial',
      checkpoints: 'yes',
      security: 'yes',
      fencing: 'yes',
      video_surveillance: 'yes',
      playgrounds: 'yes',
      sports: 'yes',
      public_spaces: 'yes',
      beach_or_water_access: 'no',
      admin_building: 'yes',
      retail_or_services: 'partial'
    },
    service_model: {
      garbage_collection: 'yes',
      snow_removal: 'yes',
      road_cleaning: 'yes',
      landscaping: 'yes',
      emergency_service: 'yes',
      dispatcher: 'yes'
    },
    promises_vs_fact: { promised: [], actual: [], notes: '' },
    transparency: {
      has_public_tariff: true,
      has_website: true,
      has_phone: true,
      has_management_info: true,
      notes: ''
    },
    sources: [{ title: 'Test', url: 'https://test.com', type: 'official', date_checked: '2026-04-03', comment: '' }],
    comparison_notes: []
  };

  describe('calculateTariffDelta', () => {
    it('should calculate positive delta when other is cheaper', () => {
      // Shelkovo 120, Other 80 → +40 rub, +50%
      const result = calculateTariffDelta(120, 80);
      expect(result.delta).toBe(40);
      expect(result.deltaPercent).toBe(50);
      expect(result.isCheaper).toBe(true);
    });

    it('should calculate negative delta when other is more expensive', () => {
      // Shelkovo 120, Other 150 → -30 rub, -20%
      const result = calculateTariffDelta(120, 150);
      expect(result.delta).toBe(-30);
      expect(result.deltaPercent).toBe(-20);
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
        roads: 'yes',
        sidewalks: 'yes',
        lighting: 'yes',
        gas: 'yes',
        water: 'yes',
        sewage: 'yes',
        drainage: 'yes', // Different: Shelkovo has 'partial'
        checkpoints: 'no', // Different: Shelkovo has 'yes'
        security: 'yes',
        fencing: 'yes',
        video_surveillance: 'yes',
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: 'no',
        admin_building: 'yes',
        retail_or_services: 'partial'
      };

      const result = compareInfrastructure(mockShelkovo.infrastructure, otherInfra);
      expect(result.betterCount).toBe(1); // drainage
      expect(result.worseCount).toBe(1); // checkpoints
      expect(result.differences).toHaveLength(2);
    });

    it('should handle unknown values', () => {
      const otherInfra: Infrastructure = {
        roads: undefined,
        sidewalks: 'yes',
        lighting: 'yes',
        gas: 'yes',
        water: 'yes',
        sewage: 'yes',
        drainage: 'partial',
        checkpoints: 'yes',
        security: 'yes',
        fencing: 'yes',
        video_surveillance: 'yes',
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: 'no',
        admin_building: 'yes',
        retail_or_services: 'partial'
      };

      const result = compareInfrastructure(mockShelkovo.infrastructure, otherInfra);
      expect(result.betterCount).toBe(0);
      expect(result.worseCount).toBe(0);
      expect(result.differences).toHaveLength(0);
    });

    it('should score yes=2, partial=1, no=0, unknown=0', () => {
      const shelkovoInfra: Infrastructure = {
        roads: 'yes', // 2
        sidewalks: 'partial', // 1
        lighting: 'no', // 0
        gas: undefined, // 0 (unknown)
        water: 'yes',
        sewage: 'yes',
        drainage: 'yes',
        checkpoints: 'yes',
        security: 'yes',
        fencing: 'yes',
        video_surveillance: 'yes',
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: 'yes',
        admin_building: 'yes',
        retail_or_services: 'yes'
      };

      const otherInfra: Infrastructure = {
        roads: 'no', // 0 (worse)
        sidewalks: 'yes', // 2 (better)
        lighting: 'partial', // 1 (better)
        gas: 'yes', // 2 (better)
        water: 'yes',
        sewage: 'yes',
        drainage: 'yes',
        checkpoints: 'yes',
        security: 'yes',
        fencing: 'yes',
        video_surveillance: 'yes',
        playgrounds: 'yes',
        sports: 'yes',
        public_spaces: 'yes',
        beach_or_water_access: 'yes',
        admin_building: 'yes',
        retail_or_services: 'yes'
      };

      const result = compareInfrastructure(shelkovoInfra, otherInfra);
      expect(result.betterCount).toBe(2); // sidewalks, lighting (gas is unknown in baseline, so skipped)
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

  describe('compareTransparency', () => {
    it('should count transparency differences', () => {
      const otherTransparency: Transparency = {
        has_public_tariff: false, // Different
        has_website: true,
        has_phone: false, // Different
        has_management_info: true,
        notes: ''
      };

      const result = compareTransparency(mockShelkovo.transparency, otherTransparency);
      expect(result.betterCount).toBe(0);
      expect(result.worseCount).toBe(2); // public_tariff, phone - other is missing these
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
          note: ''
        }
      };

      const result = compareSettlements(mockShelkovo, otherSettlement);
      expect(result.tariffDelta).toBe(40);
      expect(result.tariffDeltaPercent).toBe(50);
      expect(result.isCheaper).toBe(true);
      expect(result.infrastructureDelta).toBeDefined();
      expect(result.servicesDelta).toBeDefined();
      expect(result.transparencyDelta).toBeDefined();
    });
  });
});
