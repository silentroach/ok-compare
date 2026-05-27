import { beforeAll, describe, expect, it } from 'vitest';

import type { Meeting } from './types';

let buildMeetingMarkdown: typeof import('./markdown').buildMeetingMarkdown;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildMeetingMarkdown } = await import('./markdown'));
});

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

describe('buildMeetingMarkdown', () => {
  it('builds minimal meeting Markdown with metadata, summary and canonical links only', () => {
    const markdown = buildMeetingMarkdown(meeting());

    expect(markdown).toContain('title: Встреча с жителями');
    expect(markdown).toContain(
      'html_url: https://example.com/meetings/2026-05-26/example-meeting/',
    );
    expect(markdown).toContain(
      'markdown_url: https://example.com/meetings/2026-05-26/example-meeting/index.md',
    );
    expect(markdown).toContain('# Встреча с жителями');
    expect(markdown).toContain('## Смысл встречи');
    expect(markdown).toContain('Краткое содержание встречи.');
    expect(markdown).toContain(
      '[HTML-страница](https://example.com/meetings/2026-05-26/example-meeting/)',
    );
    expect(markdown).not.toContain('## Протокол');
    expect(markdown).not.toContain('## Запись и расшифровка');
    expect(markdown).not.toContain('## Документы и источники');
  });

  it('includes protocol fields, documents, links and transcript anchors', () => {
    const markdown = buildMeetingMarkdown(
      meeting({
        format: 'Созвон',
        sourceUrl: 'https://source.example.com/post',
        recordingUrl: 'https://video.example.com/recording',
        highlights: ['Короткий вывод'],
        agenda: ['Повестка'],
        decisions: ['Решение'],
        actionItems: ['Действие'],
        questions: ['Вопрос'],
        participants: ['Участник'],
        documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
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
      }),
    );

    expect(markdown).toContain('## Протокол');
    expect(markdown).toContain('### Решения');
    expect(markdown).toContain('- Решение');
    expect(markdown).toContain('### Открытые вопросы');
    expect(markdown).toContain('## Запись и расшифровка');
    expect(markdown).toContain(
      '[Открыть запись встречи](https://video.example.com/recording)',
    );
    expect(markdown).toContain('<a id="t-00-12-34"></a>');
    expect(markdown).toContain('00:12:34-00:13:00');
    expect(markdown).toContain('Ведущий: Ключевой фрагмент.');
    expect(markdown).toContain('## Документы и источники');
    expect(markdown).toContain(
      '[Протокол](https://example.com/documents/protocol.pdf)',
    );
    expect(markdown).toContain(
      '[Исходный материал](https://source.example.com/post)',
    );
  });
});
