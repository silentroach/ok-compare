import { describe, it, expect, expectTypeOf } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import type { Settlement } from '../lib/schema';
import {
  SettlementSchema,
  LocationSchema,
  InfrastructureSchema,
  SourceSchema,
  AvailabilityStatusEnum,
  TariffUnitEnum,
  TariffPeriodEnum,
  SourceTypeEnum,
} from '../lib/schema';

describe('Schema Validation', () => {
  describe('Valid Settlement Parses', () => {
    it('should parse a complete valid settlement', () => {
      const validSettlement = {
        name: 'Коттеджный поселок Тестовый',
        short_name: 'Тестовый',
        slug: 'testovyy',
        website: 'https://test.example.com',
        management_company: 'УК Тест',
        is_baseline: false,
        location: {
          address_text: 'Московская область, Тестовый район',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Тестовый район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: 'Тестовая заметка',
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
          playgrounds: 'yes',
          sports: 'yes',
          public_spaces: 'yes',
          beach_or_water_access: 'no',
          admin_building: 'yes',
          retail_or_services: 'yes',
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
            title: 'Тестовый источник',
            url: 'https://example.com/source',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(validSettlement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Коттеджный поселок Тестовый');
        expect(result.data.slug).toBe('testovyy');
        expect(result.data.is_baseline).toBe(false);
        expect(result.data.tariff.normalized_per_sotka_month).toBe(3000);
        expect(result.data.tariff.normalized_is_estimate).toBe(false);
      }
    });

    it('should auto-normalize lot tariff with estimate flag', () => {
      const validSettlement = {
        name: 'Коттеджный поселок Тестовый',
        short_name: 'Тестовый',
        slug: 'testovyy',
        website: 'https://test.example.com',
        is_baseline: false,
        location: {
          address_text: 'Московская область, Тестовый район',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Тестовый район',
        },
        tariff: {
          value: 12000,
          unit: 'rub_per_lot',
          period: 'month',
        },
        sources: [
          {
            title: 'Тестовый источник',
            url: 'https://example.com/source',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(validSettlement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tariff.normalized_per_sotka_month).toBe(1200);
        expect(result.data.tariff.normalized_is_estimate).toBe(true);
      }
    });

    it('should parse settlement with management company object', () => {
      const validSettlement = {
        name: 'Коттеджный поселок Тестовый',
        short_name: 'Тестовый',
        slug: 'testovyy',
        website: 'https://test.example.com',
        management_company: {
          title: 'УК Тест',
          url: 'https://example.com/uk-test',
        },
        is_baseline: false,
        location: {
          address_text: 'Московская область, Тестовый район',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Тестовый район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: 'Тестовая заметка',
        },
        infrastructure: {},
        service_model: {},
        sources: [
          {
            title: 'Тестовый источник',
            url: 'https://example.com/source',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(validSettlement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.management_company).toBe('object');
      }
    });

    it('should parse settlement without management company', () => {
      const validSettlement = {
        name: 'Коттеджный поселок Тестовый',
        short_name: 'Тестовый',
        slug: 'testovyy',
        website: 'https://test.example.com',
        is_baseline: false,
        location: {
          address_text: 'Московская область, Тестовый район',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Тестовый район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: 'Тестовая заметка',
        },
        infrastructure: {},
        service_model: {},
        sources: [
          {
            title: 'Тестовый источник',
            url: 'https://example.com/source',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(validSettlement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.management_company).toBe(undefined);
      }
    });
  });

  describe('Invalid Tariff Unit Fails', () => {
    it('should fail with invalid unit and include valid enum values', () => {
      const invalidSettlement = {
        name: 'Тест',
        short_name: 'Тест',
        slug: 'test',
        website: 'https://test.com',
        management_company: 'УК Тест',
        location: {
          address_text: 'Адрес',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Район',
        },
        tariff: {
          value: 3000,
          unit: 'per_day', // Invalid unit
          period: 'month',
          note: '',
        },
        sources: [
          {
            title: 'Источник',
            url: 'https://example.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(invalidSettlement);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues[0];
        expect(error.path).toContain('tariff');
        expect(error.path).toContain('unit');
        expect(error.message).toContain('rub_per_sotka');
        expect(error.message).toContain('rub_per_lot');
        expect(error.message).toContain('rub_fixed');
      }
    });
  });

  describe('Missing Required Field Fails', () => {
    it('should fail when name field is missing', () => {
      const incompleteSettlement = {
        short_name: 'Тест',
        slug: 'test',
        website: 'https://test.com',
        management_company: 'УК Тест',
        location: {
          address_text: 'Адрес',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: '',
        },
        sources: [
          {
            title: 'Источник',
            url: 'https://example.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(incompleteSettlement);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((e) =>
          e.path.includes('name'),
        );
        expect(nameError).toBeDefined();
        expect(nameError?.message.toLowerCase()).toContain('expected string');
      }
    });
  });

  describe('Invalid Coordinates Fails', () => {
    it('should fail when latitude is out of range', () => {
      const invalidLocation = {
        address_text: 'Адрес',
        lat: 999, // Invalid latitude
        lng: 37.6173,
        district: 'Район',
      };

      const result = LocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
      if (!result.success) {
        const latError = result.error.issues.find((e) =>
          e.path.includes('lat'),
        );
        expect(latError).toBeDefined();
      }
    });

    it('should fail when longitude is out of range', () => {
      const invalidLocation = {
        address_text: 'Адрес',
        lat: 55.7558,
        lng: 999, // Invalid longitude
        district: 'Район',
      };

      const result = LocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
      if (!result.success) {
        const lngError = result.error.issues.find((e) =>
          e.path.includes('lng'),
        );
        expect(lngError).toBeDefined();
      }
    });
  });

  describe('Partial Infrastructure Valid', () => {
    it('should parse with defaults for missing infrastructure fields', () => {
      const partialInfrastructure = {
        roads: 'asphalt',
        sidewalks: 'yes',
        lighting: 'yes',
        gas: 'yes',
        water: 'yes',
        // Missing 11 other fields
      };

      const result = InfrastructureSchema.safeParse(partialInfrastructure);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.roads).toBe('asphalt');
        expect(result.data.sidewalks).toBe('yes');
        expect(result.data.drainage).toBe(undefined); // Not specified
        expect(result.data.security).toBe(undefined); // Not specified
      }
    });

    it('should parse empty infrastructure object with all defaults', () => {
      const result = InfrastructureSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.roads).toBe(undefined);
        expect(result.data.water).toBe(undefined);
        expect(result.data.playgrounds).toBe(undefined);
      }
    });
  });

  describe('Enum Validation', () => {
    it('should validate AvailabilityStatus enum', () => {
      expect(AvailabilityStatusEnum.safeParse('yes').success).toBe(true);
      expect(AvailabilityStatusEnum.safeParse('no').success).toBe(true);
      expect(AvailabilityStatusEnum.safeParse('partial').success).toBe(true);
      expect(AvailabilityStatusEnum.safeParse('invalid').success).toBe(false);
    });

    it('should validate TariffUnit enum', () => {
      expect(TariffUnitEnum.safeParse('rub_per_sotka').success).toBe(true);
      expect(TariffUnitEnum.safeParse('rub_per_lot').success).toBe(true);
      expect(TariffUnitEnum.safeParse('rub_fixed').success).toBe(true);
      expect(TariffUnitEnum.safeParse('per_day').success).toBe(false);
    });

    it('should validate TariffPeriod enum', () => {
      expect(TariffPeriodEnum.safeParse('month').success).toBe(true);
      expect(TariffPeriodEnum.safeParse('quarter').success).toBe(true);
      expect(TariffPeriodEnum.safeParse('year').success).toBe(true);
      expect(TariffPeriodEnum.safeParse('week').success).toBe(false);
    });

    it('should validate SourceType enum', () => {
      expect(SourceTypeEnum.safeParse('official').success).toBe(true);
      expect(SourceTypeEnum.safeParse('community').success).toBe(true);
      expect(SourceTypeEnum.safeParse('media').success).toBe(true);
      expect(SourceTypeEnum.safeParse('personal').success).toBe(true);
      expect(SourceTypeEnum.safeParse('government').success).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validSource = {
        title: 'Test',
        url: 'https://example.com',
        type: 'official',
        date_checked: '2026-04-03',
        comment: '',
      };

      const result = SourceSchema.safeParse(validSource);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid URLs', () => {
      const invalidSource = {
        title: 'Test',
        url: 'not-a-url',
        type: 'official',
        date_checked: '2026-04-03',
        comment: '',
      };

      const result = SourceSchema.safeParse(invalidSource);
      expect(result.success).toBe(false);
    });
  });

  describe('Slug Validation', () => {
    it('should validate valid slugs', () => {
      const settlementWithValidSlug = {
        name: 'Тест',
        short_name: 'Тест',
        slug: 'valid-slug-123',
        website: 'https://test.com',
        management_company: 'УК Тест',
        location: {
          address_text: 'Адрес',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: '',
        },
        sources: [
          {
            title: 'Источник',
            url: 'https://example.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(settlementWithValidSlug);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid slug format', () => {
      const settlementWithInvalidSlug = {
        name: 'Тест',
        short_name: 'Тест',
        slug: 'Invalid Slug!', // Invalid characters
        website: 'https://test.com',
        management_company: 'УК Тест',
        location: {
          address_text: 'Адрес',
          lat: 55.7558,
          lng: 37.6173,
          district: 'Район',
        },
        tariff: {
          value: 3000,
          unit: 'rub_per_sotka',
          period: 'month',
          note: '',
        },
        sources: [
          {
            title: 'Источник',
            url: 'https://example.com',
            type: 'official',
            date_checked: '2026-04-03',
            comment: '',
          },
        ],
      };

      const result = SettlementSchema.safeParse(settlementWithInvalidSlug);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Contracts', () => {
    it('should keep settlement schema and collection data aligned', () => {
      type Data = CollectionEntry<'settlements'>['data'];
      expectTypeOf<Data>().toEqualTypeOf<Settlement>();
    });
  });
});
