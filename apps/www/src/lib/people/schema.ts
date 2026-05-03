export const PERSON_CONTACT_TYPES = ['phone', 'telegram'] as const;
export type PersonContactType = (typeof PERSON_CONTACT_TYPES)[number];

export interface PersonContact {
  readonly type: PersonContactType;
  readonly value: string;
}

export const PERSON_MENTION_SECTIONS = ['news', 'status', 'people'] as const;
export type PersonMentionSection = (typeof PERSON_MENTION_SECTIONS)[number];

export interface PersonMentionRef {
  readonly section: PersonMentionSection;
  readonly id: string;
  readonly title: string;
  readonly url: string;
}

export interface PersonBacklinks {
  readonly news: readonly PersonMentionRef[];
  readonly status: readonly PersonMentionRef[];
  readonly people: readonly PersonMentionRef[];
}

export interface PersonProfile {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly url: string;
  readonly markdown_url: string;
  readonly canonical: string;
  readonly contacts: readonly PersonContact[];
  readonly body: string;
}
