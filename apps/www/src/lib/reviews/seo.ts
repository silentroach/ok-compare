import { extractFirstMarkdownText } from '@shelkovo/markdown';
import type { SchemaDoc } from '@shelkovo/seo';

import { absoluteUrl } from '@/lib/site';

import { REVIEW_AUTHOR_FALLBACK } from './schema';
import type { Review } from './types';
import { formatReviewTitle } from './view';

const CONTEXT = 'https://schema.org';
const LANG = 'ru-RU';

interface ReviewsCollectionPageInput {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly items: readonly ListEntry[];
  readonly breadcrumbs?: readonly BreadcrumbLink[];
}

interface BreadcrumbLink {
  readonly name: string;
  readonly url: string;
}

interface ListEntry {
  readonly name: string;
  readonly url: string;
}

interface ReviewPageInput {
  readonly review: Review;
  readonly breadcrumbs?: readonly BreadcrumbLink[];
}

const breadcrumbSchema = (items: readonly BreadcrumbLink[]): SchemaDoc => ({
  '@context': CONTEXT,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});

const itemListSchema = (
  url: string,
  items: readonly ListEntry[],
): SchemaDoc => ({
  '@context': CONTEXT,
  '@type': 'ItemList',
  '@id': `${url}#items`,
  url,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});

export const reviewsCollectionPageSchema = (
  input: ReviewsCollectionPageInput,
): readonly SchemaDoc[] => {
  const url = absoluteUrl(input.url);
  const list = input.items.length
    ? itemListSchema(url, input.items)
    : undefined;
  const docs: SchemaDoc[] = [
    {
      '@context': CONTEXT,
      '@type': 'CollectionPage',
      name: input.name,
      description: input.description,
      url,
      inLanguage: LANG,
      ...(list ? { mainEntity: { '@id': list['@id'] } } : {}),
    },
  ];

  if (list) docs.push(list);
  if (input.breadcrumbs?.length) docs.push(breadcrumbSchema(input.breadcrumbs));

  return docs;
};

const reviewRatings = (review: Review): readonly SchemaDoc[] =>
  review.aspects.flatMap((aspect) =>
    aspect.rating
      ? [
          {
            '@type': 'Rating',
            ratingValue: aspect.rating,
            bestRating: 5,
            worstRating: 1,
            reviewAspect: aspect.type,
          },
        ]
      : [],
  );

export const reviewPageSchema = (
  input: ReviewPageInput,
): readonly SchemaDoc[] => {
  const { review } = input;
  const ratings = reviewRatings(review);
  const docs: SchemaDoc[] = [
    {
      '@context': CONTEXT,
      '@type': 'Review',
      name: formatReviewTitle(review),
      reviewBody: extractFirstMarkdownText(review.body),
      author: {
        '@type': review.author ? 'Person' : 'Organization',
        name: review.author ?? REVIEW_AUTHOR_FALLBACK,
      },
      datePublished: review.publishedIso,
      url: absoluteUrl(review.url),
      mainEntityOfPage: absoluteUrl(review.url),
      inLanguage: LANG,
      itemReviewed: {
        '@type': 'Place',
        name: 'КП Шелково',
      },
      ...(ratings.length > 0 ? { reviewRating: ratings } : {}),
    },
  ];

  if (input.breadcrumbs?.length) docs.push(breadcrumbSchema(input.breadcrumbs));

  return docs;
};
