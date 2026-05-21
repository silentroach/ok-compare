import { isAbsoluteUrl } from '@shelkovo/url';

import { AREAS, type Area } from '../areas';
import type { NewsDateParts, NewsTimestamp } from '../news/date';

export { isAbsoluteUrl };
export type {
  NewsDateParts as StatusDateParts,
  NewsTimestamp as StatusTimestamp,
};
export {
  normalizeNewsTimestampInput as normalizeStatusTimestampInput,
  parseNewsTimestamp as parseStatusTimestamp,
  parseNewsTimestampInput as parseStatusTimestampInput,
} from '../news/date';

export const STATUS_AREAS = AREAS;
export type StatusArea = Area;

export const STATUS_SERVICES = [
  'electricity',
  'water',
  'internet',
  'dam',
] as const;
export type StatusService = (typeof STATUS_SERVICES)[number];

export const STATUS_KINDS = ['incident', 'maintenance'] as const;
export type StatusKind = (typeof STATUS_KINDS)[number];

export const STATUS_SERVICE_STATES = ['green', 'amber', 'red'] as const;
export type StatusServiceState = (typeof STATUS_SERVICE_STATES)[number];
