import type { SchemaDoc } from '@shelkovo/seo';
import { absoluteUrl } from '../site';

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

export interface NewsArticleInput extends Omit<ArticleInput, 'type'> {}

export interface TechArticleInput extends Omit<ArticleInput, 'type'> {}

function breadcrumbSchema(items: readonly BreadcrumbLink[]): SchemaDoc {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

function itemListSchema(url: string, items: readonly ListEntry[]): SchemaDoc {
  return {
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
  };
}

function imageValue(
  image: string | readonly string[] | undefined,
): string | readonly string[] | undefined {
  if (!image) return undefined;
  if (typeof image !== 'string') {
    return image.map((item) => absoluteUrl(item));
  }

  return absoluteUrl(image);
}

function articleSchema(input: ArticleInput): readonly SchemaDoc[] {
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
}

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

export function newsArticleSchema(
  input: NewsArticleInput,
): readonly SchemaDoc[] {
  return articleSchema({ ...input, type: 'NewsArticle' });
}

export function techArticleSchema(
  input: TechArticleInput,
): readonly SchemaDoc[] {
  return articleSchema({ ...input, type: 'TechArticle' });
}
