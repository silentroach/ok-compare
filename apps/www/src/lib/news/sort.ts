import type { NewsAddendum, NewsListArticle, NewsTagPage } from './schema';

interface PublishedLike {
  readonly id: string;
  readonly published_at: Date;
}

const byText = (a: string, b: string): number => a.localeCompare(b, 'ru');

export function compareArticlesPublishedDesc(
  a: PublishedLike,
  b: PublishedLike,
): number {
  const delta = b.published_at.valueOf() - a.published_at.valueOf();

  return delta || byText(a.id, b.id);
}

export function compareAddendaPublishedAsc(
  a: Pick<NewsAddendum, 'published_at' | 'title' | 'published_iso'>,
  b: Pick<NewsAddendum, 'published_at' | 'title' | 'published_iso'>,
): number {
  const delta = a.published_at.valueOf() - b.published_at.valueOf();

  if (delta) {
    return delta;
  }

  const title = byText(a.title ?? '', b.title ?? '');
  return title || byText(a.published_iso, b.published_iso);
}

export function compareTagPages(a: NewsTagPage, b: NewsTagPage): number {
  const count = b.count - a.count;

  if (count) {
    return count;
  }

  const recent =
    (b.latest[0]?.published_at.valueOf() ?? 0) -
    (a.latest[0]?.published_at.valueOf() ?? 0);

  if (recent) {
    return recent;
  }

  return byText(a.label, b.label);
}

export const latestFirst = (
  items: readonly NewsListArticle[],
): readonly NewsListArticle[] =>
  items.slice().sort(compareArticlesPublishedDesc);
