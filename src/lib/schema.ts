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

type TariffValue = {
  value: number;
  unit: TariffUnit;
  period: TariffPeriod;
};

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
const SOTKA = 100;

function month(period: TariffPeriod): number {
  if (period === 'month') return 1;
  if (period === 'quarter') return 3;
  return 12;
}

function norm(
  value: number,
  unit: TariffUnit,
  period: TariffPeriod,
  lot = LOT,
): number {
  const monthly = value / month(period);
  if (unit === 'rub_per_sotka') return monthly;
  return monthly / lot;
}

function total(list: TariffValue[], lot = LOT): number {
  return list.reduce(
    (sum, item) => sum + norm(item.value, item.unit, item.period, lot),
    0,
  );
}

const TariffPartSchema = z.object({
  value: z.number().nonnegative(),
  unit: TariffUnitEnum,
  period: TariffPeriodEnum,
  note: z.string().optional(),
});

export const TariffSchema = z
  .union([TariffPartSchema, z.array(TariffPartSchema).min(1)])
  .transform((raw) => {
    const list = Array.isArray(raw) ? raw : [raw];
    const first = list[0];
    const normalized = total(list);
    const estimated = list.some((item) => item.unit !== 'rub_per_sotka');
    const notes = list.flatMap((item) => (item.note ? [item.note] : []));
    const note = notes.length ? [...new Set(notes)].join('; ') : undefined;

    const base = {
      value: first.value,
      unit: first.unit,
      period: first.period,
      normalized_per_sotka_month: normalized,
      normalized_is_estimate: estimated,
      ...(note ? { note } : {}),
    };

    if (list.length === 1) return base;
    return { ...base, parts: list };
  });
export type Tariff = z.infer<typeof TariffSchema>;

export const LotsSchema = z.object({
  count: z.number().int().positive().optional(),
  area_ha: z.number().positive().optional(),
  average_sotka: z.number().positive().optional(),
  average_note: z.string().min(1).optional(),
});
export type Lots = z.infer<typeof LotsSchema>;

export interface LotPart {
  title: string;
  value: number;
  note?: string;
}

export interface LotBreakdown {
  size: number;
  exact: boolean;
  count?: number;
  area_ha?: number;
  gross?: number;
  shared?: number;
  note?: string;
  cap: boolean;
  rows: LotPart[];
}

function share(
  value: AvailabilityStatus | undefined,
  yes: number,
  part = yes / 2,
): number {
  if (value === 'yes') return yes;
  if (value === 'partial') return part;
  return 0;
}

function road(value: RoadType | undefined): number {
  if (value === 'asphalt') return 0.9;
  if (value === 'partial_asphalt') return 0.8;
  if (value === 'gravel') return 0.7;
  if (value === 'dirt') return 0.6;
  return 0;
}

function drain(value: DrainageType | undefined): number {
  if (value === 'closed') return 0.25;
  if (value === 'open') return 0.15;
  return 0;
}

function note(value: AvailabilityStatus | undefined): string | undefined {
  if (value === 'yes') return 'подтверждено';
  if (value === 'partial') return 'частично подтверждено';
  return;
}

function roadNote(value: RoadType | undefined): string | undefined {
  if (value === 'asphalt') return 'асфальт';
  if (value === 'partial_asphalt') return 'частично асфальт';
  if (value === 'gravel') return 'гравий';
  if (value === 'dirt') return 'грунт';
  return;
}

function drainNote(value: DrainageType | undefined): string | undefined {
  if (value === 'closed') return 'закрытая';
  if (value === 'open') return 'открытая';
  return;
}

function add(
  rows: LotPart[],
  title: string,
  value: number,
  item?: string,
): void {
  if (!value) return;
  rows.push({ title, value, ...(item ? { note: item } : {}) });
}

