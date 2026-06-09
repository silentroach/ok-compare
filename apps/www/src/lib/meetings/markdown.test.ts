import { beforeAll, describe, expect, it } from 'vitest';

import type { Meeting, MeetingMoment, MeetingTranscriptTime } from './types';

let buildMeetingMarkdown: typeof import('./markdown').buildMeetingMarkdown;
let buildMeetingsIndexMarkdown: typeof import('./markdown').buildMeetingsIndexMarkdown;
let buildMeetingTranscriptPartMarkdown: typeof import('./markdown').buildMeetingTranscriptPartMarkdown;

const moment = (input: {
  readonly iso: string;
  readonly hasTime: boolean;
}): MeetingMoment => ({
  at: new Date(input.iso),
  iso: input.iso,
  hasTime: input.hasTime,
});

const time = (value: string, totalSeconds: number): MeetingTranscriptTime => ({
  value,
  totalSeconds,
});

const meeting = (): Meeting => {
  const speaker = {
    id: 'moderator',
    kind: 'local' as const,
    label: 'Модератор',
    description: 'участник встречи',
  };
  const first = {
    anchor: 't-00-00-00',
    start: time('00:00:00', 0),
    speakerId: speaker.id,
    speaker,
    text: 'Добрый день. Начинаем встречу.',
  };
  const second = {
    anchor: 't-00-00-15',
    start: time('00:00:15', 15),
    speakerId: speaker.id,
    speaker,
    text: 'Полный текст второй реплики хранится только в файле части.',
  };
  const third = {
    anchor: 't-00-00-00-2',
    start: time('00:00:00', 0),
    speakerId: speaker.id,
    speaker,
    text: 'Вторая часть начинается заново с нуля.',
  };

  return {
    id: '2026-06-13-ok-comfort',
    slug: '2026-06-13-ok-comfort',
    title: 'Встреча ОК Комфорт с жителями КП Шелково',
    date: moment({ iso: '2026-06-13T16:00:00+03:00', hasTime: true }),
    context:
      'Встреча управляющей компании с жителями о сезонных работах, тарифе и финансовых вопросах.',
    sourceUrls: [
      'https://example.com/source-1',
      'https://example.com/source-2',
    ],
    url: '/meetings/2026-06-13-ok-comfort/',
    canonical: 'https://example.com/meetings/2026-06-13-ok-comfort/',
    transcript: {
      speakers: [speaker],
      parts: [
        { index: 1, segments: [first, second] },
        { index: 2, segments: [third] },
      ],
      segments: [first, second, third],
    },
  };
};

describe('meetings markdown', () => {
  beforeAll(async () => {
    Object.assign(import.meta.env, {
      SITE: 'https://example.com',
      BASE_URL: '/',
    });

    ({
      buildMeetingMarkdown,
      buildMeetingsIndexMarkdown,
      buildMeetingTranscriptPartMarkdown,
    } = await import('./markdown'));
  });

  it('builds a compact section index without transcript text', () => {
    const markdown = buildMeetingsIndexMarkdown([meeting()]);

    expect(markdown).toContain('# Архив встреч');
    expect(markdown).toContain('## Сводка');
    expect(markdown).toContain('## Встречи');
    expect(markdown).toContain(
      'https://example.com/meetings/2026-06-13-ok-comfort/index.md',
    );
    expect(markdown).toContain('/meetings/[slug]/transcript/[part].md');
    expect(markdown).not.toContain('Полный текст второй реплики');
    expect(markdown).not.toMatch(/manifest/iu);
  });

  it('builds a meeting description that links transcript parts instead of embedding them', () => {
    const item = meeting();
    const markdown = buildMeetingMarkdown(item);

    expect(markdown).toContain('# Встреча ОК Комфорт с жителями КП Шелково');
    expect(markdown).toContain('## Ссылки');
    expect(markdown).toContain('## Метаданные');
    expect(markdown).toContain('## Участники');
    expect(markdown).toContain('## Файлы транскрипта');
    expect(markdown).toContain(
      'https://example.com/meetings/2026-06-13-ok-comfort/transcript/1.md',
    );
    expect(markdown).toContain('Часть 1');
    expect(markdown).toContain('Источник записи 1');
    expect(markdown).toContain('https://example.com/source-1');
    expect(markdown).toContain('Источник записи 2');
    expect(markdown).toContain('https://example.com/source-2');
    expect(markdown).not.toContain('Полный текст второй реплики');
    expect(markdown).not.toMatch(/manifest/iu);
  });

  it('builds one transcript part with html anchors and adjacent navigation', () => {
    const item = meeting();
    const markdown = buildMeetingTranscriptPartMarkdown(
      item,
      item.transcript.parts[0]!,
    );

    expect(markdown).toContain('## Навигация');
    expect(markdown).toContain('## Транскрипт');
    expect(markdown).toContain(
      'https://example.com/meetings/2026-06-13-ok-comfort/#t-00-00-15',
    );
    expect(markdown).toContain(
      'https://example.com/meetings/2026-06-13-ok-comfort/transcript/2.md',
    );
    expect(markdown).toContain('Полный текст второй реплики');
    expect(markdown).not.toMatch(/manifest/iu);
  });

  it('preserves markdown blocks inside transcript segment text', () => {
    const item = meeting();
    const segment = item.transcript.parts[0]!.segments[1]!;
    const part = {
      ...item.transcript.parts[0]!,
      segments: [
        {
          ...segment,
          text: 'Категории:\n\n- Первая.\n- Вторая.\n- Третья.',
        },
      ],
    };

    expect(buildMeetingTranscriptPartMarkdown(item, part)).toMatch(
      /Категории:\n\n\s+- Первая\.\n\s+- Вторая\.\n\s+- Третья\./u,
    );
  });
});
