import { beforeAll, describe, expect, it } from 'vitest';

import type { MeetingEntry } from './load';
import type { RawMeetingTranscript } from './raw-schema';
import type { EntityMentionTarget, SiteMentionRegistry } from '../mentions';

let buildMeetingsDataset: typeof import('./load').buildMeetingsDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildMeetingsDataset } = await import('./load'));
});

const meeting = (input: {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly summary: string;
  readonly slug: string;
  readonly body?: string;
  readonly transcript?: string;
  readonly full?: boolean;
}): MeetingEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    title: input.title,
    date: input.date,
    summary: input.summary,
    slug: input.slug,
    format: input.full ? 'Созвон' : undefined,
    source_url: input.full ? 'https://example.com/source' : undefined,
    video_url: input.full ? 'https://video.example.com/recording' : undefined,
    transcript: input.transcript,
    highlights: input.full ? ['Короткий вывод'] : undefined,
    agenda: input.full ? ['Повестка'] : undefined,
    decisions: input.full ? ['Решение'] : undefined,
    action_items: input.full ? ['Действие'] : undefined,
    questions: input.full ? ['Вопрос'] : undefined,
    participants: input.full ? ['Участник'] : undefined,
    documents: input.full
      ? [{ title: 'Протокол', url: '/documents/protocol.pdf' }]
      : undefined,
  },
});

const transcript = (): RawMeetingTranscript => ({
  speakers: [
    { id: 'host', name: 'Ведущий', role: 'модератор' },
    { id: 'resident', name: 'Житель' },
  ],
  segments: [
    {
      start: '00:00:05',
      end: '00:00:15',
      speaker: 'host',
      text: 'Открываем встречу.',
    },
    {
      start: '00:12:34',
      speaker: 'resident',
      text: 'Когда будет ответ?',
    },
  ],
});

const personTarget: EntityMentionTarget = {
  type: 'person',
  slug: 'kschemelinin',
  label: 'Кирилл Щемелинин',
  htmlUrl: '/people/kschemelinin/',
  markdownUrl: '/people/kschemelinin/index.md',
};

const meetingTarget: EntityMentionTarget = {
  type: 'meeting',
  slug: '2026-05-26-full-meeting',
  label: 'Полная встреча',
  htmlUrl: '/meetings/2026-05-26/full-meeting/',
  markdownUrl: '/meetings/2026-05-26/full-meeting/index.md',
};

const registry = (
  ...targets: readonly EntityMentionTarget[]
): SiteMentionRegistry =>
  new Map(targets.map((target) => [target.slug, target]));

