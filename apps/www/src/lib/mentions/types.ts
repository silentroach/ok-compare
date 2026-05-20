export const ENTITY_MENTION_ALTERNATE_LABEL_CASES = [
  'gen',
  'dat',
  'acc',
  'ins',
  'prep',
] as const;

export const ENTITY_MENTION_LABEL_CASES = [
  'nom',
  ...ENTITY_MENTION_ALTERNATE_LABEL_CASES,
] as const;

export type EntityMentionType = 'person';
export type EntityMentionAlternateLabelCase =
  (typeof ENTITY_MENTION_ALTERNATE_LABEL_CASES)[number];
export type EntityMentionLabelCase =
  (typeof ENTITY_MENTION_LABEL_CASES)[number];
export type EntityMentionLabelCaseForms = Readonly<
  Partial<Record<EntityMentionAlternateLabelCase, string>>
>;

export interface EntityMentionTarget {
  readonly type: EntityMentionType;
  readonly slug: string;
  readonly label: string;
  readonly label_cases?: EntityMentionLabelCaseForms;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly link_title?: string;
  readonly link_context?: string;
}

export interface EntityMentionSourceEntity {
  readonly type: EntityMentionType;
  readonly slug: string;
}

export type SiteMentionRegistry = ReadonlyMap<string, EntityMentionTarget>;

export interface NormalizedEntityMentions {
  readonly markdown: string;
  readonly mentions: readonly EntityMentionTarget[];
}

const ENTITY_MENTION_LABEL_CASE_SET = new Set<string>(
  ENTITY_MENTION_LABEL_CASES,
);

export const ENTITY_MENTION_DEFAULT_LABEL_CASE = 'nom';

export const isEntityMentionLabelCase = (
  value: string,
): value is EntityMentionLabelCase => ENTITY_MENTION_LABEL_CASE_SET.has(value);
