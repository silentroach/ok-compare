import { describe, expect, it } from 'vitest';

import { RawMeetingSchema, RawMeetingTranscriptSchema } from './raw-schema';

const validMeeting = {
  title: 'Встреча ОК Комфорт с жителями КП Шелково',
  date: '13.06.2026 16:00',
  context: 'Встреча управляющей компании с жителями.',
};

const validTranscript = {
  speakers: {
    moderator: {
      name: 'Модератор',
    },
    ykizilov: {
      person: 'ykizilov',
    },
  },
  segments: [
    {
      start: '00:00:00',
      speaker: 'moderator',
      text: 'Добрый день.\nНачинаем встречу.',
    },
  ],
};

describe('RawMeetingSchema', () => {
  it('accepts a minimal valid meeting', () => {
    expect(RawMeetingSchema.parse(validMeeting)).toEqual(validMeeting);
  });

  it('accepts and trims supported date and text inputs', () => {
    expect(
      RawMeetingSchema.parse({
        title: ' Встреча ',
        date: '2026-06-13',
        context: ' Контекст ',
        updated_at: new Date('2026-06-14T00:00:00.000Z'),
        source_url: ' https://example.com/source ',
      }),
    ).toMatchObject({
      title: 'Встреча',
      date: '2026-06-13',
      context: 'Контекст',
      updated_at: '2026-06-14',
      source_url: 'https://example.com/source',
    });
  });

  it('rejects blank title and context', () => {
    expect(() =>
      RawMeetingSchema.parse({ ...validMeeting, title: ' ' }),
    ).toThrow();

    expect(() =>
      RawMeetingSchema.parse({ ...validMeeting, context: ' ' }),
    ).toThrow();
  });

  it('rejects invalid URL', () => {
    expect(() =>
      RawMeetingSchema.parse({ ...validMeeting, source_url: '/source' }),
    ).toThrow();
  });

  it('rejects unsupported meeting fields', () => {
    expect(() =>
      RawMeetingSchema.parse({ ...validMeeting, decisions: [] }),
    ).toThrow();

    expect(() =>
      RawMeetingSchema.parse({ ...validMeeting, protocol: 'Итоги встречи' }),
    ).toThrow();
  });
});

describe('RawMeetingTranscriptSchema', () => {
  it('accepts a transcript with one local speaker and one person speaker', () => {
    expect(RawMeetingTranscriptSchema.parse(validTranscript)).toEqual(
      validTranscript,
    );
  });

  it('trims segment text while preserving internal line breaks', () => {
    expect(
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        segments: [
          {
            start: '00:00:00',
            speaker: 'moderator',
            text: '  Первая строка.\n\nВторая строка.  ',
          },
        ],
      }).segments[0]?.text,
    ).toBe('Первая строка.\n\nВторая строка.');
  });

  it('rejects blank text', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        segments: [{ start: '00:00:00', speaker: 'moderator', text: ' ' }],
      }),
    ).toThrow();
  });

  it('rejects invalid time strings', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        segments: [{ start: '00:60:00', speaker: 'moderator', text: 'Текст' }],
      }),
    ).toThrow();
  });

  it('rejects unsupported segment fields', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        segments: [
          {
            start: '00:00:00',
            end: '00:00:12',
            speaker: 'moderator',
            text: 'Текст',
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects a speaker object that has both person and name', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        speakers: {
          speaker: {
            person: 'ykizilov',
            name: 'Юрий Кизилов',
          },
        },
      }),
    ).toThrow();
  });

  it('rejects a speaker object that has neither person nor name', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        speakers: {
          speaker: {},
        },
      }),
    ).toThrow();
  });

  it('rejects invalid speaker ids and empty transcript roots', () => {
    expect(() =>
      RawMeetingTranscriptSchema.parse({
        ...validTranscript,
        speakers: {
          Moderator: {
            name: 'Модератор',
          },
        },
      }),
    ).toThrow();

    expect(() =>
      RawMeetingTranscriptSchema.parse({ ...validTranscript, speakers: {} }),
    ).toThrow();

    expect(() =>
      RawMeetingTranscriptSchema.parse({ ...validTranscript, segments: [] }),
    ).toThrow();
  });
});
