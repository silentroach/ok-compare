import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from './mentions';
import type { PersonProfile } from './types';

let createPersonProfileMentionRefs: typeof import('./mention-refs').createPersonProfileMentionRefs;

beforeAll(async () => {
  ({ createPersonProfileMentionRefs } = await import('./mention-refs'));
});

const target = createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин');

const profile = (input?: {
  readonly mentions?: PersonProfile['mentions'];
}): Pick<
  PersonProfile,
  'id' | 'slug' | 'name' | 'url' | 'markdownUrl' | 'body' | 'mentions'
> => ({
  id: 'apetrov',
  slug: 'apetrov',
  name: 'Андрей Петров',
  url: '/people/apetrov/',
  markdownUrl: '/people/apetrov/index.md',
  body: 'Работал вместе с [Кирилл Щемелинин](/people/kschemelinin/).\n\nВторой абзац.',
  mentions: input?.mentions ?? [target],
});

describe('createPersonProfileMentionRefs', () => {
  it('creates person profile source refs with people presentation fields', () => {
    expect(createPersonProfileMentionRefs(profile())).toEqual([
      {
        target: { type: 'person', slug: 'kschemelinin' },
        source: { section: 'people', kind: 'person', id: 'apetrov' },
        sourceEntity: { type: 'person', slug: 'apetrov' },
        title: 'Андрей Петров',
        htmlUrl: '/people/apetrov/',
        markdownUrl: '/people/apetrov/index.md',
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
