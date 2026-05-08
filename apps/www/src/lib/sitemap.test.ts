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

    expect(Object.fromEntries(index)).toMatchInlineSnapshot(`
      {
        "/": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/2026/": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/2026/04/": {
          "changefreq": "daily",
          "lastmod": "2026-04-20T09:00:00+03:00",
        },
        "/news/2026/04/older/": {
          "changefreq": "monthly",
          "lastmod": "2026-04-20T09:00:00+03:00",
        },
        "/news/2026/05/": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/2026/05/first/": {
          "changefreq": "monthly",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/tags/": {
          "changefreq": "daily",
          "lastmod": "2026-05-04T12:30:00+03:00",
        },
        "/news/tags/дороги/": {
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

    expect(Object.fromEntries(index)).toMatchInlineSnapshot(`
      {
        "/": {
          "changefreq": "daily",
          "lastmod": "2026-05-03T14:00:00+03:00",
        },
        "/815/compare/": {
          "changefreq": "monthly",
          "lastmod": "2026-04-12",
        },
        "/815/compare/rating/": {
          "changefreq": "yearly",
        },
        "/815/compare/settlements/forest/": {
          "changefreq": "monthly",
          "lastmod": "2026-03-10",
        },
        "/815/compare/settlements/river/": {
          "changefreq": "monthly",
          "lastmod": "2026-04-12",
        },
        "/status/": {
          "changefreq": "hourly",
          "lastmod": "2026-05-03T14:00:00+03:00",
        },
        "/status/electricity/": {
          "changefreq": "hourly",
          "lastmod": "2026-05-01T09:00:00+03:00",
        },
        "/status/incidents/2026/05/electricity/": {
          "changefreq": "yearly",
          "lastmod": "2026-05-01T09:00:00+03:00",
        },
        "/status/water/": {
          "changefreq": "hourly",
          "lastmod": "2026-05-03T14:00:00+03:00",
        },
      }
    `);
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
