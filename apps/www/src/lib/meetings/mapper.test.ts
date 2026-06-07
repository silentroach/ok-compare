import { beforeAll, describe, expect, it } from 'vitest';

import type { SiteMentionRegistry } from '@/lib/mentions';
import type { createPersonMentionTarget as createPersonMentionTargetType } from '@/lib/people/mentions';

import type {
  RawMeetingTranscriptEntryInput,
  mapRawMeeting as mapRawMeetingType,
} from './mapper';
import type { RawMeeting, RawMeetingTranscript } from './raw-schema';

let mapRawMeeting: typeof mapRawMeetingType;
let createPersonMentionTarget: typeof createPersonMentionTargetType;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ mapRawMeeting } = await import('./mapper'));
  ({ createPersonMentionTarget } = await import('@/lib/people/mentions'));
});

const meeting = (data?: Partial<RawMeeting>) => ({
  id: '2026-06-13-ok-comfort',
  data: {
    title: 'Встреча ОК Комфорт с жителями КП Шелково',
    date: '13.06.2026 16:00',
    context: 'Встреча управляющей компании с жителями.',
    speakers: {
      moderator: {
        name: 'Модератор',
      },
    },
    ...data,
  },
});

const transcript = (
  data?: Partial<RawMeetingTranscript>,
  part = 1,
): RawMeetingTranscriptEntryInput => ({
  id: '2026-06-13-ok-comfort',
  part,
  data: {
    segments: [
      {
        start: '00:00:00',
        speaker: 'moderator',
        text: 'Добрый день.',
      },
    ],
    ...data,
  },
});

const map = (input?: {
  readonly meeting?: Partial<RawMeeting>;
  readonly transcript?: Partial<RawMeetingTranscript>;
  readonly transcriptParts?: readonly RawMeetingTranscriptEntryInput[];
  readonly mentionRegistry?: SiteMentionRegistry;
}) =>
  mapRawMeeting(
    meeting(input?.meeting),
    input?.transcriptParts ?? [transcript(input?.transcript)],
    {
      mentionRegistry: input?.mentionRegistry ?? new Map(),
    },
  );

