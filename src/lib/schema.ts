import { z } from 'zod';

// Enums
export const AvailabilityStatusEnum = z.enum(['yes', 'no', 'partial']);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;

export const TariffUnitEnum = z.enum(['rub_per_sotka', 'rub_per_lot', 'rub_fixed']);
export type TariffUnit = z.infer<typeof TariffUnitEnum>;

export const TariffPeriodEnum = z.enum(['month', 'quarter', 'year']);
export type TariffPeriod = z.infer<typeof TariffPeriodEnum>;

export const SourceTypeEnum = z.enum(['official', 'community', 'media', 'personal']);
export type SourceType = z.infer<typeof SourceTypeEnum>;

// Road type enum (ordered from best to worst)
export const RoadTypeEnum = z.enum(['asphalt', 'partial_asphalt', 'gravel', 'dirt']);
export type RoadType = z.infer<typeof RoadTypeEnum>;

// Drainage type enum (ordered from best to worst)
export const DrainageTypeEnum = z.enum(['closed', 'open', 'none']);
export type DrainageType = z.infer<typeof DrainageTypeEnum>;

// Video surveillance enum (ordered from best to worst)
export const VideoSurveillanceEnum = z.enum(['full', 'checkpoint_only', 'none']);
export type VideoSurveillance = z.infer<typeof VideoSurveillanceEnum>;

// Underground electricity enum (ordered from best to worst)
export const UndergroundElectricityEnum = z.enum(['full', 'partial', 'none']);
export type UndergroundElectricity = z.infer<typeof UndergroundElectricityEnum>;

// Location schema with coordinate validation
export const LocationSchema = z.object({
  address_text: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  district: z.string().min(1)
});
export type Location = z.infer<typeof LocationSchema>;

// Tariff schema
export const TariffSchema = z.object({
  value: z.number().nonnegative(),
  unit: TariffUnitEnum,
  period: TariffPeriodEnum,
  normalized_per_sotka_month: z.number().nonnegative(),
  note: z.string().default('')
});
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
  playgrounds: AvailabilityStatusEnum.optional(),
  sports: AvailabilityStatusEnum.optional(),
  public_spaces: AvailabilityStatusEnum.optional(),
  beach_or_water_access: AvailabilityStatusEnum.optional(),
  admin_building: AvailabilityStatusEnum.optional(),
  // Shops
  retail_or_services: AvailabilityStatusEnum.optional()
});
export type Infrastructure = z.infer<typeof InfrastructureSchema>;

// Service model schema
export const ServiceModelSchema = z.object({
  garbage_collection: AvailabilityStatusEnum.optional(),
  snow_removal: AvailabilityStatusEnum.optional(),
  road_cleaning: AvailabilityStatusEnum.optional(),
  landscaping: AvailabilityStatusEnum.optional(),
  emergency_service: AvailabilityStatusEnum.optional(),
  dispatcher: AvailabilityStatusEnum.optional()
});
export type ServiceModel = z.infer<typeof ServiceModelSchema>;

// Promises vs Fact schema
export const PromisesVsFactSchema = z.object({
  promised: z.array(z.string()).default([]),
  actual: z.array(z.string()).default([]),
  notes: z.string().default('')
});
export type PromisesVsFact = z.infer<typeof PromisesVsFactSchema>;

// Transparency schema
export const TransparencySchema = z.object({
  has_public_tariff: z.boolean().default(false),
  has_website: z.boolean().default(false),
  has_phone: z.boolean().default(false),
  has_management_info: z.boolean().default(false),
  notes: z.string().default('')
});
export type Transparency = z.infer<typeof TransparencySchema>;

// Source schema
export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: SourceTypeEnum,
  date_checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  comment: z.string().default('')
});
export type Source = z.infer<typeof SourceSchema>;

// Main Settlement schema
export const SettlementSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  website: z.string().url(),
  management_company: z.string().min(1),
  is_baseline: z.boolean().default(false),
  location: LocationSchema,
  tariff: TariffSchema,
  infrastructure: InfrastructureSchema.default({}),
  service_model: ServiceModelSchema.default({}),
  promises_vs_fact: PromisesVsFactSchema.prefault({}),
  transparency: TransparencySchema.prefault({}),
  sources: z.array(SourceSchema).min(1),
  comparison_notes: z.array(z.string()).default([])
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
  infrastructureDelta: Record<string, number>;
  servicesDelta: Record<string, number>;
  transparencyDelta: Record<string, number>;
}
