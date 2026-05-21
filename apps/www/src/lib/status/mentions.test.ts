import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import type { StatusIncident } from './types';

let createStatusIncidentMentionRefs: typeof import('./mentions').createStatusIncidentMentionRefs;

beforeAll(async () => {
  ({ createStatusIncidentMentionRefs } = await import('./mentions'));
});

const target = createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин');

const incident = (input?: {
  readonly mentions?: StatusIncident['mentions'];
}): Pick<
  StatusIncident,
  | 'id'
  | 'title'
  | 'url'
  | 'year'
  | 'month'
  | 'slug'
  | 'excerpt'
  | 'mentions'
  | 'startedIso'
  | 'sortLastChangeAt'
> => ({
  id: '2026/04/electricity-river-10kv-line-damage',
  title: 'Отключение электричества в Шелково Ривер',
  url: '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
  year: 2026,
  month: 4,
  slug: 'electricity-river-10kv-line-damage',
  excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
  mentions: input?.mentions ?? [target],
  startedIso: '2026-04-22T11:30:00+03:00',
  sortLastChangeAt: 1770000000000,
});

describe('createStatusIncidentMentionRefs', () => {
  it('creates incident source refs with status presentation fields', () => {
    expect(createStatusIncidentMentionRefs(incident())).toEqual([
      {
        targetType: 'person',
        targetSlug: 'kschemelinin',
        sourceSection: 'status',
        sourceKind: 'incident',
        sourceId: '2026/04/electricity-river-10kv-line-damage',
        title: 'Отключение электричества в Шелково Ривер',
        htmlUrl:
          '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
        markdownUrl:
          '/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md',
        excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
        mentionedAt: '2026-04-22T11:30:00+03:00',
        sortKey: 1770000000000,
      },
    ]);
  });

  it('dedupes repeated targets inside one incident', () => {
    expect(
      createStatusIncidentMentionRefs(incident({ mentions: [target, target] })),
    ).toHaveLength(1);
  });
});
