import { extractFirstMarkdownText } from '@shelkovo/markdown';

import { createEntityMentionSourceRefs } from '../mentions';
import type { EntityMentionSourceRef } from '../mentions';
import type { NewsArticle } from './types';

type NewsArticleMentionRefSource = Pick<
  NewsArticle,
  | 'id'
  | 'title'
  | 'url'
  | 'markdownUrl'
  | 'body'
  | 'mentions'
  | 'publishedIso'
  | 'publishedAt'
>;

const SPACE = /\s+/gu;

const excerpt = (markdown: string): string | undefined => {
  const first = extractFirstMarkdownText(markdown);

  return first ? first.replace(SPACE, ' ').trim() : undefined;
};

export const createNewsArticleMentionRefs = (
  article: NewsArticleMentionRefSource,
): readonly EntityMentionSourceRef[] => {
  const summary = excerpt(article.body);

  return createEntityMentionSourceRefs(article.mentions, {
    sourceSection: 'news',
    sourceKind: 'article',
    sourceId: article.id,
    title: article.title,
    htmlUrl: article.url,
    markdownUrl: article.markdownUrl,
    ...(summary ? { excerpt: summary } : {}),
    mentionedAt: article.publishedIso,
    sortKey: article.publishedAt.valueOf(),
  });
};
