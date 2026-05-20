import { extractFirstMarkdownText } from '@shelkovo/markdown';

import { createEntityMentionSourceRefs } from '../mentions';
import type { EntityMentionSourceRef } from '../mentions';
import type { NewsArticle } from './schema';

type NewsArticleMentionRefSource = Pick<
  NewsArticle,
  | 'id'
  | 'title'
  | 'url'
  | 'markdown_url'
  | 'body'
  | 'mentions'
  | 'published_iso'
  | 'published_at'
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
    source_section: 'news',
    source_kind: 'article',
    source_id: article.id,
    title: article.title,
    html_url: article.url,
    markdown_url: article.markdown_url,
    ...(summary ? { excerpt: summary } : {}),
    mentioned_at: article.published_iso,
    sort_key: article.published_at.valueOf(),
  });
};
