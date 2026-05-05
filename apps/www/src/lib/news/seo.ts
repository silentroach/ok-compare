import type { SchemaDoc } from '@shelkovo/seo';
import { absoluteUrl } from '../site';
import type { NewsEvent } from './schema';

const CONTEXT = 'https://schema.org';
const LANG = 'ru-RU';

export const MARKDOWN_ROBOTS = 'noindex, follow';

export interface BreadcrumbLink {
  readonly name: string;
  readonly url: string;
}

export interface ListEntry {
  readonly name: string;
  readonly url: string;
}

interface BasePageInput {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly breadcrumbs?: readonly BreadcrumbLink[];
}

export interface CollectionPageInput extends BasePageInput {
  readonly items?: readonly ListEntry[];
}

type AuthorInput = SchemaDoc | readonly SchemaDoc[] | undefined;

interface ArticleInput extends BasePageInput {
  readonly type: 'NewsArticle' | 'TechArticle';
  readonly datePublished?: string;
  readonly dateModified?: string;
  readonly image?: string | readonly string[];
  readonly author?: AuthorInput;
}

export interface NewsArticleEventInput extends Pick<
  NewsEvent,
  'title' | 'starts_iso' | 'ends_iso' | 'location' | 'coordinates'
> {}

export interface NewsArticleInput extends Omit<ArticleInput, 'type'> {
  readonly event?: NewsArticleEventInput;
}

export interface TechArticleInput extends Omit<ArticleInput, 'type'> {}

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

const imageValue = (
  image: string | readonly string[] | undefined,
): string | readonly string[] | undefined => {
  if (!image) return undefined;
  if (typeof image !== 'string') {
    return image.map((item) => absoluteUrl(item));
  }

  return absoluteUrl(image);
};

const articleSchema = (input: ArticleInput): readonly SchemaDoc[] => {
  const url = absoluteUrl(input.url);
  const image = imageValue(input.image);
  const docs: SchemaDoc[] = [
    {
      '@context': CONTEXT,
      '@type': input.type,
      headline: input.name,
      name: input.name,
      description: input.description,
      url,
      mainEntityOfPage: url,
      inLanguage: LANG,
      ...(input.datePublished ? { datePublished: input.datePublished } : {}),
      ...(input.dateModified ? { dateModified: input.dateModified } : {}),
      ...(image ? { image } : {}),
      ...(input.author ? { author: input.author } : {}),
    },
  ];

  if (input.breadcrumbs?.length) {
    docs.push(breadcrumbSchema(input.breadcrumbs));
  }

  return docs;
};

const eventLocationSchema = (
  event: NewsArticleEventInput,
): SchemaDoc | undefined => {
  if (!event.location && !event.coordinates) {
    return undefined;
  }

  return {
    '@type': 'Place',
    ...(event.location
      ? {
          name: event.location,
          address: event.location,
        }
      : {}),
    ...(event.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: event.coordinates.lat,
            longitude: event.coordinates.lng,
          },
        }
      : {}),
  };
};

const newsEventSchema = (input: NewsArticleInput): SchemaDoc | undefined => {
  if (!input.event) {
    return undefined;
  }

  const url = absoluteUrl(input.url);
  const location = eventLocationSchema(input.event);

  return {
    '@context': CONTEXT,
    '@type': 'Event',
    '@id': `${url}#event`,
    name: input.event.title,
    description: input.description,
    url,
    mainEntityOfPage: url,
    inLanguage: LANG,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    startDate: input.event.starts_iso,
    ...(input.event.ends_iso ? { endDate: input.event.ends_iso } : {}),
    ...(location ? { location } : {}),
  };
};

export function collectionPageSchema(
  input: CollectionPageInput,
): readonly SchemaDoc[] {
  const url = absoluteUrl(input.url);
  const list = input.items?.length
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

  if (list) {
    docs.push(list);
  }

  if (input.breadcrumbs?.length) {
    docs.push(breadcrumbSchema(input.breadcrumbs));
  }

  return docs;
}

export const newsArticleSchema = (
  input: NewsArticleInput,
): readonly SchemaDoc[] => {
  const event = newsEventSchema(input);

  return event
    ? [...articleSchema({ ...input, type: 'NewsArticle' }), event]
    : articleSchema({ ...input, type: 'NewsArticle' });
};

export const techArticleSchema = (
  input: TechArticleInput,
): readonly SchemaDoc[] => articleSchema({ ...input, type: 'TechArticle' });
