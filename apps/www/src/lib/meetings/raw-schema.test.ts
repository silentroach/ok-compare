import { describe, expect, it } from 'vitest';

import {
  RawMeetingFrontmatterSchema,
  RawMeetingTranscriptSchema,
} from './raw-schema';

const validMeeting = {
  title: 'Встреча с жителями',
  date: '2026-05-26',
  slug: 'example-meeting',
  summary: 'Короткий итог встречи.',
};

describe('RawMeetingFrontmatterSchema', () => {
  it('accepts the first-version meeting source contract', () => {
    expect(
      RawMeetingFrontmatterSchema.parse({
        ...validMeeting,
        format: 'online',
        source_url: 'https://example.com/source',
        video_url: 'https://example.com/video',
        video_embed_url: 'https://example.com/embed',
        transcript: 'transcript.yaml',
        highlights: ['Главный вывод'],
        agenda: ['Повестка'],
        decisions: ['Решение'],
        action_items: ['Действие'],
        questions: ['Вопрос'],
        participants: ['Участник'],
        documents: [
          {
            title: 'Документ',
            url: '/documents/example.pdf',
          },
        ],
      }),
    ).toMatchObject(validMeeting);
  });

  it('rejects blank required text', () => {
    const result = RawMeetingFrontmatterSchema.safeParse({
      ...validMeeting,
      title: '   ',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['title'],
        }),
      ]),
    );
  });

  it('rejects unsupported MVP fields', () => {
    const result = RawMeetingFrontmatterSchema.safeParse({
      ...validMeeting,
      audio_url: 'https://example.com/audio.mp3',
      related_news: ['2026/05/example'],
      timestamps: ['00:00:01'],
    });

    expect(result.success).toBe(false);
  });
});

describe('RawMeetingTranscriptSchema', () => {
  it('validates speakers and segments', () => {
    expect(
      RawMeetingTranscriptSchema.parse({
        speakers: [
          {
            id: 'host',
            name: 'Ведущий',
          },
        ],
        segments: [
          {
            start: '00:00:01',
            end: '00:00:05',
            speaker: 'host',
            text: 'Начало встречи.',
          },
        ],
      }),
    ).toMatchObject({
      segments: [
        {
          start: '00:00:01',
          text: 'Начало встречи.',
        },
      ],
    });
  });

  it('rejects invalid timecodes and blank segment text', () => {
    const result = RawMeetingTranscriptSchema.safeParse({
      segments: [
        {
          start: '00:01',
          text: '   ',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['segments', 0, 'start'],
        }),
        expect.objectContaining({
          path: ['segments', 0, 'text'],
        }),
      ]),
    );
  });

  it('rejects impossible minute and second values in timecodes', () => {
    const result = RawMeetingTranscriptSchema.safeParse({
      segments: [
        {
          start: '00:99:99',
          text: 'Начало встречи.',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['segments', 0, 'start'],
        }),
      ]),
    );
  });
});
