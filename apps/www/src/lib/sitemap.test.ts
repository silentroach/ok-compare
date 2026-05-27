import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ChangeFreqEnum } from '@astrojs/sitemap';
import { describe, expect, it } from 'vitest';

import {
  applySitemapMetadata,
  buildSitemapMetadataIndex,
  isSitemapPageAllowed,
} from './sitemap';

const sourceText = (path: string): string =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

describe('buildSitemapMetadataIndex', () => {
  it('uses publication and update dates for news pages and archives', () => {
    const index = buildSitemapMetadataIndex({
      newsArticles: [
        {
          url: '/news/2026/05/first/',
          publishedIso: '2026-05-02T10:00:00+03:00',
          updatedIso: '2026-05-04T12:30:00+03:00',
          year: 2026,
          month: 5,
          tags: [{ url: '/news/tags/дороги/' }],
        },
        {
          url: '/news/2026/04/older/',
          publishedIso: '2026-04-20T09:00:00+03:00',
          year: 2026,
          month: 4,
          tags: [{ url: '/news/tags/дороги/' }],
        },
      ],
      statusIncidents: [],
      settlements: [],
      meetings: [],
    });

    expect({
      home: index.get('/'),
      firstArticle: index.get('/news/2026/05/first/'),
      olderArticle: index.get('/news/2026/04/older/'),
      monthArchive: index.get('/news/2026/05/'),
      tag: index.get('/news/tags/дороги/'),
    }).toMatchInlineSnapshot(`
      {
        "firstArticle": {
          "changefreq": "monthly",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "home": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "monthArchive": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "olderArticle": {
          "changefreq": "monthly",
          "lastmod": "2026-04-20T09:00:00+03:00",
        },
        "tag": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
      }
    `);
  });

  it('uses incident end/start dates and settlement source check dates', () => {
    const index = buildSitemapMetadataIndex({
      newsArticles: [],
      statusIncidents: [
        {
          url: '/status/incidents/2026/05/electricity/',
          service: 'electricity',
          startedIso: '2026-05-01T08:00:00+03:00',
          endedIso: '2026-05-01T09:00:00+03:00',
          hasPage: true,
        },
        {
          url: '/status/incidents/2026/05/water/',
          service: 'water',
          startedIso: '2026-05-03T14:00:00+03:00',
          hasPage: false,
        },
      ],
      settlements: [
        {
          slug: 'river',
          sources: [
            { dateChecked: '2026-04-03' },
            { dateChecked: '2026-04-12' },
          ],
        },
        {
          slug: 'forest',
          sources: [{ dateChecked: '2026-03-10' }],
        },
      ],
      meetings: [],
    });

    expect({
      home: index.get('/'),
      electricityService: index.get('/status/electricity/'),
      electricityIncident: index.get('/status/incidents/2026/05/electricity/'),
      compareHome: index.get('/815/compare/'),
      compareRating: index.get('/815/compare/rating/'),
      riverSettlement: index.get('/815/compare/settlements/river/'),
    }).toMatchInlineSnapshot(`
      {
        "compareHome": {
          "changefreq": "monthly",
          "lastmod": "2026-04-12",
        },
        "compareRating": {
          "changefreq": "yearly",
        },
        "electricityIncident": {
          "changefreq": "yearly",
          "lastmod": "2026-05-01T09:00:00+03:00",
        },
        "electricityService": {
          "changefreq": "hourly",
          "lastmod": "2026-05-01T09:00:00+03:00",
        },
        "home": {
          "changefreq": "daily",
          "lastmod": "2026-05-03T14:00:00+03:00",
        },
        "riverSettlement": {
          "changefreq": "monthly",
          "lastmod": "2026-04-12",
        },
      }
    `);
    expect(index.has('/status/incidents/2026/05/water/')).toBe(false);
  });

  it('includes meeting detail pages without promoting the meetings index', () => {
    const index = buildSitemapMetadataIndex({
      newsArticles: [],
      statusIncidents: [],
      settlements: [],
      meetings: [
        {
          url: '/meetings/2026-05-27/public-hearing/',
          date: '2026-05-27',
        },
      ],
    });

    expect({
      meetingsIndex: index.get('/meetings/'),
      detail: index.get('/meetings/2026-05-27/public-hearing/'),
      markdown: index.get('/meetings/2026-05-27/public-hearing/index.md'),
      data: index.get('/meetings/data/meetings.json'),
      llms: index.get('/meetings/llms.txt'),
    }).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "detail": {
          "changefreq": "yearly",
          "lastmod": "2026-05-27",
        },
        "llms": undefined,
        "markdown": undefined,
        "meetingsIndex": undefined,
      }
    `);
  });
});

describe('isSitemapPageAllowed', () => {
  it('excludes meetings index and agent/data surfaces while keeping detail pages', () => {
    expect(
      [
        'https://kpshelkovo.online/meetings/',
        'https://kpshelkovo.online/meetings/data/meetings.json',
        'https://kpshelkovo.online/meetings/llms.txt',
        'https://kpshelkovo.online/meetings/llms-full.txt',
        'https://kpshelkovo.online/meetings/2026-05-27/public-hearing/index.md',
        'https://kpshelkovo.online/meetings/2026-05-27/public-hearing/',
        'https://kpshelkovo.online/404/',
      ].map((page) => [page, isSitemapPageAllowed(page)]),
    ).toEqual([
      ['https://kpshelkovo.online/meetings/', false],
      ['https://kpshelkovo.online/meetings/data/meetings.json', false],
      ['https://kpshelkovo.online/meetings/llms.txt', false],
      ['https://kpshelkovo.online/meetings/llms-full.txt', false],
      [
        'https://kpshelkovo.online/meetings/2026-05-27/public-hearing/index.md',
        false,
      ],
      ['https://kpshelkovo.online/meetings/2026-05-27/public-hearing/', true],
      ['https://kpshelkovo.online/404/', false],
    ]);
  });
});

describe('applySitemapMetadata', () => {
  it('adds metadata only for known paths', () => {
    const index = new Map([
      [
        '/news/',
        {
          lastmod: '2026-05-04T12:30:00+03:00',
          changefreq: ChangeFreqEnum.DAILY,
        },
      ],
    ]);

    expect(
      applySitemapMetadata({ url: 'https://kpshelkovo.online/news/' }, index),
    ).toEqual({
      url: 'https://kpshelkovo.online/news/',
      lastmod: '2026-05-04T12:30:00+03:00',
      changefreq: 'daily',
    });
    expect(
      applySitemapMetadata({ url: 'https://kpshelkovo.online/people/' }, index),
    ).toEqual({ url: 'https://kpshelkovo.online/people/' });
  });
});

describe('main navigation', () => {
  it('does not promote meetings in layout or home hero navigation', () => {
    expect(sourceText('../layouts/BaseLayout.astro')).not.toContain(
      'href="/meetings/"',
    );
    expect(sourceText('../pages/index.astro')).not.toContain(
      'href="/meetings/"',
    );
  });
});
