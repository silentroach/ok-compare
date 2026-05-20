import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from './mentions';
import type { PersonProfile } from './schema';

let createPersonProfileMentionRefs: typeof import('./mention-refs').createPersonProfileMentionRefs;

beforeAll(async () => {
  ({ createPersonProfileMentionRefs } = await import('./mention-refs'));
});

const target = createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин');

const profile = (input?: {
  readonly mentions?: PersonProfile['mentions'];
}): Pick<
  PersonProfile,
  'id' | 'slug' | 'name' | 'url' | 'markdown_url' | 'body' | 'mentions'
> => ({
  id: 'apetrov',
  slug: 'apetrov',
  name: 'Андрей Петров',
  url: '/people/apetrov/',
  markdown_url: '/people/apetrov/index.md',
  body: 'Работал вместе с [Кирилл Щемелинин](/people/kschemelinin/).\n\nВторой абзац.',
  mentions: input?.mentions ?? [target],
});

describe('createPersonProfileMentionRefs', () => {
  it('creates person profile source refs with people presentation fields', () => {
    expect(createPersonProfileMentionRefs(profile())).toEqual([
      {
        target_type: 'person',
        target_slug: 'kschemelinin',
        source_section: 'people',
        source_kind: 'person',
        source_id: 'apetrov',
        source_entity: { type: 'person', slug: 'apetrov' },
        title: 'Андрей Петров',
        html_url: '/people/apetrov/',
        markdown_url: '/people/apetrov/index.md',
        excerpt: 'Работал вместе с Кирилл Щемелинин.',
      },
    ]);
  });

  it('dedupes repeated targets inside one profile', () => {
    expect(
      createPersonProfileMentionRefs(profile({ mentions: [target, target] })),
    ).toHaveLength(1);
  });
});
