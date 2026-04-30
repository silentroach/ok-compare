import { formatDate, formatMonth } from '@shelkovo/format';
import type { NewsArea, NewsAuthor } from './schema';

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
