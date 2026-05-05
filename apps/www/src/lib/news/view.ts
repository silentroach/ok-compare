import { dateTimeFromISO, formatDate, formatMonth } from '@shelkovo/format';
import type { NewsArea, NewsAuthor, NewsEvent } from './schema';

const AREA_LABELS: Record<NewsArea, string> = {
  river: 'Шелково Ривер',
  forest: 'Шелково Форест',
  park: 'Шелково Парк',
  village: 'Шелково Вилладж',
};

export const NEWS_PROSE = 'ui-prose';

const capitalize = (value: string): string => {
  if (!value) {
    return value;
  }

  return value[0].toUpperCase() + value.slice(1);
};

const formatNewsCalendarDate = (iso: string): string =>
  dateTimeFromISO(iso).toFormat('d MMMM yyyy');

const formatNewsTime = (iso: string): string =>
  dateTimeFromISO(iso).toFormat('HH:mm');

const isSameNewsDay = (startIso: string, endIso: string): boolean =>
  dateTimeFromISO(startIso).hasSame(dateTimeFromISO(endIso), 'day');

export const formatNewsDate = (value: string): string => formatDate(value);

export const formatNewsMonth = (
  year: number,
  month: number,
  opts?: {
    readonly capitalize?: boolean;
    readonly includeYear?: boolean;
  },
): string => {
  const label = formatMonth(year, month, {
    includeYear: opts?.includeYear,
  });

  return opts?.capitalize ? capitalize(label) : label;
};

export const formatNewsArea = (area: NewsArea): string => AREA_LABELS[area];

export const formatNewsAuthor = (
  author: Pick<NewsAuthor, 'name' | 'short_name'>,
  opts?: {
    readonly short?: boolean;
  },
): string =>
  opts?.short === false ? author.name : (author.short_name ?? author.name);

export const formatNewsDateTime = (iso: string, time?: string): string =>
  `${formatNewsCalendarDate(iso)}, ${time ?? formatNewsTime(iso)}`;

export const formatNewsEventRange = (
  event: Pick<
    NewsEvent,
    'starts_iso' | 'starts_time' | 'ends_iso' | 'ends_time'
  >,
): string => {
  if (!event.ends_iso || !event.ends_time) {
    return formatNewsDateTime(event.starts_iso, event.starts_time);
  }

  if (isSameNewsDay(event.starts_iso, event.ends_iso)) {
    return `${formatNewsCalendarDate(event.starts_iso)}, ${event.starts_time}-${event.ends_time}`;
  }

  return `${formatNewsDateTime(event.starts_iso, event.starts_time)} - ${formatNewsDateTime(event.ends_iso, event.ends_time)}`;
};

export const buildNewsEventMapUrl = (
  event: Pick<NewsEvent, 'coordinates' | 'location'>,
): string | undefined => {
  if (event.coordinates) {
    const point = `${event.coordinates.lng},${event.coordinates.lat}`;

    return `https://yandex.ru/maps/?pt=${point}&z=16&l=map`;
  }

  if (event.location) {
    const query = encodeURIComponent(event.location);

    return `https://yandex.ru/maps/?text=${query}&z=16&l=map`;
  }

  return undefined;
};

export const buildNewsEventMapEmbedUrl = (
  event: Pick<NewsEvent, 'coordinates'>,
): string | undefined => {
  if (!event.coordinates) {
    return undefined;
  }

  const point = `${event.coordinates.lng},${event.coordinates.lat}`;
  const params = new URLSearchParams({
    ll: point,
    z: '16',
    l: 'map',
  });

  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
};
