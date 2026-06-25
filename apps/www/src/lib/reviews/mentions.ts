import { extractFirstMarkdownText } from '@shelkovo/markdown';

import { createEntityMentionSourceRefs } from '@/lib/mentions';
import type { EntityMentionSourceRef } from '@/lib/mentions';

import { formatReviewTitle } from './view';
import type { Review } from './types';

type ReviewMentionRefSource = Pick<
  Review,
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

  if (!first) {
    return;
  }

  return first.replace(SPACE, ' ').trim();
};

export const createReviewMentionRefs = (
  review: ReviewMentionRefSource,
): readonly EntityMentionSourceRef[] =>
  createEntityMentionSourceRefs(review.mentions, {
    source: {
      section: 'reviews',
      kind: 'review',
      id: review.id,
    },
    title: formatReviewTitle(review),
    htmlUrl: review.url,
    markdownUrl: review.markdownUrl,
    excerpt: excerpt(review.body),
    mentionedAt: review.publishedAt.toISOString(),
    sortKey: review.publishedAt.valueOf(),
  });
