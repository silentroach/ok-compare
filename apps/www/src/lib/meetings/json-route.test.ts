import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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
      format: 'Созвон',
      sourceUrl: 'https://example.com/source',
      recordingUrl: 'https://video.example.com/recording',
      highlights: ['Короткий вывод'],
      agenda: ['Повестка'],
      decisions: ['Решение'],
      actionItems: ['Действие'],
      questions: ['Вопрос'],
      participants: ['Участник'],
      documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
      body: 'Публичное описание.',
      mentions: [],
      transcript: {
        speakers: [{ id: 'host', name: 'Ведущий', role: 'модератор' }],
        segments: [
          {
            start: '00:12:34',
            end: '00:13:00',
            anchor: 't-00-12-34',
            speaker: 'host',
            speakerLabel: 'Ведущий',
            text: 'Ключевой фрагмент.',
          },
        ],
      },
    },
    {
      id: '2026-05-26-minimal-meeting',
      routeId: '2026-05-26/minimal-meeting',
      date: '2026-05-26',
      slug: 'minimal-meeting',
      title: 'Минимальная встреча',
      summary: 'Минимальный набор полей.',
      url: '/meetings/2026-05-26/minimal-meeting/',
      markdownUrl: '/meetings/2026-05-26/minimal-meeting/index.md',
      canonical: 'https://example.com/meetings/2026-05-26/minimal-meeting/',
      highlights: [],
      agenda: [],
      decisions: [],
      actionItems: [],
      questions: [],
      participants: [],
      documents: [],
      mentions: [],
    },
  ],
  byId: new Map(),
  byRouteId: new Map(),
};

vi.mock('@/lib/meetings/load', () => ({
  loadMeetingsData: vi.fn(async () => dataset),
}));

let route: typeof import('../../pages/meetings/data/meetings.json');

beforeAll(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'));

  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  route = await import('../../pages/meetings/data/meetings.json');
});

afterAll(() => {
  vi.useRealTimers();
});

describe('/meetings/data/meetings.json', () => {
  it('returns pretty camelCase JSON from the meetings public DTO', async () => {
    const { loadMeetingsData } = await import('@/lib/meetings/load');
    const response = await route.GET({} as Parameters<typeof route.GET>[0]);
    const body = await response.text();

    expect(loadMeetingsData).toHaveBeenCalledTimes(1);
    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(body.endsWith('\n')).toBe(true);
    expect(body).not.toContain('routeId');
    expect(body).not.toContain('source_url');
    expect(JSON.parse(body)).toMatchInlineSnapshot(`
      {
        "generatedAt": "2026-05-27T12:00:00.000Z",
        "meetings": [
          {
            "actionItems": [
              "Действие",
            ],
            "agenda": [
              "Повестка",
            ],
            "bodyMarkdown": "Публичное описание.",
            "date": "2026-05-27",
            "decisions": [
              "Решение",
            ],
            "documents": [
              {
                "title": "Протокол",
                "url": "https://example.com/documents/protocol.pdf",
              },
            ],
            "format": "Созвон",
            "highlights": [
              "Короткий вывод",
            ],
            "htmlUrl": "https://example.com/meetings/2026-05-27/full-meeting/",
            "id": "2026-05-27-full-meeting",
            "markdownUrl": "https://example.com/meetings/2026-05-27/full-meeting/index.md",
            "participants": [
              "Участник",
            ],
            "questions": [
              "Вопрос",
            ],
            "recordingUrl": "https://video.example.com/recording",
            "slug": "full-meeting",
            "sourceUrl": "https://example.com/source",
            "summary": "Все материалы встречи.",
            "title": "Полная встреча",
            "transcript": {
              "segments": [
                {
                  "anchor": "t-00-12-34",
                  "end": "00:13:00",
                  "speaker": "host",
                  "speakerLabel": "Ведущий",
                  "start": "00:12:34",
                  "text": "Ключевой фрагмент.",
                },
              ],
              "speakers": [
                {
                  "id": "host",
                  "name": "Ведущий",
                  "role": "модератор",
                },
              ],
            },
          },
          {
            "date": "2026-05-26",
            "htmlUrl": "https://example.com/meetings/2026-05-26/minimal-meeting/",
            "id": "2026-05-26-minimal-meeting",
            "markdownUrl": "https://example.com/meetings/2026-05-26/minimal-meeting/index.md",
            "slug": "minimal-meeting",
            "summary": "Минимальный набор полей.",
            "title": "Минимальная встреча",
          },
        ],
        "schemaVersion": "1.0.0",
        "totalCount": 2,
        "updatedAt": "2026-05-27",
      }
    `);
  });
});
