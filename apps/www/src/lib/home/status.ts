import type { StatusIncident } from '@/lib/status/schema';

import type {
  HomeStatusMaintenanceWindow,
  HomeStatusState,
} from './status.types';

declare global {
  interface Window {
    __shelkovoHomeStatusHydration?: boolean;
  }
}

const HOME_STATUS_LINK_SELECTOR = '[data-home-status-link]';
const HOME_STATUS_MAINTENANCE_WINDOWS_SELECTOR =
  '[data-home-status-maintenance-windows]';

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
  incidents: readonly Pick<
    StatusIncident,
    'kind' | 'started_at' | 'ended_at'
  >[],
  buildNow: number,
): readonly HomeStatusMaintenanceWindow[] =>
  incidents
    .flatMap((item): HomeStatusMaintenanceWindow[] => {
      if (item.kind !== 'maintenance' || item.ended_at === undefined) {
        return [];
      }

      const start = item.started_at.valueOf();
      const end = item.ended_at.valueOf();
      if (end <= buildNow) {
        return [];
      }

      return [
        {
          start,
          end,
        },
      ];
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

const isHomeStatusMaintenanceWindow = (
  value: unknown,
): value is HomeStatusMaintenanceWindow => {
  if (!(value instanceof Object) || Array.isArray(value)) {
    return false;
  }

  const { start, end } = value as {
    readonly start?: unknown;
    readonly end?: unknown;
  };

  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start < end
  );
};

const parseHomeStatusMaintenanceWindows = (
  source: string | undefined,
): readonly HomeStatusMaintenanceWindow[] => {
  if (source === undefined) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(source);

    return Array.isArray(parsed)
      ? parsed.filter(isHomeStatusMaintenanceWindow)
      : [];
  } catch {
    return [];
  }
};

const hasActiveMaintenanceWindow = (
  windows: readonly HomeStatusMaintenanceWindow[],
  now: number,
): boolean => windows.some((item) => item.start <= now && now < item.end);

const setHomeStatusState = (
  link: HTMLElement,
  state: HomeStatusState,
): void => {
  link.dataset.homeStatusState = state;
  link.setAttribute('aria-label', getHomeStatusAriaLabel(state));
};

export const hydrateHomeStatus = (
  root: ParentNode = document,
  now: number = Date.now(),
): void => {
  const link = root.querySelector(HOME_STATUS_LINK_SELECTOR);

  if (
    !(link instanceof HTMLElement) ||
    link.dataset.homeStatusState === 'red'
  ) {
    return;
  }

  const payload = root.querySelector(HOME_STATUS_MAINTENANCE_WINDOWS_SELECTOR);
  if (!(payload instanceof HTMLScriptElement)) {
    return;
  }

  const windows = parseHomeStatusMaintenanceWindows(
    payload.textContent ?? undefined,
  );
  if (hasActiveMaintenanceWindow(windows, now)) {
    setHomeStatusState(link, 'amber');
    return;
  }

  if (link.dataset.homeStatusState === 'amber' && windows.length > 0) {
    setHomeStatusState(link, 'green');
  }
};

export const installHomeStatusHydration = (
  options: { readonly now?: () => number } = {},
): void => {
  const hydrate = (): void =>
    hydrateHomeStatus(document, options.now?.() ?? Date.now());

  if (window.__shelkovoHomeStatusHydration) {
    hydrate();
    return;
  }

  window.__shelkovoHomeStatusHydration = true;
  hydrate();
  document.addEventListener('astro:after-swap', hydrate);
  document.addEventListener('astro:page-load', hydrate);
};
