import { compareRuText } from '@/lib/locale';

import type { NewsListArticle, NewsTagPage } from './schema';

interface PublishedLike {
  readonly id: string;
  readonly published_at: Date;
}

export function compareArticlesPublishedDesc(
  a: PublishedLike,
  b: PublishedLike,
): number {
  const delta = b.published_at.valueOf() - a.published_at.valueOf();

  return delta || compareRuText(a.id, b.id);
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

  return compareRuText(a.label, b.label);
}

export const latestFirst = (
  items: readonly NewsListArticle[],
): readonly NewsListArticle[] =>
  items.slice().sort(compareArticlesPublishedDesc);
