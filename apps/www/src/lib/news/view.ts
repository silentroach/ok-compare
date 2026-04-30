import { formatDate, formatMonth } from '@shelkovo/format';
import type { NewsArea, NewsAuthor } from './schema';

const AREA_LABELS: Record<NewsArea, string> = {
  river: 'Шелково Ривер',
  forest: 'Шелково Форест',
  park: 'Шелково Парк',
  village: 'Шелково Вилладж',
};

export const NEWS_PROSE =
  'ui-copy max-w-none text-foreground/95 ' +
  '[&_p]:my-4 [&_a]:font-medium [&_a]:text-[color:var(--color-primary)] [&_a:hover]:text-[color:var(--color-primary-hover)] ' +
  '[&_strong]:font-semibold [&_em]:italic ' +
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 ' +
  '[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground ' +
  '[&_hr]:my-8 [&_hr]:border-border ' +
  '[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground ' +
  '[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground ' +
  '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_thead_th]:border-b [&_thead_th]:border-border [&_thead_th]:px-3 [&_thead_th]:py-2 [&_thead_th]:text-left [&_thead_th]:text-xs [&_thead_th]:font-semibold [&_thead_th]:uppercase [&_thead_th]:tracking-[0.18em] [&_tbody_td]:border-b [&_tbody_td]:border-border [&_tbody_td]:px-3 [&_tbody_td]:py-2 ' +
  '[&_img]:border [&_img]:border-border [&_img]:bg-[color:var(--color-surface-muted)] ' +
  '[&_code]:bg-[color:var(--color-surface-muted)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.95em] ' +
  '[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-[color:var(--color-surface-muted)] [&_pre]:p-4 [&_pre]:text-sm ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0';

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value[0].toUpperCase() + value.slice(1);
}

export function formatNewsDate(value: string): string {
  return formatDate(value);
}

export function formatNewsMonth(
  year: number,
  month: number,
  opts?: {
    readonly capitalize?: boolean;
    readonly includeYear?: boolean;
  },
): string {
  const label = formatMonth(year, month, {
    includeYear: opts?.includeYear,
  });
  return opts?.capitalize ? capitalize(label) : label;
}

export function formatNewsArea(area: NewsArea): string {
  return AREA_LABELS[area];
}

export function formatNewsAuthor(
  author: Pick<NewsAuthor, 'name' | 'short_name'>,
  opts?: {
    readonly short?: boolean;
  },
): string {
  return opts?.short === false
    ? author.name
    : (author.short_name ?? author.name);
}
