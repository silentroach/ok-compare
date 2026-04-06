import { z } from 'zod';

// Enums
export const AvailabilityStatusEnum = z.enum(['yes', 'no', 'partial']);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;

export const TariffUnitEnum = z.enum([
  'rub_per_sotka',
  'rub_per_lot',
  'rub_fixed',
]);
export type TariffUnit = z.infer<typeof TariffUnitEnum>;

export const TariffPeriodEnum = z.enum(['month', 'quarter', 'year']);
export type TariffPeriod = z.infer<typeof TariffPeriodEnum>;

export const SourceTypeEnum = z.enum([
  'official',
  'community',
  'media',
  'personal',
]);
export type SourceType = z.infer<typeof SourceTypeEnum>;

// Road type enum (ordered from best to worst)
export const RoadTypeEnum = z.enum([
  'asphalt',
  'partial_asphalt',
  'gravel',
  'dirt',
]);
export type RoadType = z.infer<typeof RoadTypeEnum>;

// Drainage type enum (ordered from best to worst)
export const DrainageTypeEnum = z.enum(['closed', 'open', 'none']);
export type DrainageType = z.infer<typeof DrainageTypeEnum>;

// Video surveillance enum (ordered from best to worst)
export const VideoSurveillanceEnum = z.enum([
  'full',
  'checkpoint_only',
  'none',
]);
export type VideoSurveillance = z.infer<typeof VideoSurveillanceEnum>;

// Underground electricity enum (ordered from best to worst)
export const UndergroundElectricityEnum = z.enum(['full', 'partial', 'none']);
export type UndergroundElectricity = z.infer<typeof UndergroundElectricityEnum>;

// Location schema with coordinate validation
export const LocationSchema = z.object({
  address_text: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  map_url: z.string().url().optional(),
  district: z.string().min(1),
});
export type Location = z.infer<typeof LocationSchema>;

// Tariff schema
const LOT = 10;

function month(period: TariffPeriod): number {
  if (period === 'month') return 1;
  if (period === 'quarter') return 3;
  return 12;
}

function norm(value: number, unit: TariffUnit, period: TariffPeriod): number {
  const monthly = value / month(period);
  if (unit === 'rub_per_sotka') return monthly;
  return monthly / LOT;
}

export const TariffSchema = z
  .object({
    value: z.number().nonnegative(),
    unit: TariffUnitEnum,
    period: TariffPeriodEnum,
    note: z.string().optional(),
  })
  .transform((item) => ({
    ...item,
    normalized_per_sotka_month: norm(item.value, item.unit, item.period),
    normalized_is_estimate: item.unit !== 'rub_per_sotka',
  }));
export type Tariff = z.infer<typeof TariffSchema>;

// Infrastructure schema - all fields optional
export const InfrastructureSchema = z.object({
  // Road type (allows comparison: asphalt > partial_asphalt > gravel > dirt)
  roads: RoadTypeEnum.optional(),
  sidewalks: AvailabilityStatusEnum.optional(),
  lighting: AvailabilityStatusEnum.optional(),
  gas: AvailabilityStatusEnum.optional(),
  // Central water supply
  water: AvailabilityStatusEnum.optional(),
  // Central sewage
  sewage: AvailabilityStatusEnum.optional(),
  // Drainage/stormwater (allows comparison: closed > open > none)
  drainage: DrainageTypeEnum.optional(),
  checkpoints: AvailabilityStatusEnum.optional(),
  security: AvailabilityStatusEnum.optional(),
  // Closed territory (fencing)
  fencing: AvailabilityStatusEnum.optional(),
  // Video surveillance (allows comparison: full > checkpoint_only > none)
  video_surveillance: VideoSurveillanceEnum.optional(),
  // Underground electricity (allows comparison: full > partial > none)
  underground_electricity: UndergroundElectricityEnum.optional(),
  admin_building: AvailabilityStatusEnum.optional(),
  // Shops
  retail_or_services: AvailabilityStatusEnum.optional(),
});
export type Infrastructure = z.infer<typeof InfrastructureSchema>;

// Common spaces schema - all fields optional
export const CommonSpacesSchema = z.object({
  playgrounds: AvailabilityStatusEnum.optional(),
  sports: AvailabilityStatusEnum.optional(),
  pool: AvailabilityStatusEnum.optional(),
  fitness_club: AvailabilityStatusEnum.optional(),
  restaurant: AvailabilityStatusEnum.optional(),
  spa_center: AvailabilityStatusEnum.optional(),
  walking_routes: AvailabilityStatusEnum.optional(),
  water_access: AvailabilityStatusEnum.optional(),
  beach_zones: AvailabilityStatusEnum.optional(),
  kids_club: AvailabilityStatusEnum.optional(),
  sports_camp: AvailabilityStatusEnum.optional(),
  primary_school: AvailabilityStatusEnum.optional(),
  club_infrastructure: AvailabilityStatusEnum.optional(),
  bbq_zones: AvailabilityStatusEnum.optional(),
});
export type CommonSpaces = z.infer<typeof CommonSpacesSchema>;

// Service model schema
export const ServiceModelSchema = z.object({
  garbage_collection: AvailabilityStatusEnum.optional(),
  snow_removal: AvailabilityStatusEnum.optional(),
  road_cleaning: AvailabilityStatusEnum.optional(),
  landscaping: AvailabilityStatusEnum.optional(),
  emergency_service: AvailabilityStatusEnum.optional(),
  dispatcher: AvailabilityStatusEnum.optional(),
});
export type ServiceModel = z.infer<typeof ServiceModelSchema>;

// Source schema
export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: SourceTypeEnum,
  date_checked: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.date().transform((item) => item.toISOString().slice(0, 10)),
  ]),
  comment: z.string().default(''),
});
export type Source = z.infer<typeof SourceSchema>;

export const ManagementCompanySchema = z.union([
  z.string().min(1),
  z.object({
    title: z.string().min(1),
    url: z.string().url(),
  }),
]);
export type ManagementCompany = z.infer<typeof ManagementCompanySchema>;

// Main Settlement schema
export const SettlementSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  website: z.string().url(),
  management_company: ManagementCompanySchema.optional(),
  is_baseline: z.boolean().default(false),
  location: LocationSchema,
  tariff: TariffSchema,
  infrastructure: InfrastructureSchema.default({}),
  common_spaces: CommonSpacesSchema.default({}),
  service_model: ServiceModelSchema.default({}),
  sources: z.array(SourceSchema).min(1),
});
export type Settlement = z.infer<typeof SettlementSchema>;

// Stats type (computed, not from YAML)
export interface Stats {
  shelkovoTariff: number;
  medianTariff: number;
  meanTariff: number;
  minTariff: number;
  maxTariff: number;
  shelkovoRank: number;
  totalSettlements: number;
  cheaperCount: number;
  moreExpensiveCount: number;
  shelkovoVsMedianPercent: number;
  shelkovoVsMeanPercent: number;
}

// Comparison result type (computed)
export interface ComparisonResult {
  tariffDelta: number;
  tariffDeltaPercent: number;
  isCheaper: boolean;
}
