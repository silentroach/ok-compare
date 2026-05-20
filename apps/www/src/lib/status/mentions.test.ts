import { beforeAll, describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import type { StatusIncident } from './schema';

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
  | 'started_iso'
  | 'sort_last_change_at'
> => ({
  id: '2026/04/electricity-river-10kv-line-damage',
  title: 'Отключение электричества в Шелково Ривер',
  url: '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
  year: 2026,
  month: 4,
  slug: 'electricity-river-10kv-line-damage',
  excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
  mentions: input?.mentions ?? [target],
  started_iso: '2026-04-22T11:30:00+03:00',
  sort_last_change_at: 1770000000000,
});

describe('createStatusIncidentMentionRefs', () => {
  it('creates incident source refs with status presentation fields', () => {
    expect(createStatusIncidentMentionRefs(incident())).toEqual([
      {
        target_type: 'person',
        target_slug: 'kschemelinin',
        source_section: 'status',
        source_kind: 'incident',
        source_id: '2026/04/electricity-river-10kv-line-damage',
        title: 'Отключение электричества в Шелково Ривер',
        html_url:
          '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
        markdown_url:
          '/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md',
        excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
        mentioned_at: '2026-04-22T11:30:00+03:00',
        sort_key: 1770000000000,
      },
    ]);
  });

  it('dedupes repeated targets inside one incident', () => {
    expect(
      createStatusIncidentMentionRefs(incident({ mentions: [target, target] })),
    ).toHaveLength(1);
  });
});
