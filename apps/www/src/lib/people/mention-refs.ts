import { extractFirstMarkdownText } from '@shelkovo/markdown';

import { createEntityMentionSourceRefs } from '../mentions';
import type { EntityMentionSourceRef } from '../mentions';
import type { PersonProfile } from './schema';

type PersonProfileMentionRefSource = Pick<
  PersonProfile,
  'id' | 'slug' | 'name' | 'url' | 'markdown_url' | 'body' | 'mentions'
>;

const SPACE = /\s+/gu;

const excerpt = (markdown: string): string | undefined => {
  const first = extractFirstMarkdownText(markdown);

  return first ? first.replace(SPACE, ' ').trim() : undefined;
};

export const createPersonProfileMentionRefs = (
  profile: PersonProfileMentionRefSource,
): readonly EntityMentionSourceRef[] => {
  const summary = excerpt(profile.body);

  return createEntityMentionSourceRefs(profile.mentions, {
    source_section: 'people',
    source_kind: 'person',
    source_id: profile.id,
    source_entity: { type: 'person', slug: profile.slug },
    title: profile.name,
    html_url: profile.url,
    markdown_url: profile.markdown_url,
    ...(summary ? { excerpt: summary } : {}),
  });
};
