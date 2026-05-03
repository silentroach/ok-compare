import type { PersonMentionTarget } from './mentions';

export const PERSON_CONTACT_TYPES = ['phone', 'telegram'] as const;
export type PersonContactType = (typeof PERSON_CONTACT_TYPES)[number];

export interface PersonContact {
  readonly type: PersonContactType;
  readonly value: string;
  readonly display: string;
  readonly href: string;
}

export const PERSON_MENTION_SECTIONS = ['news', 'status', 'people'] as const;
export type PersonMentionSection = (typeof PERSON_MENTION_SECTIONS)[number];

export const PERSON_BACKLINK_KINDS = [
  'article',
  'addendum',
  'incident',
  'person',
] as const;
export type PersonBacklinkKind = (typeof PERSON_BACKLINK_KINDS)[number];

export interface PersonMentionRef {
  readonly section: PersonMentionSection;
  readonly kind: PersonBacklinkKind;
  readonly source_id: string;
  readonly title: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly excerpt?: string;
  readonly mentioned_at?: string;
  readonly sort_key?: number;
}

export interface PersonBacklinks {
  readonly news: readonly PersonMentionRef[];
  readonly status: readonly PersonMentionRef[];
  readonly people: readonly PersonMentionRef[];
}

export const EMPTY_PERSON_BACKLINKS: PersonBacklinks = {
  news: [],
  status: [],
  people: [],
};

export interface PersonProfile {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly url: string;
  readonly markdown_url: string;
  readonly canonical: string;
  readonly contacts: readonly PersonContact[];
  readonly body: string;
  readonly mentions: readonly PersonMentionTarget[];
  readonly backlinks: PersonBacklinks;
}
