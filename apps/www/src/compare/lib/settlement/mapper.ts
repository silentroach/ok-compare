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
  ...(tariff.note ? { note: tariff.note } : {}),
});

const mapTariff = (tariff: RawTariff): Tariff => ({
  ...mapTariffPart(tariff),
  normalizedPerSotkaMonth: tariff.normalized_per_sotka_month,
  normalizedIsEstimate: tariff.normalized_is_estimate,
  ...('parts' in tariff ? { parts: tariff.parts.map(mapTariffPart) } : {}),
});

const mapManagementCompany = (
  company: RawManagementCompany | undefined,
): ManagementCompany | undefined => {
  if (!company) return undefined;
  if (typeof company === 'string') return { title: company };
  return company;
};

const mapInfrastructure = (item: RawInfrastructure): Infrastructure => ({
  ...(item.roads ? { roads: mapRoadType(item.roads) } : {}),
  ...(item.sidewalks ? { sidewalks: item.sidewalks } : {}),
  ...(item.lighting ? { lighting: item.lighting } : {}),
  ...(item.gas ? { gas: item.gas } : {}),
  ...(item.water ? { water: item.water } : {}),
  ...(item.sewage ? { sewage: item.sewage } : {}),
  ...(item.drainage ? { drainage: item.drainage } : {}),
  ...(item.checkpoints ? { checkpoints: item.checkpoints } : {}),
  ...(item.security ? { security: item.security } : {}),
  ...(item.fencing ? { fencing: item.fencing } : {}),
  ...(item.video_surveillance
    ? { videoSurveillance: mapVideoSurveillance(item.video_surveillance) }
    : {}),
  ...(item.underground_electricity
    ? { undergroundElectricity: item.underground_electricity }
    : {}),
  ...(item.admin_building ? { adminBuilding: item.admin_building } : {}),
  ...(item.retail_or_services
    ? { retailOrServices: item.retail_or_services }
    : {}),
});

const mapCommonSpaces = (item: RawCommonSpaces): CommonSpaces => ({
  ...(item.playgrounds ? { playgrounds: item.playgrounds } : {}),
  ...(item.sports ? { sports: item.sports } : {}),
  ...(item.pool ? { pool: item.pool } : {}),
  ...(item.fitness_club ? { fitnessClub: item.fitness_club } : {}),
  ...(item.restaurant ? { restaurant: item.restaurant } : {}),
  ...(item.spa_center ? { spaCenter: item.spa_center } : {}),
  ...(item.walking_routes ? { walkingRoutes: item.walking_routes } : {}),
  ...(item.water_access ? { waterAccess: item.water_access } : {}),
  ...(item.beach_zones ? { beachZones: item.beach_zones } : {}),
  ...(item.kids_club ? { kidsClub: item.kids_club } : {}),
  ...(item.sports_camp ? { sportsCamp: item.sports_camp } : {}),
  ...(item.primary_school ? { primarySchool: item.primary_school } : {}),
  ...(item.club_infrastructure
    ? { clubInfrastructure: item.club_infrastructure }
    : {}),
  ...(item.bbq_zones ? { bbqZones: item.bbq_zones } : {}),
});

export const mapRawSettlement = (raw: RawSettlement): Settlement => ({
  name: raw.name,
  shortName: raw.short_name,
  slug: raw.slug,
  website: raw.website,
  ...(raw.telegram ? { telegram: raw.telegram } : {}),
  ...(raw.management_company
    ? { managementCompany: mapManagementCompany(raw.management_company) }
    : {}),
  isBaseline: raw.is_baseline,
  location: {
    addressText: raw.location.address_text,
    lat: raw.location.lat,
    lng: raw.location.lng,
    ...(raw.location.map_url ? { mapUrl: raw.location.map_url } : {}),
    district: raw.location.district,
  },
  tariff: mapTariff(raw.tariff),
  ...(raw.lots
    ? {
        lots: {
          ...(raw.lots.count !== undefined ? { count: raw.lots.count } : {}),
          ...(raw.lots.area_ha !== undefined
            ? { areaHa: raw.lots.area_ha }
            : {}),
          ...(raw.lots.average_sotka !== undefined
            ? { averageSotka: raw.lots.average_sotka }
            : {}),
          ...(raw.lots.average_note
            ? { averageNote: raw.lots.average_note }
            : {}),
        },
      }
    : {}),
  ...(raw.water_in_tariff !== undefined
    ? { waterInTariff: raw.water_in_tariff }
    : {}),
  ...(raw.rabstvo !== undefined ? { rabstvo: raw.rabstvo } : {}),
  infrastructure: mapInfrastructure(raw.infrastructure),
  commonSpaces: mapCommonSpaces(raw.common_spaces),
  serviceModel: {
    ...(raw.service_model.garbage_collection
      ? { garbageCollection: raw.service_model.garbage_collection }
      : {}),
    ...(raw.service_model.snow_removal
      ? { snowRemoval: raw.service_model.snow_removal }
      : {}),
    ...(raw.service_model.road_cleaning
      ? { roadCleaning: raw.service_model.road_cleaning }
      : {}),
    ...(raw.service_model.landscaping
      ? { landscaping: raw.service_model.landscaping }
      : {}),
    ...(raw.service_model.emergency_service
      ? { emergencyService: raw.service_model.emergency_service }
      : {}),
    ...(raw.service_model.dispatcher
      ? { dispatcher: raw.service_model.dispatcher }
      : {}),
  },
  sources: raw.sources.map((source) => ({
    title: source.title,
    url: source.url,
    type: source.type,
    dateChecked: source.date_checked,
    comment: source.comment,
  })),
});
