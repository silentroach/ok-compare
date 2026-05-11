import dist from '@turf/distance';
import SunCalc from 'suncalc';

import type { CivilTwilight, Coordinates } from './types';

export type { CivilTwilight, Coordinates } from './types';

/**
 * Calculates distance between two coordinates in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return dist([lng1, lat1], [lng2, lat2], { units: 'kilometers' });
}

export const getCivilTwilight = (
  date: Date,
  coordinates: Coordinates,
): CivilTwilight => {
  const times = SunCalc.getTimes(date, coordinates.lat, coordinates.lng);

  return {
    dawn: times.dawn,
    dusk: times.dusk,
  };
};

export const isCivilDaylight = (
  date: Date,
  coordinates: Coordinates,
): boolean => {
  const { dawn, dusk } = getCivilTwilight(date, coordinates);
  const time = date.getTime();

  return time >= dawn.getTime() && time <= dusk.getTime();
};
