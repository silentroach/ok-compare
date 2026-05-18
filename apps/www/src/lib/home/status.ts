import type { StatusIncident } from '@/lib/status/schema';

import type {
  HomeStatusMaintenanceWindow,
  HomeStatusState,
} from './status.types';

export const HOME_STATUS_LABELS = {
  green: 'все сервисы работают',
  amber: 'идут плановые работы',
  red: 'есть активные проблемы',
} as const satisfies Record<HomeStatusState, string>;

export const getHomeStatusAriaLabel = (state: HomeStatusState): string =>
  `Статус: ${HOME_STATUS_LABELS[state]}`;

const isActiveAt = (
  item: Pick<StatusIncident, 'started_at' | 'ended_at'>,
  now: number,
): boolean =>
  item.started_at.valueOf() <= now &&
  (item.ended_at === undefined || now < item.ended_at.valueOf());

export const getHomeStatusState = (
  incidents: readonly StatusIncident[],
  now: number,
): HomeStatusState => {
  if (
    incidents.some((item) => item.kind === 'incident' && isActiveAt(item, now))
  ) {
    return 'red';
  }

  return incidents.some(
    (item) => item.kind === 'maintenance' && isActiveAt(item, now),
  )
    ? 'amber'
    : 'green';
};

export const getHomeStatusMaintenanceWindows = (
  incidents: readonly StatusIncident[],
  buildNow: number,
): readonly HomeStatusMaintenanceWindow[] =>
  incidents
    .flatMap((item): HomeStatusMaintenanceWindow[] => {
      if (item.kind !== 'maintenance' || item.ended_at === undefined) {
        return [];
      }

      const start = item.started_at.valueOf();
      if (start <= buildNow) {
        return [];
      }

      return [
        {
          start,
          end: item.ended_at.valueOf(),
        },
      ];
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);
