import type { PreprocessedSiteMarkdownBody } from '@/lib/markdown/render';
import type { EntityMentionTarget } from '@/lib/mentions';

import type { ContactCategory } from './schema';

export interface ContactContacts {
  readonly phone?: string;
  readonly telegram?: string;
  readonly whatsapp?: string;
  readonly email?: string;
  readonly website?: string;
  readonly address?: string;
}

export interface ContactSeo {
  readonly description?: string;
}

export interface Contact {
  readonly slug: string;
  readonly title: string;
  readonly category: ContactCategory;
  readonly updatedAt: Date;
  readonly updatedIso: string;
  readonly contacts: ContactContacts;
  readonly seo?: ContactSeo;
  readonly url: string;
  readonly markdownUrl: string;
  readonly canonical: string;
  readonly body: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly EntityMentionTarget[];
}

export interface ContactsDataset {
  readonly contacts: readonly Contact[];
  readonly bySlug: ReadonlyMap<string, Contact>;
}