describe('mapRawMeeting', () => {
  it('maps a minimal meeting with a local speaker', () => {
    const result = map({
      meeting: {
        source_urls: ['https://example.com/source'],
      },
    });

    expect(result).toMatchObject({
      id: '2026-06-13-ok-comfort',
      slug: '2026-06-13-ok-comfort',
      title: 'Встреча ОК Комфорт с жителями КП Шелково',
      date: {
        iso: '2026-06-13T16:00:00+03:00',
        hasTime: true,
      },
      context: 'Встреча управляющей компании с жителями.',
      sourceUrls: ['https://example.com/source'],
      url: '/meetings/2026-06-13-ok-comfort/',
      canonical: 'https://example.com/meetings/2026-06-13-ok-comfort/',
      transcript: {
        speakers: [
          {
            id: 'moderator',
            kind: 'local',
            label: 'Модератор',
          },
        ],
        parts: [
          {
            index: 1,
          },
        ],
        segments: [
          {
            anchor: 't-00-00-00',
            start: {
              value: '00:00:00',
              totalSeconds: 0,
            },
            speakerId: 'moderator',
            text: 'Добрый день.',
          },
        ],
      },
    });
  });

  it('resolves a person speaker through the mention registry', () => {
    const result = map({
      meeting: {
        speakers: {
          ykizilov: {
            person: 'ykizilov',
          },
        },
      },
      transcript: {
        segments: [
          {
            start: '00:00:00',
            speaker: 'ykizilov',
            text: 'Спасибо, что пришли.',
          },
        ],
      },
      mentionRegistry: new Map([
        [
          'ykizilov',
          createPersonMentionTarget(
            'ykizilov',
            'Юрий Кизилов',
            undefined,
            'ОК "Комфорт"',
            'Руководитель',
          ),
        ],
      ]),
    });

    expect(result.transcript.speakers[0]).toEqual({
      id: 'ykizilov',
      kind: 'person',
      label: 'Юрий Кизилов',
      description: 'Руководитель, ОК "Комфорт"',
      personSlug: 'ykizilov',
      url: '/people/ykizilov/',
    });
  });

  it('maps local speaker descriptions and person description overrides', () => {
    const result = map({
      meeting: {
        speakers: {
          moderator: {
            name: 'Модератор',
            description: 'Участник инициативной группы',
          },
          ykizilov: {
            person: 'ykizilov',
            description: 'Директор ОК Комфорт',
          },
        },
      },
      transcript: {
        segments: [
          {
            start: '00:00:00',
            speaker: 'moderator',
            text: 'Добрый день.',
          },
          {
            start: '00:00:10',
            speaker: 'ykizilov',
            text: 'Спасибо, что пришли.',
          },
        ],
      },
      mentionRegistry: new Map([
        [
          'ykizilov',
          createPersonMentionTarget(
            'ykizilov',
            'Юрий Кизилов',
            undefined,
            'ОК "Комфорт"',
            'Руководитель',
          ),
        ],
      ]),
    });

    expect(result.transcript.speakers).toMatchObject([
      {
        id: 'moderator',
        kind: 'local',
        label: 'Модератор',
        description: 'Участник инициативной группы',
      },
      {
        id: 'ykizilov',
        kind: 'person',
        label: 'Юрий Кизилов',
        description: 'Директор ОК Комфорт',
      },
    ]);
  });

  it('rejects an unknown person speaker', () => {
    expect(() =>
      map({
        meeting: {
          speakers: {
            ykizilov: {
              person: 'ykizilov',
            },
          },
        },
      }),
    ).toThrow('unknown person "ykizilov"');
  });

  it('rejects a segment with an unknown speaker id', () => {
    expect(() =>
      map({
        transcript: {
          segments: [
            {
              start: '00:00:00',
              speaker: 'missing',
              text: 'Реплика.',
            },
          ],
        },
      }),
    ).toThrow('unknown speaker "missing"');
  });

  it('rejects decreasing segment starts', () => {
    expect(() =>
      map({
        transcript: {
          segments: [
            {
              start: '00:00:00',
              speaker: 'moderator',
              text: 'Начало.',
            },
            {
              start: '00:00:10',
              speaker: 'moderator',
              text: 'Первая реплика.',
            },
            {
              start: '00:00:09',
              speaker: 'moderator',
              text: 'Вторая реплика.',
            },
          ],
        },
      }),
    ).toThrow('start cannot be earlier than previous segment');
  });

  it('generates duplicate anchors with deterministic suffixes', () => {
    const result = map({
      transcript: {
        segments: [
          {
            start: '00:00:00',
            speaker: 'moderator',
            text: 'Начало.',
          },
          {
            start: '00:12:34',
            speaker: 'moderator',
            text: 'Первая реплика.',
          },
          {
            start: '00:12:34',
            speaker: 'moderator',
            text: 'Вторая реплика.',
          },
          {
            start: '00:12:34',
            speaker: 'moderator',
            text: 'Третья реплика.',
          },
        ],
      },
    });

    expect(result.transcript.segments.map((segment) => segment.anchor)).toEqual(
      ['t-00-00-00', 't-00-12-34', 't-00-12-34-2', 't-00-12-34-3'],
    );
  });

  it('rejects transcript parts that do not start from zero', () => {
    expect(() =>
      map({
        transcript: {
          segments: [
            {
              start: '00:00:01',
              speaker: 'moderator',
              text: 'Запись начинается не с нуля.',
            },
          ],
        },
      }),
    ).toThrow('meeting transcript must start at 00:00:00');

    expect(() =>
      map({
        transcriptParts: [
          transcript(undefined, 1),
          transcript(
            {
              segments: [
                {
                  start: '00:00:01',
                  speaker: 'moderator',
                  text: 'Вторая запись начинается не с нуля.',
                },
              ],
            },
            2,
          ),
        ],
      }),
    ).toThrow('meeting transcript part 2 must start at 00:00:00');
  });

  it('maps explicit transcript parts and resets time ordering per part', () => {
    const result = map({
      transcriptParts: [
        transcript(
          {
            segments: [
              {
                start: '00:00:00',
                speaker: 'moderator',
                text: 'Первая часть начинается.',
              },
              {
                start: '00:05:00',
                speaker: 'moderator',
                text: 'Первая часть продолжается.',
              },
            ],
          },
          1,
        ),
        transcript(
          {
            segments: [
              {
                start: '00:00:00',
                speaker: 'moderator',
                text: 'Вторая часть начинается.',
              },
            ],
          },
          2,
        ),
      ],
    });

    expect(result.transcript.parts).toHaveLength(2);
    expect(result.transcript.parts[1]?.segments[0]?.start.value).toBe(
      '00:00:00',
    );
    expect(result.transcript.segments.map((segment) => segment.anchor)).toEqual(
      ['t-00-00-00', 't-00-05-00', 't-00-00-00-2'],
    );
  });

  it('keeps @slug text plain inside transcript segments', () => {
    const result = map({
      transcript: {
        segments: [
          {
            start: '00:00:00',
            speaker: 'moderator',
            text: 'Как сказал @ykizilov, начинаем.',
          },
        ],
      },
      mentionRegistry: new Map([
        ['ykizilov', createPersonMentionTarget('ykizilov', 'Юрий Кизилов')],
      ]),
    });

    expect(result.transcript.segments[0]?.text).toBe(
      'Как сказал @ykizilov, начинаем.',
    );
  });

  it('rejects updated_at earlier than date', () => {
    expect(() =>
      map({
        meeting: {
          date: '13.06.2026 16:00',
          updated_at: '13.06.2026 15:59',
        },
      }),
    ).toThrow('updated_at cannot be earlier than date');
  });
});
