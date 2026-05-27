import { beforeAll, describe, expect, it } from 'vitest';

import type { Meeting } from './types';

let createMeetingMentionRefs: typeof import('./mentions').createMeetingMentionRefs;
let createMeetingMentionTarget: typeof import('./mentions').createMeetingMentionTarget;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ createMeetingMentionRefs, createMeetingMentionTarget } =
    await import('./mentions'));
});

describe('meeting mentions', () => {
  it('maps meeting identity into the shared mention target contract', () => {
    expect(
      createMeetingMentionTarget({
        id: '2026-05-26/full-meeting',
        data: {
          title: 'Полная встреча',
          date: '2026-05-26',
          summary: 'Все материалы встречи.',
          slug: 'full-meeting',
        },
      }),
    ).toEqual({
      type: 'meeting',
      slug: '2026-05-26-full-meeting',
      label: 'Полная встреча',
      title: 'Полная встреча',
      date: '2026-05-26',
      htmlUrl: '/meetings/2026-05-26/full-meeting/',
      markdownUrl: '/meetings/2026-05-26/full-meeting/index.md',
    });
  });

  it('publishes source refs from meeting body mentions', () => {
    const mention = {
      type: 'person',
      slug: 'kschemelinin',
      label: 'Кирилл Щемелинин',
      htmlUrl: '/people/kschemelinin/',
      markdownUrl: '/people/kschemelinin/index.md',
    } as const;
    const meeting = {
      id: '2026-05-26-full-meeting',
      routeId: '2026-05-26/full-meeting',
      date: '2026-05-26',
      slug: 'full-meeting',
      title: 'Полная встреча',
      url: '/meetings/2026-05-26/full-meeting/',
      markdownUrl: '/meetings/2026-05-26/full-meeting/index.md',
      body: 'На встрече выступил [Кирилл Щемелинин](/people/kschemelinin/).',
      mentions: [mention],
    } satisfies Pick<
      Meeting,
      | 'id'
      | 'routeId'
      | 'date'
      | 'slug'
      | 'title'
      | 'url'
      | 'markdownUrl'
      | 'body'
      | 'mentions'
    >;

    expect(createMeetingMentionRefs(meeting)).toEqual([
      {
        target: { type: 'person', slug: 'kschemelinin' },
        source: {
          section: 'meetings',
          kind: 'meeting',
          id: '2026-05-26-full-meeting',
        },
        sourceEntity: { type: 'meeting', slug: '2026-05-26-full-meeting' },
        title: 'Полная встреча',
        htmlUrl: '/meetings/2026-05-26/full-meeting/',
        markdownUrl: '/meetings/2026-05-26/full-meeting/index.md',
        excerpt: 'На встрече выступил Кирилл Щемелинин.',
        mentionedAt: '2026-05-26T00:00:00.000+03:00',
        sortKey: Date.parse('2026-05-26T00:00:00.000+03:00'),
      },
    ]);
  });
});
