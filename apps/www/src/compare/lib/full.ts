import { calculateDistance } from './format';
import {
  toPublicComparisons,
  toPublicStats,
  type PublicComparison,
  type PublicComparisons,
  type PublicStats,
} from './public-dto';
import { getKm, getRing, type Rating } from './rating';
import type { Settlement } from './settlement/types';

export interface FullDistance {
  moscow_km: number;
  mkad_km: number;
  shelkovo_km: number;
}

export interface FullSettlement {
  name: string;
  short_name: string;
  slug: string;
  website: string;
  telegram?: string;
  management_company?: string | { title: string; url: string };
  is_baseline: boolean;
  location: {
    address_text: string;
    lat: number;
    lng: number;
    map_url?: string;
    district: string;
  };
  tariff: {
    value: number;
    unit: string;
    period: string;
    normalized_per_sotka_month: number;
    normalized_is_estimate: boolean;
    note?: string;
    parts?: readonly {
      value: number;
      unit: string;
      period: string;
      note?: string;
    }[];
  };
  lots?: {
    count?: number;
    area_ha?: number;
    average_sotka?: number;
    average_note?: string;
  };
  water_in_tariff?: boolean;
  rabstvo?: boolean;
  infrastructure: Record<string, string>;
  common_spaces: Record<string, string>;
  service_model: Record<string, string>;
  rating: number;
  distance: FullDistance;
}

export interface FullPayload {
  settlements: FullSettlement[];
  comparisons: PublicComparisons;
  stats: PublicStats;
}

