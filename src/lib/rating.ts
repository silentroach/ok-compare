import { calculateDistance } from './format';
import type {
  AvailabilityStatus,
  DrainageType,
  RoadType,
  Settlement,
  UndergroundElectricity,
  VideoSurveillance,
} from './schema';

export interface Rating {
  score: number;
  km: number;
  ring: number;
}

interface Group {
  raw?: number;
  fill: number;
}

const MOSCOW = {
  lat: 55.7558,
  lng: 37.6176,
};

// Rough MKAD sample points for an internal radius approximation.
const MKAD = [
  { lat: 55.9111, lng: 37.5424 },
  { lat: 55.8794, lng: 37.3911 },
  { lat: 55.8258, lng: 37.8428 },
  { lat: 55.6927, lng: 37.8424 },
  { lat: 55.5737, lng: 37.6789 },
  { lat: 55.6041, lng: 37.4572 },
  { lat: 55.7062, lng: 37.3718 },
  { lat: 55.8808, lng: 37.7531 },
];

export const MKAD_RADIUS = round(
  MKAD.reduce(
    (sum, item) =>
      sum + calculateDistance(MOSCOW.lat, MOSCOW.lng, item.lat, item.lng),
    0,
  ) / MKAD.length,
);

export const WATER_BONUS = 4;
export const RABSTVO_PENALTY = 15;

const AVAIL = {
  yes: 1,
  partial: 0.5,
  no: 0,
} as const satisfies Record<AvailabilityStatus, number>;

const ROAD = {
  asphalt: 1,
  partial_asphalt: 0.75,
  gravel: 0.35,
  dirt: 0,
} as const satisfies Record<RoadType, number>;

const DRAIN = {
  closed: 1,
  open: 0.6,
  none: 0,
} as const satisfies Record<DrainageType, number>;

const VIDEO = {
  full: 1,
  checkpoint_only: 0.55,
  none: 0,
} as const satisfies Record<VideoSurveillance, number>;

const WIRE = {
  full: 1,
  partial: 0.5,
  none: 0,
} as const satisfies Record<UndergroundElectricity, number>;

export function getKm(lat: number, lng: number): number {
  return calculateDistance(MOSCOW.lat, MOSCOW.lng, lat, lng);
}

export function getRing(lat: number, lng: number): number {
  return Math.max(getKm(lat, lng) - MKAD_RADIUS, 0);
}