describe('buildMeetingsDataset', () => {
  it('maps a minimal meeting fixture to domain fields and stable URLs', () => {
    const data = buildMeetingsDataset([
      meeting({
        id: '2026-05-26/example-meeting',
        title: 'Встреча с жителями',
        date: '2026-05-26',
        summary: 'Краткое содержание встречи.',
        slug: 'example-meeting',
      }),
    ]);

    expect(data.meetings).toHaveLength(1);
    expect(data.meetings[0]).toMatchObject({
      id: '2026-05-26-example-meeting',
      routeId: '2026-05-26/example-meeting',
      date: '2026-05-26',
      slug: 'example-meeting',
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
      body: undefined,
      transcript: undefined,
    });
  });

  it('maps protocol fields, participants, documents and transcript segments', () => {
    const data = buildMeetingsDataset(
      [
        meeting({
          id: '2026-05-26/full-meeting',
          title: 'Полная встреча',
          date: '2026-05-26',
          summary: 'Все материалы встречи.',
          slug: 'full-meeting',
          body: 'Текст с хвостовыми пробелами.\n',
          transcript: 'transcript.yaml',
          full: true,
        }),
      ],
      {
        transcripts: new Map([
          ['2026-05-26/full-meeting/transcript.yaml', transcript()],
        ]),
      },
    );

    expect(data.meetings[0]).toMatchObject({
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
      body: 'Текст с хвостовыми пробелами.',
      transcript: {
        speakers: [
          { id: 'host', name: 'Ведущий', role: 'модератор' },
          { id: 'resident', name: 'Житель' },
        ],
        segments: [
          {
            start: '00:00:05',
            end: '00:00:15',
            anchor: 't-00-00-05',
            speaker: 'host',
            speakerLabel: 'Ведущий',
            text: 'Открываем встречу.',
          },
          {
            start: '00:12:34',
            anchor: 't-00-12-34',
            speaker: 'resident',
            speakerLabel: 'Житель',
            text: 'Когда будет ответ?',
          },
        ],
      },
    });
  });

  it('normalizes person mentions inside meeting body through the shared registry', () => {
    const data = buildMeetingsDataset(
      [
        meeting({
          id: '2026-05-26/full-meeting',
          title: 'Полная встреча',
          date: '2026-05-26',
          summary: 'Все материалы встречи.',
          slug: 'full-meeting',
          body: 'На встрече выступил @kschemelinin.',
        }),
      ],
      {
        mentionRegistry: registry(personTarget),
      },
    );

    expect(data.meetings[0]).toMatchObject({
      body: 'На встрече выступил [Кирилл Щемелинин](/people/kschemelinin/).',
      mentions: [personTarget],
    });
  });

  it('rejects meeting body self-links through the shared registry', () => {
    expect(() =>
      buildMeetingsDataset(
        [
          meeting({
            id: '2026-05-26/full-meeting',
            title: 'Полная встреча',
            date: '2026-05-26',
            summary: 'Все материалы встречи.',
            slug: 'full-meeting',
            body: 'Материалы самой @2026-05-26-full-meeting.',
          }),
        ],
        {
          mentionRegistry: registry(meetingTarget),
        },
      ),
    ).toThrow(
      'meeting "2026-05-26/full-meeting" body contains self entity mention "meeting:2026-05-26-full-meeting"',
    );
  });

  it('sorts meetings by date desc, title and id', () => {
    const data = buildMeetingsDataset([
      meeting({
        id: '2026-05-25/older',
        title: 'Старая',
        date: '2026-05-25',
        summary: 'Старая встреча.',
        slug: 'older',
      }),
      meeting({
        id: '2026-05-26/b-title',
        title: 'Бета',
        date: '2026-05-26',
        summary: 'Вторая встреча.',
        slug: 'b-title',
      }),
      meeting({
        id: '2026-05-26/a-title',
        title: 'Альфа',
        date: '2026-05-26',
        summary: 'Первая встреча.',
        slug: 'a-title',
      }),
    ]);

    expect(data.meetings.map((item) => item.id)).toEqual([
      '2026-05-26-a-title',
      '2026-05-26-b-title',
      '2026-05-25-older',
    ]);
  });

  it('rejects impossible meeting invariants with clear errors', () => {
    expect(() =>
      buildMeetingsDataset([
        meeting({
          id: '2026-05-26/wrong-slug',
          title: 'Несовпадение slug',
          date: '2026-05-26',
          summary: 'Ошибка.',
          slug: 'actual-slug',
        }),
      ]),
    ).toThrow('must match frontmatter slug');

    expect(() =>
      buildMeetingsDataset([
        meeting({
          id: '2026-05-26/needs-transcript',
          title: 'Нет расшифровки',
          date: '2026-05-26',
          summary: 'Ошибка.',
          slug: 'needs-transcript',
          transcript: 'transcript.yaml',
        }),
      ]),
    ).toThrow('references missing transcript');
  });

  it('rejects duplicate meeting ids and transcript anchors', () => {
    expect(() =>
      buildMeetingsDataset([
        meeting({
          id: '2026-05-26/same',
          title: 'Дубликат 1',
          date: '2026-05-26',
          summary: 'Первый.',
          slug: 'same',
        }),
        meeting({
          id: '2026-05-26/same',
          title: 'Дубликат 2',
          date: '2026-05-26',
          summary: 'Второй.',
          slug: 'same',
        }),
      ]),
    ).toThrow('duplicate meeting id "2026-05-26-same"');

    expect(() =>
      buildMeetingsDataset(
        [
          meeting({
            id: '2026-05-26/duplicate-anchor',
            title: 'Дубликат якоря',
            date: '2026-05-26',
            summary: 'Ошибка.',
            slug: 'duplicate-anchor',
            transcript: 'transcript.yaml',
          }),
        ],
        {
          transcripts: new Map([
            [
              '2026-05-26/duplicate-anchor/transcript.yaml',
              {
                segments: [
                  { start: '00:00:01', text: 'Первый.' },
                  { start: '00:00:01', text: 'Второй.' },
                ],
              },
            ],
          ]),
        },
      ),
    ).toThrow('duplicate transcript anchor "t-00-00-01"');
  });
});