export interface FullPayloadInput {
  readonly settlements: Settlement[];
  readonly stats: PublicStats;
  readonly comparisons: ReadonlyMap<string, PublicComparison>;
  readonly ratings: Map<string, Rating>;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

const tariffUnit = (unit: Settlement['tariff']['unit']): string => {
  if (unit === 'perSotka') return 'rub_per_sotka';
  if (unit === 'perLot') return 'rub_per_lot';
  return 'rub_fixed';
};

const road = (
  value: Settlement['infrastructure']['roads'],
): string | undefined => {
  if (value === 'partlyAsphalt') return 'partial_asphalt';
  return value;
};

const video = (
  value: Settlement['infrastructure']['videoSurveillance'],
): string | undefined => {
  if (value === 'checkpointOnly') return 'checkpoint_only';
  return value;
};

export function toFull(
  settlements: Settlement[],
  ratings: Map<string, Rating>,
): FullSettlement[] {
  const base = settlements.find((item) => item.isBaseline);

  if (!base) {
    throw new Error('Baseline settlement (Shelkovo) not found');
  }

  return settlements.map((item) => ({
    name: item.name,
    short_name: item.shortName,
    slug: item.slug,
    website: item.website,
    ...(item.telegram ? { telegram: item.telegram } : {}),
    ...(item.managementCompany
      ? {
          management_company: item.managementCompany.url
            ? {
                title: item.managementCompany.title,
                url: item.managementCompany.url,
              }
            : item.managementCompany.title,
        }
      : {}),
    is_baseline: item.isBaseline,
    location: {
      address_text: item.location.addressText,
      lat: item.location.lat,
      lng: item.location.lng,
      ...(item.location.mapUrl ? { map_url: item.location.mapUrl } : {}),
      district: item.location.district,
    },
    tariff: {
      value: item.tariff.value,
      unit: tariffUnit(item.tariff.unit),
      period: item.tariff.period,
      normalized_per_sotka_month: item.tariff.normalizedPerSotkaMonth,
      normalized_is_estimate: item.tariff.normalizedIsEstimate,
      ...(item.tariff.note ? { note: item.tariff.note } : {}),
      ...(item.tariff.parts
        ? {
            parts: item.tariff.parts.map((part) => ({
              value: part.value,
              unit: tariffUnit(part.unit),
              period: part.period,
              ...(part.note ? { note: part.note } : {}),
            })),
          }
        : {}),
    },
    ...(item.lots
      ? {
          lots: {
            ...(item.lots.count !== undefined
              ? { count: item.lots.count }
              : {}),
            ...(item.lots.areaHa !== undefined
              ? { area_ha: item.lots.areaHa }
              : {}),
            ...(item.lots.averageSotka !== undefined
              ? { average_sotka: item.lots.averageSotka }
              : {}),
            ...(item.lots.averageNote
              ? { average_note: item.lots.averageNote }
              : {}),
          },
        }
      : {}),
    ...(item.waterInTariff !== undefined
      ? { water_in_tariff: item.waterInTariff }
      : {}),
    ...(item.rabstvo !== undefined ? { rabstvo: item.rabstvo } : {}),
    infrastructure: {
      ...(item.infrastructure.roads
        ? { roads: road(item.infrastructure.roads) }
        : {}),
      ...(item.infrastructure.sidewalks
        ? { sidewalks: item.infrastructure.sidewalks }
        : {}),
      ...(item.infrastructure.lighting
        ? { lighting: item.infrastructure.lighting }
        : {}),
      ...(item.infrastructure.gas ? { gas: item.infrastructure.gas } : {}),
      ...(item.infrastructure.water
        ? { water: item.infrastructure.water }
        : {}),
      ...(item.infrastructure.sewage
        ? { sewage: item.infrastructure.sewage }
        : {}),
      ...(item.infrastructure.drainage
        ? { drainage: item.infrastructure.drainage }
        : {}),
      ...(item.infrastructure.checkpoints
        ? { checkpoints: item.infrastructure.checkpoints }
        : {}),
      ...(item.infrastructure.security
        ? { security: item.infrastructure.security }
        : {}),
      ...(item.infrastructure.fencing
        ? { fencing: item.infrastructure.fencing }
        : {}),
      ...(item.infrastructure.videoSurveillance
        ? { video_surveillance: video(item.infrastructure.videoSurveillance) }
        : {}),
      ...(item.infrastructure.undergroundElectricity
        ? {
            underground_electricity: item.infrastructure.undergroundElectricity,
          }
        : {}),
      ...(item.infrastructure.adminBuilding
        ? { admin_building: item.infrastructure.adminBuilding }
        : {}),
      ...(item.infrastructure.retailOrServices
        ? { retail_or_services: item.infrastructure.retailOrServices }
        : {}),
    },
    common_spaces: {
      ...(item.commonSpaces.playgrounds
        ? { playgrounds: item.commonSpaces.playgrounds }
        : {}),
      ...(item.commonSpaces.sports ? { sports: item.commonSpaces.sports } : {}),
      ...(item.commonSpaces.pool ? { pool: item.commonSpaces.pool } : {}),
      ...(item.commonSpaces.fitnessClub
        ? { fitness_club: item.commonSpaces.fitnessClub }
        : {}),
      ...(item.commonSpaces.restaurant
        ? { restaurant: item.commonSpaces.restaurant }
        : {}),
      ...(item.commonSpaces.spaCenter
        ? { spa_center: item.commonSpaces.spaCenter }
        : {}),
      ...(item.commonSpaces.walkingRoutes
        ? { walking_routes: item.commonSpaces.walkingRoutes }
        : {}),
      ...(item.commonSpaces.waterAccess
        ? { water_access: item.commonSpaces.waterAccess }
        : {}),
      ...(item.commonSpaces.beachZones
        ? { beach_zones: item.commonSpaces.beachZones }
        : {}),
      ...(item.commonSpaces.kidsClub
        ? { kids_club: item.commonSpaces.kidsClub }
        : {}),
      ...(item.commonSpaces.sportsCamp
        ? { sports_camp: item.commonSpaces.sportsCamp }
        : {}),
      ...(item.commonSpaces.primarySchool
        ? { primary_school: item.commonSpaces.primarySchool }
        : {}),
      ...(item.commonSpaces.clubInfrastructure
        ? { club_infrastructure: item.commonSpaces.clubInfrastructure }
        : {}),
      ...(item.commonSpaces.bbqZones
        ? { bbq_zones: item.commonSpaces.bbqZones }
        : {}),
    },
    service_model: {
      ...(item.serviceModel.garbageCollection
        ? { garbage_collection: item.serviceModel.garbageCollection }
        : {}),
      ...(item.serviceModel.snowRemoval
        ? { snow_removal: item.serviceModel.snowRemoval }
        : {}),
      ...(item.serviceModel.roadCleaning
        ? { road_cleaning: item.serviceModel.roadCleaning }
        : {}),
      ...(item.serviceModel.landscaping
        ? { landscaping: item.serviceModel.landscaping }
        : {}),
      ...(item.serviceModel.emergencyService
        ? { emergency_service: item.serviceModel.emergencyService }
        : {}),
      ...(item.serviceModel.dispatcher
        ? { dispatcher: item.serviceModel.dispatcher }
        : {}),
    },
    rating: ratings.get(item.slug)?.score ?? 0,
    distance: {
      moscow_km:
        ratings.get(item.slug)?.km ??
        round(getKm(item.location.lat, item.location.lng)),
      mkad_km:
        ratings.get(item.slug)?.ring ??
        round(getRing(item.location.lat, item.location.lng)),
      shelkovo_km: item.isBaseline
        ? 0
        : round(
            calculateDistance(
              base.location.lat,
              base.location.lng,
              item.location.lat,
              item.location.lng,
            ),
          ),
    },
  }));
}

export const toFullPayload = ({
  settlements,
  stats,
  comparisons,
  ratings,
}: FullPayloadInput): FullPayload => ({
  settlements: toFull(settlements, ratings),
  stats: toPublicStats(stats),
  comparisons: toPublicComparisons(comparisons),
});
