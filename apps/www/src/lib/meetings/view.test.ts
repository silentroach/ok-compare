import { describe, expect, it } from 'vitest';

import type { Meeting } from './types';
import {
  describeMeetingMeta,
  hasMeetingProtocol,
  hasMeetingRecording,
  hasMeetingSummary,
} from './view';

const meeting = (input?: Partial<Meeting>): Meeting => ({
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
  ...input,
});

describe('meeting HTML view helpers', () => {
  it('shows summary when editorial summary fields exist', () => {
    expect(hasMeetingSummary(meeting())).toBe(true);
    expect(
      hasMeetingSummary(meeting({ summary: '', highlights: ['Вывод'] })),
    ).toBe(true);
    expect(
      hasMeetingSummary(meeting({ summary: '', decisions: ['Решение'] })),
    ).toBe(true);
    expect(
      hasMeetingSummary(meeting({ summary: '', questions: ['Вопрос'] })),
    ).toBe(true);
    expect(hasMeetingSummary(meeting({ summary: '' }))).toBe(false);
  });

  it('hides optional protocol and recording sections until their data exists', () => {
    expect(hasMeetingProtocol(meeting())).toBe(false);
    expect(hasMeetingRecording(meeting())).toBe(false);

    expect(hasMeetingProtocol(meeting({ agenda: ['Повестка'] }))).toBe(true);
    expect(
      hasMeetingProtocol(
        meeting({
          documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
        }),
      ),
    ).toBe(false);
    expect(
      hasMeetingRecording(
        meeting({ recordingUrl: 'https://example.com/video' }),
      ),
    ).toBe(true);
    expect(
      hasMeetingRecording(
        meeting({
          transcript: {
            speakers: [],
            segments: [
              { start: '00:12:34', anchor: 't-00-12-34', text: 'Вопрос.' },
            ],
          },
        }),
      ),
    ).toBe(true);
  });

  it('keeps metadata to present fields only', () => {
    expect(
      describeMeetingMeta(
        meeting({
          format: 'Созвон',
          participants: ['Житель', 'ОК Комфорт'],
          sourceUrl: 'https://example.com/source',
        }),
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "label": "Дата",
          "value": "26 мая 2026",
        },
        {
          "label": "Формат",
          "value": "Созвон",
        },
        {
          "label": "Участники",
          "value": "Житель, ОК Комфорт",
        },
        {
          "href": "https://example.com/source",
          "label": "Источник",
          "value": "открыть источник",
        },
      ]
    `);
  });
});
