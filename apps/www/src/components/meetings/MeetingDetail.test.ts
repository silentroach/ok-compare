/// <reference types="astro/client" />

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import type { Meeting } from '../../lib/meetings/types';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import MeetingDetail from './MeetingDetail.astro';

const astroSourceAttribute = /\sdata-astro-source-(?:file|loc)="[^"]*"/gu;
const normalizeHtml = (html: string): string =>
  html
    .replace(astroSourceAttribute, '')
    .replace(/>\s+</gu, '><')
    .replace(/</gu, '\n<')
    .trim();

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

describe('MeetingDetail', () => {
  it('hides empty optional protocol and recording blocks for minimal meetings', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MeetingDetail, {
      props: { meeting: meeting() },
    });

    expect(html).toContain('id="summary"');
    expect(html).not.toContain('id="protocol"');
    expect(html).not.toContain('id="recording"');
    expect(html).not.toContain('id="sources"');
  });

  it('renders protocol, documents, recording link and transcript anchors for full meetings', async () => {
    const container = await AstroContainer.create();
    const html = normalizeHtml(
      await container.renderToString(MeetingDetail, {
        props: {
          meeting: meeting({
            format: 'Очная встреча',
            sourceUrl: 'https://example.com/source',
            recordingUrl: 'https://video.example.com/recording',
            highlights: ['Главный вывод'],
            agenda: ['Повестка'],
            decisions: ['Решение'],
            actionItems: ['Действие'],
            questions: ['Открытый вопрос'],
            participants: ['Житель', 'ОК Комфорт'],
            documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
            transcript: {
              speakers: [{ id: 'host', name: 'Ведущий' }],
              segments: [
                {
                  start: '00:12:34',
                  anchor: 't-00-12-34',
                  speaker: 'host',
                  speakerLabel: 'Ведущий',
                  text: 'Когда будет ответ?',
                },
              ],
            },
          }),
        },
      }),
    );

    expect(html).toContain('id="summary"');
    expect(html).toContain('id="protocol"');
    expect(html).toContain('id="recording"');
    expect(html).toContain('href="https://video.example.com/recording"');
    expect(html).toContain('href="/documents/protocol.pdf"');
    expect(html).toContain('id="t-00-12-34"');
    expect(html).toContain(
      'aria-label="Перейти к фрагменту расшифровки 00:12:34"',
    );
  });

  it('does not render protocol copy for documents-only meetings', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MeetingDetail, {
      props: {
        meeting: meeting({
          summary: '',
          documents: [{ title: 'Протокол', url: '/documents/protocol.pdf' }],
        }),
      },
    });

    expect(html).not.toContain('id="protocol"');
    expect(html).not.toContain('Повестка, решения и открытые вопросы');
  });
});