export function getLotBreakdown(
  lots?: Lots,
  infra?: Infrastructure,
  common?: CommonSpaces,
): LotBreakdown | undefined {
  if (lots?.average_sotka) {
    return {
      size: lots.average_sotka,
      exact: true,
      count: lots.count,
      area_ha: lots.area_ha,
      note: lots.average_note,
      cap: false,
      rows: [],
    };
  }

  if (!lots?.count || !lots.area_ha) return;

  const rows: LotPart[] = [];
  add(rows, 'Дороги', road(infra?.roads), roadNote(infra?.roads));
  add(
    rows,
    'Тротуары',
    share(infra?.sidewalks, 0.2, 0.1),
    note(infra?.sidewalks),
  );
  add(rows, 'Ливневки', drain(infra?.drainage), drainNote(infra?.drainage));
  add(
    rows,
    'КПП',
    share(infra?.checkpoints, 0.1, 0.05),
    note(infra?.checkpoints),
  );
  add(
    rows,
    'Админка',
    share(infra?.admin_building, 0.1, 0.05),
    note(infra?.admin_building),
  );
  add(
    rows,
    'Сервисы на территории',
    share(infra?.retail_or_services, 0.15, 0.08),
    note(infra?.retail_or_services),
  );
  add(
    rows,
    'Детские площадки',
    share(common?.playgrounds, 0.15, 0.08),
    note(common?.playgrounds),
  );
  add(rows, 'Спорт', share(common?.sports, 0.15, 0.08), note(common?.sports));
  add(
    rows,
    'Маршруты для прогулок',
    share(common?.walking_routes, 0.15, 0.08),
    note(common?.walking_routes),
  );
  add(
    rows,
    'Доступ к воде',
    share(common?.water_access, 0.1, 0.05),
    note(common?.water_access),
  );
  add(
    rows,
    'Пляжные зоны',
    share(common?.beach_zones, 0.15, 0.08),
    note(common?.beach_zones),
  );
  add(
    rows,
    'Детский клуб',
    share(common?.kids_club, 0.15, 0.08),
    note(common?.kids_club),
  );
  add(
    rows,
    'BBQ-зоны',
    share(common?.bbq_zones, 0.1, 0.05),
    note(common?.bbq_zones),
  );
  add(rows, 'Бассейн', share(common?.pool, 0.2, 0.1), note(common?.pool));
  add(
    rows,
    'Фитнес',
    share(common?.fitness_club, 0.2, 0.1),
    note(common?.fitness_club),
  );
  add(
    rows,
    'Ресторан',
    share(common?.restaurant, 0.2, 0.1),
    note(common?.restaurant),
  );
  add(
    rows,
    'SPA',
    share(common?.spa_center, 0.25, 0.12),
    note(common?.spa_center),
  );
  add(
    rows,
    'Спортивный лагерь',
    share(common?.sports_camp, 0.25, 0.12),
    note(common?.sports_camp),
  );
  add(
    rows,
    'Школа',
    share(common?.primary_school, 0.3, 0.15),
    note(common?.primary_school),
  );

  const gross = (lots.area_ha * SOTKA) / lots.count;
  const raw = rows.reduce((sum, item) => sum + item.value, 0);
  const cap = raw > 2.5;
  const shared = Math.min(raw, 2.5);

  return {
    size: Math.max(gross - shared, 1),
    exact: false,
    count: lots.count,
    area_ha: lots.area_ha,
    gross,
    shared,
    cap,
    rows,
  };
}

export function getLotAverage(
  lots?: Lots,
  infra?: Infrastructure,
  common?: CommonSpaces,
): number | undefined {
  return getLotBreakdown(lots, infra, common)?.size;
}

export function normalizeSettlement<
  T extends {
    lots?: Lots;
    tariff: Tariff;
    infrastructure?: Infrastructure;
    common_spaces?: CommonSpaces;
  },
>(item: T): T {
  const lot = getLotAverage(item.lots, item.infrastructure, item.common_spaces);

  if (!lot) return item;

  const list = 'parts' in item.tariff ? item.tariff.parts : [item.tariff];

  return {
    ...item,
    tariff: {
      ...item.tariff,
      normalized_per_sotka_month: total(list, lot),
    },
  };
}

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

export const TelegramSchema = z
  .string()
  .trim()
  .regex(/^@?[A-Za-z0-9_]{5,32}$/)
  .transform((item) => item.replace(/^@/, ''));
export type Telegram = z.infer<typeof TelegramSchema>;

// Main Settlement schema
export const SettlementSchema = z
  .object({
    name: z.string().min(1),
    short_name: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    website: z.string().url(),
    telegram: TelegramSchema.optional(),
    management_company: ManagementCompanySchema.optional(),
    is_baseline: z.boolean().default(false),
    location: LocationSchema,
    tariff: TariffSchema,
    lots: LotsSchema.optional(),
    water_in_tariff: z.boolean().optional(),
    rabstvo: z.boolean().optional(),
    infrastructure: InfrastructureSchema.default({}),
    common_spaces: CommonSpacesSchema.default({}),
    service_model: ServiceModelSchema.default({}),
    sources: z.array(SourceSchema).min(1),
  })
  .superRefine((item, ctx) => {
    if (item.water_in_tariff && item.infrastructure.water !== 'yes') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['water_in_tariff'],
        message:
          'water_in_tariff can only be used when central water supply is confirmed',
      });
    }
  })
  .transform((item) => normalizeSettlement(item));
export type Settlement = z.infer<typeof SettlementSchema>;

// Stats type (computed, not from YAML)
export interface Stats {
  shelkovoTariff: number;
  medianTariff: number;
  peerMedianTariff: number;
  meanTariff: number;
  minTariff: number;
  maxTariff: number;
  shelkovoRank: number;
  totalSettlements: number;
  cheaperCount: number;
  moreExpensiveCount: number;
  shelkovoVsMedianPercent: number;
  shelkovoVsPeerMedianPercent: number;
  shelkovoVsMeanPercent: number;
}

// Comparison result type (computed)
export interface ComparisonResult {
  tariffDelta: number;
  tariffDeltaPercent: number;
  isCheaper: boolean;
}
