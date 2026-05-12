import { ChangeFreqEnum } from '@astrojs/sitemap';
import { describe, expect, it } from 'vitest';

import { applySitemapMetadata, buildSitemapMetadataIndex } from './sitemap';

describe('buildSitemapMetadataIndex', () => {
  it('uses publication and update dates for news pages and archives', () => {
    const index = buildSitemapMetadataIndex({
      news_articles: [
        {
          url: '/news/2026/05/first/',
          published_iso: '2026-05-02T10:00:00+03:00',
          updated_iso: '2026-05-04T12:30:00+03:00',
          year: 2026,
          month: 5,
          tags: [{ url: '/news/tags/дороги/' }],
        },
        {
          url: '/news/2026/04/older/',
          published_iso: '2026-04-20T09:00:00+03:00',
          year: 2026,
          month: 4,
          tags: [{ url: '/news/tags/дороги/' }],
        },
      ],
      status_incidents: [],
      settlements: [],
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
      news_articles: [],
      status_incidents: [
        {
          url: '/status/incidents/2026/05/electricity/',
          service: 'electricity',
          started_iso: '2026-05-01T08:00:00+03:00',
          ended_iso: '2026-05-01T09:00:00+03:00',
          has_page: true,
        },
        {
          url: '/status/incidents/2026/05/water/',
          service: 'water',
          started_iso: '2026-05-03T14:00:00+03:00',
          has_page: false,
        },
      ],
      settlements: [
        {
          slug: 'river',
          sources: [
            { date_checked: '2026-04-03' },
            { date_checked: '2026-04-12' },
          ],
        },
        {
          slug: 'forest',
          sources: [{ date_checked: '2026-03-10' }],
        },
      ],
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
