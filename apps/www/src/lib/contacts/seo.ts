import type { SchemaDoc } from '@shelkovo/seo';

import { absoluteUrl } from '@/lib/site';

import type { ContactWithDetail } from './types';
import { contactExcerpt, formatContactCategory } from './view';

const CONTEXT = 'https://schema.org';
const LANG = 'ru-RU';

interface BreadcrumbLink {
  readonly name: string;
  readonly url: string;
}

interface ListEntry {
  readonly name: string;
  readonly url: string;
}

interface ContactsCollectionPageInput {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly items: readonly ListEntry[];
  readonly breadcrumbs?: readonly BreadcrumbLink[];
}

interface ContactPageInput {
  readonly contact: ContactWithDetail;
  readonly description: string;
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

export const contactsCollectionPageSchema = (
  input: ContactsCollectionPageInput,
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

export const contactPageSchema = (
  input: ContactPageInput,
): readonly SchemaDoc[] => {
  const { contact } = input;
  const docs: SchemaDoc[] = [
    {
      '@context': CONTEXT,
      '@type': 'WebPage',
      name: contact.title,
      description: input.description,
      url: absoluteUrl(contact.url),
      inLanguage: LANG,
      about: {
        '@type': 'Thing',
        name: formatContactCategory(contact.category),
        description: contactExcerpt(contact),
      },
      dateModified: contact.updatedIso,
    },
  ];

  if (input.breadcrumbs?.length) docs.push(breadcrumbSchema(input.breadcrumbs));

  return docs;
};
