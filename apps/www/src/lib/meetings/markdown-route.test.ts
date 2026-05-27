import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { Meeting } from './types';

const exampleMeeting: Meeting = {
  id: '2026-05-26-example-meeting',
  routeId: '2026-05-26/example-meeting',
  date: '2026-05-26',
  slug: 'example-meeting',
  title: 'Встреча с жителями',
  summary: 'Краткое содержание встречи.',
  url: '/meetings/2026-05-26/example-meeting/',
  markdownUrl: '/meetings/2026-05-26/example-meeting/index.md',
  canonical: 'https://example.com/meetings/2026-05-26/example-meeting/',
  highlights: [],
  agenda: [],
  decisions: [],
  actionItems: [],
  questions: [],
  participants: [],
  documents: [],
  mentions: [],
};

vi.mock('@/lib/meetings/load', () => ({
  loadMeetingByRouteId: vi.fn(async () => exampleMeeting),
  loadMeetings: vi.fn(async () => [exampleMeeting]),
}));

let route: typeof import('../../pages/meetings/[date]/[slug]/index.md.ts');

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  route = await import('../../pages/meetings/[date]/[slug]/index.md.ts');
});

describe('/meetings/[date]/[slug]/index.md', () => {
  it('returns Markdown headers and static paths for meetings', async () => {
    await expect(route.getStaticPaths()).resolves.toEqual([
      { params: { date: '2026-05-26', slug: 'example-meeting' } },
    ]);

    const response = await route.GET({
      params: { date: '2026-05-26', slug: 'example-meeting' },
    } as unknown as Parameters<typeof route.GET>[0]);

    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    await expect(response.text()).resolves.toContain('# Встреча с жителями');
  });
});
