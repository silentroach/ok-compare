import { describe, expect, it } from 'vitest';

import { buildNewsArticleMarkdown, buildNewsMonthMarkdown } from './markdown';
import type { NewsArticle } from './schema';

const article = (input?: Partial<NewsArticle>): NewsArticle => ({
  id: '2026/05/ktp-upgrade',
  title: 'Россети планируют усилить три подстанции в КП Шелково',
  author: {
    id: 'ig',
    name: 'Инициативная группа',
    kind: 'community',
  },
  year: 2026,
  month: 5,
  day: 14,
  entry: 'ktp-upgrade',
  url: '/news/2026/05/ktp-upgrade/',
  markdown_url: '/news/2026/05/ktp-upgrade/index.md',
  canonical: 'https://example.com/news/2026/05/ktp-upgrade/',
  published_at: new Date('2026-05-14T19:16:00.000Z'),
  published_iso: '2026-05-14T22:16:00+03:00',
  time: '22:16',
  applies_to_all_areas: false,
  areas: ['park', 'village'],
  tags: [
    {
      label: 'электричество',
      key: 'электричество',
      url: '/news/tags/электричество/',
    },
  ],
  pinned: false,
  source_url: 'https://example.com/source',
  photos: [],
  attachments: [],
  events: [],
  addenda: [],
  summary: 'Краткое описание новости.',
  body: 'Текст новости.',
  has_addenda: false,
  mentions: [],
  ...input,
});

describe('buildNewsArticleMarkdown', () => {
  it('puts article metadata into YAML frontmatter without officialness flags', () => {
    const markdown = buildNewsArticleMarkdown(article());

    expect(markdown).toContain(`---
title: "Россети планируют усилить три подстанции в КП Шелково"
summary: "Краткое описание новости."
published_at: "2026-05-14T22:16:00+03:00"
author:
  id: "ig"
  name: "Инициативная группа"
  kind: "community"
areas:
  - "Шелково Парк"
  - "Шелково Вилладж"
tags:
  - "электричество"
source_url: "https://example.com/source"
---`);
    expect(markdown).not.toContain('Официальность');
    expect(markdown).not.toContain('is_official');
    expect(markdown).not.toContain('Areas');
    expect(markdown).not.toContain('## Текст новости');
    expect(markdown).toContain(
      '# Россети планируют усилить три подстанции в КП Шелково\n\nТекст новости.',
    );
  });

  it('omits settlement-wide areas and combines addendum date with time', () => {
    const markdown = buildNewsArticleMarkdown(
      article({
        applies_to_all_areas: true,
        areas: ['river', 'forest', 'park', 'village'],
        addenda: [
          {
            author: {
              id: 'ok-comfort',
              name: 'ОК Комфорт',
              kind: 'official',
            },
            time: '23:00',
            photos: [],
            attachments: [],
            published_at: new Date('2026-05-14T20:00:00.000Z'),
            published_iso: '2026-05-14T23:00:00+03:00',
            mentions: [],
          },
        ],
        has_addenda: true,
      }),
    );

    expect(markdown).not.toContain('\nareas:\n');
    expect(markdown).toContain('### Дополнение 1 от 14 мая 2026, 23:00');
    expect(markdown).toContain('- Дата: 14 мая 2026, 23:00');
    expect(markdown).not.toContain('- Время:');
  });

  it('keeps month archives without a redundant news subsection', () => {
    expect(
      buildNewsMonthMarkdown({
        archive: {
          id: '2026/05',
          year: 2026,
          month: 5,
          url: '/news/2026/05/',
          markdown_url: '/news/2026/05/index.md',
          count: 1,
          articles: [article()],
        },
      }),
    ).toMatchInlineSnapshot(`
      "# Новости Шелково за май 2026 г.

      - [Россети планируют усилить три подстанции в КП Шелково](https://kpshelkovo.online/news/2026/05/ktp-upgrade/index.md) — 14 мая 2026, 22:16
        Краткое описание новости.

      "
    `);
  });
});
