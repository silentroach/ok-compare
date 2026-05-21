import type { EntityMentionTarget } from '../mentions';
import type { PersonNameCaseForms } from './name-cases';
import { personMarkdownUrl, personUrl } from './routes';

export interface PersonMentionTarget extends EntityMentionTarget {
  readonly type: 'person';
  readonly name: string;
  readonly nameCases?: PersonNameCaseForms;
  readonly company?: string;
  readonly position?: string;
}

export type PeopleMentionRegistry = ReadonlyMap<string, PersonMentionTarget>;

const mentionTitle = (
  company: string | undefined,
  position: string | undefined,
): string | undefined => {
  const parts = [position, company].filter(
    (item): item is string => item !== undefined,
  );

  return parts.length > 0 ? parts.join(', ') : undefined;
};

export const createPersonMentionTarget = (
  slug: string,
  name: string,
  nameCases?: PersonNameCaseForms,
  company?: string,
  position?: string,
): PersonMentionTarget => {
  const linkTitle = mentionTitle(company, position);

  return {
    type: 'person',
    slug,
    label: name,
    name,
    ...(nameCases ? { labelCases: nameCases, nameCases } : {}),
    ...(company ? { company } : {}),
    ...(position ? { position } : {}),
    ...(linkTitle ? { linkTitle } : {}),
    htmlUrl: personUrl(slug),
    markdownUrl: personMarkdownUrl(slug),
  };
};
