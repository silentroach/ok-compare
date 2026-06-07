import { describe, expect, it } from 'vitest';

import type { Meeting, MeetingMoment, MeetingTranscriptTime } from './types';
import {
  describeMeeting,
  formatMeetingDate,
  formatMeetingMetaDate,
  formatMeetingSpeakerAnchor,
  formatTranscriptTextHtml,
  formatTranscriptTime,
} from './view';

const moment = (input: {
  readonly iso: string;
  readonly hasTime: boolean;
}): MeetingMoment => ({
  at: new Date(input.iso),
  iso: input.iso,
  hasTime: input.hasTime,
});

const transcriptTime = (value: string): MeetingTranscriptTime => ({
  value,
  totalSeconds: 0,
});

const meeting = (input?: {
  readonly context?: string;
  readonly sourceUrl?: string;
  readonly date?: MeetingMoment;
}): Meeting => ({
  id: '2026-06-13-ok-comfort',
  slug: '2026-06-13-ok-comfort',
  title: 'Встреча ОК Комфорт с жителями КП Шелково',
  date:
    input?.date ??
    moment({
      iso: '2026-06-13T16:00:00+03:00',
      hasTime: true,
    }),
  context:
    input?.context ??
    'Встреча управляющей компании с жителями о сезонных работах, тарифе и финансовых вопросах.',
  sourceUrl: input?.sourceUrl,
  url: '/meetings/2026-06-13-ok-comfort/',
  canonical: 'https://example.com/meetings/2026-06-13-ok-comfort/',
  transcript: {
    speakers: [],
    segments: [],
  },
});

describe('meeting view helpers', () => {
  it('formats visible dates with Russian style and optional time', () => {
    expect(
      formatMeetingDate(
        moment({
          iso: '2026-06-13T16:00:00+03:00',
          hasTime: true,
        }),
      ),
    ).toBe('13 июня 2026, 16:00');

    expect(
      formatMeetingDate(
        moment({
          iso: '2026-06-13T00:00:00+03:00',
          hasTime: false,
        }),
      ),
    ).toBe('13 июня 2026');
  });

  it('formats meta dates as ISO with time or date-only value', () => {
    expect(
      formatMeetingMetaDate(
        moment({
          iso: '2026-06-13T16:00:00+03:00',
          hasTime: true,
        }),
      ),
    ).toBe('2026-06-13T16:00:00+03:00');

    expect(
      formatMeetingMetaDate(
        moment({
          iso: '2026-06-13T00:00:00+03:00',
          hasTime: false,
        }),
      ),
    ).toBe('2026-06-13');
  });

  it('builds a description from meeting context and keeps it within 170 chars', () => {
    const context =
      'Встреча управляющей компании с жителями о сезонных работах, тарифе, финансовых вопросах, заявках, обслуживании поселка и дальнейшей работе с обращениями.';
    const description = describeMeeting(meeting({ context }));

    expect(description.startsWith(context.slice(0, 40))).toBe(true);
    expect(description.length).toBeLessThanOrEqual(170);

    expect(describeMeeting(meeting({ context: 'а'.repeat(200) })).length).toBe(
      170,
    );
  });

  it('adds a factual transcript phrase when context is short', () => {
    expect(
      describeMeeting(
        meeting({
          context: 'Встреча с жителями.',
          sourceUrl: 'https://example.com/source',
        }),
      ),
    ).toBe(
      'Встреча с жителями. Полная транскрипция встречи с временными отметками и ссылкой на источник.',
    );
  });

  it('formats transcript time and speaker anchors consistently', () => {
    expect(formatTranscriptTime(transcriptTime('00:12:34'))).toBe('00:12:34');
    expect(formatMeetingSpeakerAnchor({ id: 'ykizilov' })).toBe(
      'speaker-ykizilov',
    );
  });

  it('escapes script and HTML-looking transcript text', () => {
    const html = formatTranscriptTextHtml(
      '<script>alert("x")</script> <a href="https://example.com?a=1&b=2">link</a>',
    );

    expect(html).toContain('&lt;script&gt;alert');
    expect(html).toContain('&lt;/script&gt;');
    expect(html).toContain(
      '&lt;a href=&quot;https://example.com?a=1&amp;b=2&quot;&gt;link&lt;/a&gt;',
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<a href=');
  });

  it('keeps ampersands and quotes safe while applying typography', () => {
    const html = formatTranscriptTextHtml('Компания "ОК" & жители');

    expect(html).toContain('«ОК»');
    expect(html).toContain('&amp;');
  });

  it('preserves internal line breaks as br tags', () => {
    expect(formatTranscriptTextHtml('Первая строка\nВторая строка')).toBe(
      'Первая строка<br>Вторая строка',
    );
  });
});
