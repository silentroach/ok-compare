import type { SchemaDoc } from '@shelkovo/seo';

import { canon } from './site';
import { withBase } from './url';

interface SchemaBreadcrumb {
  readonly name: string;
  readonly item: string;
}

const HOME_LABEL = 'Главная';
const COMPARE_LABEL = 'Сравнение тарифов';
const CANONICAL_SITE = 'https://kpshelkovo.online';

const homeUrl = (): string =>
  new URL('/', import.meta.env.SITE ?? CANONICAL_SITE).toString();

const listItem = (name: string, item: string, position: number): SchemaDoc => ({
  '@type': 'ListItem',
  position,
  name,
  item,
});

export const compareBreadcrumbs = () =>
  [
    { label: HOME_LABEL, href: '/' },
    { label: COMPARE_LABEL, href: withBase('/') },
  ] as const;

export const settlementBreadcrumbs = (name: string) =>
  [...compareBreadcrumbs(), { label: name }] as const;

export const compareBreadcrumbSchema = (
  items: readonly SchemaBreadcrumb[] = [],
): SchemaDoc => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    listItem(HOME_LABEL, homeUrl(), 1),
    listItem(COMPARE_LABEL, canon('/'), 2),
    ...items.map((item, index) => listItem(item.name, item.item, index + 3)),
  ],
});
