import { beforeAll, describe, expect, it } from 'vitest';

import type { MeetingEntry } from './load';
import type { RawMeetingTranscript } from './raw-schema';

let buildMeetingsDataset: typeof import('./load').buildMeetingsDataset;
let toMeetingsPublicPayload: typeof import('./public-dto').toMeetingsPublicPayload;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildMeetingsDataset } = await import('./load'));
  ({ toMeetingsPublicPayload } = await import('./public-dto'));
});

const transcript: RawMeetingTranscript = {
  speakers: [{ id: 'host', name: 'Ведущий', role: 'модератор' }],
  segments: [
    {
      start: '00:12:34',
      end: '00:13:00',
      speaker: 'host',
      text: 'Ключевой фрагмент.',
    },
  ],
};

const entry: MeetingEntry = {
  id: '2026-05-26/full-meeting',
  body: 'Публичное описание.',
  data: {
    title: 'Полная встреча',
    date: '2026-05-26',
    summary: 'Все материалы встречи.',
    slug: 'full-meeting',
    format: 'Созвон',
    source_url: 'https://example.com/source',
    video_url: 'https://video.example.com/recording',
    transcript: 'transcript.yaml',
    highlights: ['Короткий вывод'],
    agenda: ['Повестка'],
    decisions: ['Решение'],
    action_items: ['Действие'],
    questions: ['Вопрос'],
    participants: ['Участник'],
    documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
  },
};

describe('meetings public DTO adapters', () => {
  it('builds camelCase public payload with stable URLs and transcript anchors', () => {
    const data = buildMeetingsDataset([entry], {
      transcripts: new Map([[`${entry.id}/transcript.yaml`, transcript]]),
    });

    expect(
      toMeetingsPublicPayload(data, {
        generatedAt: new Date('2026-05-27T12:00:00.000Z'),
      }),
    ).toMatchInlineSnapshot(`
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
            "date": "2026-05-26",
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
            "htmlUrl": "https://example.com/meetings/2026-05-26/full-meeting/",
            "id": "2026-05-26-full-meeting",
            "markdownUrl": "https://example.com/meetings/2026-05-26/full-meeting/index.md",
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
        ],
        "schemaVersion": "1.0.0",
        "totalCount": 1,
        "updatedAt": "2026-05-26",
      }
    `);
  });
});
