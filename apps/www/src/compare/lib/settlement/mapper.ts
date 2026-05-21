import type {
  RawCommonSpaces,
  RawInfrastructure,
  RawManagementCompany,
  RawRoadType,
  RawSettlement,
  RawTariff,
  RawTariffUnit,
  RawVideoSurveillance,
} from './schema';
import type {
  CommonSpaces,
  Infrastructure,
  ManagementCompany,
  RoadType,
  Settlement,
  Tariff,
  TariffPart,
  TariffUnit,
  VideoSurveillance,
} from './types';

const mapTariffUnit = (unit: RawTariffUnit): TariffUnit => {
  if (unit === 'rub_per_sotka') return 'perSotka';
  if (unit === 'rub_per_lot') return 'perLot';
  if (unit === 'rub_fixed') return 'fixed';
  throw new Error(`Unsupported raw tariff unit: ${unit}`);
};

const mapRoadType = (road: RawRoadType): RoadType => {
  if (road === 'partial_asphalt') return 'partlyAsphalt';
  return road;
};

const mapVideoSurveillance = (
  value: RawVideoSurveillance,
): VideoSurveillance => {
  if (value === 'checkpoint_only') return 'checkpointOnly';
  return value;
};

const mapTariffPart = (tariff: {
  readonly value: number;
  readonly unit: RawTariffUnit;
  readonly period: TariffPart['period'];
  readonly note?: string;
}): TariffPart => ({
  value: tariff.value,
  unit: mapTariffUnit(tariff.unit),
  period: tariff.period,
  note: tariff.note,
});

const mapTariff = (tariff: RawTariff): Tariff => ({
  ...mapTariffPart(tariff),
  normalizedPerSotkaMonth: tariff.normalized_per_sotka_month,
  normalizedIsEstimate: tariff.normalized_is_estimate,
  parts: 'parts' in tariff ? tariff.parts.map(mapTariffPart) : undefined,
});

const mapManagementCompany = (
  company: RawManagementCompany | undefined,
): ManagementCompany | undefined => {
  if (!company) return undefined;
  if (typeof company === 'string') return { title: company };
  return company;
};

const mapInfrastructure = (item: RawInfrastructure): Infrastructure => ({
  roads: item.roads ? mapRoadType(item.roads) : undefined,
  sidewalks: item.sidewalks,
  lighting: item.lighting,
  gas: item.gas,
  water: item.water,
  sewage: item.sewage,
  drainage: item.drainage,
  checkpoints: item.checkpoints,
  security: item.security,
  fencing: item.fencing,
  videoSurveillance: item.video_surveillance
    ? mapVideoSurveillance(item.video_surveillance)
    : undefined,
  undergroundElectricity: item.underground_electricity,
  adminBuilding: item.admin_building,
  retailOrServices: item.retail_or_services,
});

const mapCommonSpaces = (item: RawCommonSpaces): CommonSpaces => ({
  playgrounds: item.playgrounds,
  sports: item.sports,
  pool: item.pool,
  fitnessClub: item.fitness_club,
  restaurant: item.restaurant,
  spaCenter: item.spa_center,
  walkingRoutes: item.walking_routes,
  waterAccess: item.water_access,
  beachZones: item.beach_zones,
  kidsClub: item.kids_club,
  sportsCamp: item.sports_camp,
  primarySchool: item.primary_school,
  clubInfrastructure: item.club_infrastructure,
  bbqZones: item.bbq_zones,
});

export const mapRawSettlement = (raw: RawSettlement): Settlement => ({
  name: raw.name,
  shortName: raw.short_name,
  slug: raw.slug,
  website: raw.website,
  telegram: raw.telegram,
  managementCompany: mapManagementCompany(raw.management_company),
  isBaseline: raw.is_baseline,
  location: {
    addressText: raw.location.address_text,
    lat: raw.location.lat,
    lng: raw.location.lng,
    mapUrl: raw.location.map_url,
    district: raw.location.district,
  },
  tariff: mapTariff(raw.tariff),
  lots: raw.lots
    ? {
        count: raw.lots.count,
        areaHa: raw.lots.area_ha,
        averageSotka: raw.lots.average_sotka,
        averageNote: raw.lots.average_note,
      }
    : undefined,
  waterInTariff: raw.water_in_tariff,
  rabstvo: raw.rabstvo,
  infrastructure: mapInfrastructure(raw.infrastructure),
  commonSpaces: mapCommonSpaces(raw.common_spaces),
  serviceModel: {
    garbageCollection: raw.service_model.garbage_collection,
    snowRemoval: raw.service_model.snow_removal,
    roadCleaning: raw.service_model.road_cleaning,
    landscaping: raw.service_model.landscaping,
    emergencyService: raw.service_model.emergency_service,
    dispatcher: raw.service_model.dispatcher,
  },
  sources: raw.sources.map((source) => ({
    title: source.title,
    url: source.url,
    type: source.type,
    dateChecked: source.date_checked,
    comment: source.comment,
  })),
});
