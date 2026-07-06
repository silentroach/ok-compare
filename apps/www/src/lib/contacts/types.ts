import type { PreprocessedSiteMarkdownBody } from '@/lib/markdown/render';
import type { EntityMentionTarget } from '@/lib/mentions';

import type { ContactCategory } from './schema';

export interface ContactContacts {
  readonly phone?: string;
  readonly telegram?: string;
  readonly whatsapp?: string;
  readonly email?: string;
  readonly website?: string;
}

export interface ContactSeo {
  readonly description?: string;
}

interface ContactBase {
  readonly slug: string;
  readonly title: string;
  readonly category: ContactCategory;
  readonly updatedAt: Date;
  readonly updatedIso: string;
  readonly summary?: string;
  readonly contacts: ContactContacts;
  readonly seo?: ContactSeo;
  readonly body: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly EntityMentionTarget[];
}

export interface ContactWithDetail extends ContactBase {
  readonly hasDetailPage: true;
  readonly url: string;
  readonly markdownUrl: string;
  readonly canonical: string;
}

export interface ContactListOnly extends ContactBase {
  readonly hasDetailPage: false;
  readonly url?: undefined;
  readonly markdownUrl?: undefined;
  readonly canonical?: undefined;
}

export type Contact = ContactWithDetail | ContactListOnly;

export interface ContactCategoryPage {
  readonly category: ContactCategory;
  readonly contacts: readonly Contact[];
  readonly url: string;
  readonly markdownUrl: string;
}

export interface ContactsDataset {
  readonly contacts: readonly Contact[];
  readonly categories: readonly ContactCategoryPage[];
  readonly byRoute: ReadonlyMap<string, Contact>;
  readonly byCategory: ReadonlyMap<ContactCategory, ContactCategoryPage>;
}
