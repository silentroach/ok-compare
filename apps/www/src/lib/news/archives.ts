import type {
  NewsArchives,
  NewsListArticle,
  NewsMonthArchive,
  NewsYearArchive,
} from './schema';
import { monthMarkdownUrl, monthUrl, yearMarkdownUrl, yearUrl } from './routes';
import { latestFirst } from './sort';

interface YearBucket {
  readonly months: Map<number, NewsListArticle[]>;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function newsMonthKey(year: number, month: number): string {
  return `${year}/${pad(month)}`;
}

export function buildArchives(items: readonly NewsListArticle[]): NewsArchives {
  const years = new Map<number, YearBucket>();

  for (const item of items) {
    const year = years.get(item.year) ?? {
      months: new Map<number, NewsListArticle[]>(),
    };
    const month = year.months.get(item.month) ?? [];

    month.push(item);
    year.months.set(item.month, month);
    years.set(item.year, year);
  }

  const byYear = new Map<number, NewsYearArchive>();
  const byMonth = new Map<string, NewsMonthArchive>();
  const list = Array.from(years.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, bucket]) => {
      const months = Array.from(bucket.months.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([month, articles]) => {
          const item: NewsMonthArchive = {
            id: newsMonthKey(year, month),
            year,
            month,
            url: monthUrl(year, month),
            markdown_url: monthMarkdownUrl(year, month),
            count: articles.length,
            articles: latestFirst(articles),
          };

          byMonth.set(item.id, item);
          return item;
        });
      const item: NewsYearArchive = {
        year,
        url: yearUrl(year),
        markdown_url: yearMarkdownUrl(year),
        count: months.reduce((sum, month) => sum + month.count, 0),
        months,
      };

      byYear.set(year, item);
      return item;
    });

  return {
    years: list,
    by_year: byYear,
    by_month: byMonth,
  };
}