function tune(item: Settlement): number {
  return (
    (item.water_in_tariff ? WATER_BONUS : 0) -
    (item.rabstvo ? RABSTVO_PENALTY : 0)
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function lerp(
  value: number,
  start: number,
  end: number,
  first: number,
  last: number,
): number {
  if (start === end) return last;
  const share = (value - start) / (end - start);
  return first + (last - first) * share;
}

function avail(value?: AvailabilityStatus): number | undefined {
  if (!value) return;
  return AVAIL[value];
}

function road(value?: RoadType): number | undefined {
  if (!value) return;
  return ROAD[value];
}

function drain(value?: DrainageType): number | undefined {
  if (!value) return;
  return DRAIN[value];
}

function video(value?: VideoSurveillance): number | undefined {
  if (!value) return;
  return VIDEO[value];
}

function wire(value?: UndergroundElectricity): number | undefined {
  if (!value) return;
  return WIRE[value];
}

function mean(list: Array<{ value?: number; weight: number }>): Group {
  const total = list.reduce((sum, item) => sum + item.weight, 0);
  const known = list.reduce(
    (sum, item) => sum + (item.value === undefined ? 0 : item.weight),
    0,
  );

  if (known === 0 || total === 0) {
    return { fill: 0 };
  }

  const sum = list.reduce(
    (acc, item) =>
      acc + (item.value === undefined ? 0 : item.value * item.weight),
    0,
  );

  return {
    raw: sum / known,
    fill: known / total,
  };
}

function infra(item: Settlement): Group {
  const info = item.infrastructure;

  return mean([
    { value: road(info.roads), weight: 1 },
    { value: avail(info.sidewalks), weight: 0.35 },
    { value: avail(info.lighting), weight: 0.5 },
    { value: avail(info.gas), weight: 0.9 },
    { value: avail(info.water), weight: 1 },
    { value: avail(info.sewage), weight: 0.95 },
    { value: drain(info.drainage), weight: 0.45 },
    { value: avail(info.checkpoints), weight: 0.6 },
    { value: avail(info.security), weight: 0.95 },
    { value: avail(info.fencing), weight: 0.35 },
    { value: video(info.video_surveillance), weight: 0.75 },
    { value: wire(info.underground_electricity), weight: 0.35 },
    { value: avail(info.admin_building), weight: 0.25 },
    { value: avail(info.retail_or_services), weight: 0.55 },
  ]);
}

function spaces(item: Settlement): Group {
  const info = item.common_spaces;

  return mean([
    { value: avail(info.club_infrastructure), weight: 0.6 },
    { value: avail(info.playgrounds), weight: 0.9 },
    { value: avail(info.sports), weight: 0.8 },
    { value: avail(info.walking_routes), weight: 0.8 },
    { value: avail(info.water_access), weight: 0.6 },
    { value: avail(info.beach_zones), weight: 0.35 },
    { value: avail(info.bbq_zones), weight: 0.25 },
    { value: avail(info.pool), weight: 0.45 },
    { value: avail(info.fitness_club), weight: 0.4 },
    { value: avail(info.restaurant), weight: 0.35 },
    { value: avail(info.spa_center), weight: 0.2 },
    { value: avail(info.kids_club), weight: 0.3 },
    { value: avail(info.sports_camp), weight: 0.15 },
    { value: avail(info.primary_school), weight: 0.15 },
  ]);
}

function service(item: Settlement): Group {
  const info = item.service_model;

  return mean([
    { value: avail(info.garbage_collection), weight: 1 },
    { value: avail(info.snow_removal), weight: 0.9 },
    { value: avail(info.road_cleaning), weight: 0.8 },
    { value: avail(info.landscaping), weight: 0.6 },
    { value: avail(info.emergency_service), weight: 0.6 },
    { value: avail(info.dispatcher), weight: 0.4 },
  ]);
}

function prior(
  settlements: Settlement[],
  pick: (item: Settlement) => Group,
): number {
  const list = settlements.map(pick).filter((item) => item.raw !== undefined);
  if (list.length === 0) return 0.5;

  const total = list.reduce((sum, item) => sum + item.fill, 0);
  if (total === 0) return 0.5;

  return (
    list.reduce((sum, item) => sum + (item.raw ?? 0) * item.fill, 0) / total
  );
}

function mix(item: Group, avg: number): number {
  if (item.raw === undefined) return avg;
  return item.raw * item.fill + avg * (1 - item.fill);
}

function near(km: number): number {
  const ring = Math.max(km - MKAD_RADIUS, 0);

  if (ring <= 20) return 1;
  if (ring <= 40) return lerp(ring, 20, 40, 1, 0.82);
  if (ring <= 60) return lerp(ring, 40, 60, 0.82, 0.58);
  if (ring <= 80) return lerp(ring, 60, 80, 0.58, 0.32);
  if (ring <= 100) return lerp(ring, 80, 100, 0.32, 0.12);
  return 0.12;
}

/**
 * Build a stable quality rating for each settlement.
 * Tariff is intentionally excluded from the score.
 */
export function buildRatings(settlements: Settlement[]): Map<string, Rating> {
  const avg = {
    infra: prior(settlements, infra),
    spaces: prior(settlements, spaces),
    service: prior(settlements, service),
  };

  return new Map(
    settlements.map((item) => {
      const km = getKm(item.location.lat, item.location.lng);
      const ring = getRing(item.location.lat, item.location.lng);
      const base =
        100 *
        (mix(infra(item), avg.infra) * 0.5 +
          mix(spaces(item), avg.spaces) * 0.25 +
          mix(service(item), avg.service) * 0.1 +
          near(km) * 0.15);
      const score = Math.max(0, Math.min(base + tune(item), 100));

      return [
        item.slug,
        {
          score: round(score),
          km: round(km),
          ring: round(ring),
        },
      ];
    }),
  );
}
