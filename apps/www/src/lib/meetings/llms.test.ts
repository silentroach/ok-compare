import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { MeetingsDataset } from './types';

const dataset: MeetingsDataset = {
  meetings: [
    {
      id: '2026-05-27-full-meeting',
      routeId: '2026-05-27/full-meeting',
      date: '2026-05-27',
      slug: 'full-meeting',
      title: 'Полная встреча',
      summary: 'Все материалы встречи.',
      url: '/meetings/2026-05-27/full-meeting/',
      markdownUrl: '/meetings/2026-05-27/full-meeting/index.md',
      canonical: 'https://example.com/meetings/2026-05-27/full-meeting/',
      highlights: [],
      agenda: [],
      decisions: [],
      actionItems: [],
      questions: [],
      participants: [],
      documents: [],
      mentions: [],
      transcript: {
        speakers: [],
        segments: [
          {
            start: '00:12:34',
            anchor: 't-00-12-34',
            text: 'Ключевой фрагмент.',
          },
        ],
      },
    },
  ],
  byId: new Map(),
  byRouteId: new Map(),
};

vi.mock('./load', () => ({
  loadMeetingsData: async () => dataset,
}));

let build: typeof import('./llms').build;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build } = await import('./llms'));
});

describe('meetings llms', () => {
  it('serializes the short meetings overview with stable public URLs', async () => {
    const text = await build('short');

    expect(text).toContain('# Встречи Шелково');
    expect(text).toContain('Файл: llms.txt');
    expect(text).toContain('https://example.com/meetings/');
    expect(text).toContain('https://example.com/meetings/data/meetings.json');
    expect(text).toContain('https://example.com/meetings/llms-full.txt');
    expect(text).toContain('публичный, но не пункт главного меню');
    expect(text).not.toMatch(/apps\/www|src\/|repo:/u);
  });

  it('documents URL patterns, JSON fields, transcript limits and reading order', async () => {
    const text = await build('full');

    expect(text).toContain('`/meetings/YYYY-MM-DD/[slug]/`');
    expect(text).toContain('`/meetings/YYYY-MM-DD/[slug]/index.md`');
    expect(text).toContain('`/meetings/data/meetings.json`');
    expect(text).toContain('`meetings[].transcript.segments[].anchor`');
    expect(text).toContain('Сначала используйте JSON-ленту для обнаружения');
    expect(text).toMatch(/[Рр]асшифровка может отсутствовать; это не ошибка/u);
    expect(text).toContain('iframe');
    expect(text).not.toContain('iframe поддерживается');
    expect(text).not.toMatch(/apps\/www|src\/|repo:/u);
  });

  it('routes return text/plain responses', async () => {
    const shortRoute = await import('../../pages/meetings/llms.txt');
    const fullRoute = await import('../../pages/meetings/llms-full.txt');

    const short = await shortRoute.GET(
      {} as Parameters<typeof shortRoute.GET>[0],
    );
    const full = await fullRoute.GET({} as Parameters<typeof fullRoute.GET>[0]);

    expect(shortRoute.prerender).toBe(true);
    expect(fullRoute.prerender).toBe(true);
    expect(short.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(full.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    await expect(short.text()).resolves.toContain(
      'https://example.com/meetings/',
    );
    await expect(full.text()).resolves.toContain(
      '/meetings/data/meetings.json',
    );
  });
});
