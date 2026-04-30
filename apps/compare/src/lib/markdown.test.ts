import { describe, expect, it, vi } from 'vitest';

vi.mock('./data', () => ({
  loadAllData: async () => ({
    settlements: [
      {
        name: 'КП Шелково',
        short_name: 'Шелково',
        slug: 'shelkovo',
        is_baseline: true,
        location: {
          lat: 55.7,
          lng: 37,
          district: 'Истринский район',
        },
        tariff: {
          normalized_per_sotka_month: 100,
          normalized_is_estimate: false,
        },
      },
      {
        name: 'КП Тестовый',
        short_name: 'Тестовый',
        slug: 'test',
        is_baseline: false,
        location: {
          lat: 55.8,
          lng: 37.1,
          district: 'Истринский район',
        },
        tariff: {
          normalized_per_sotka_month: 90,
          normalized_is_estimate: false,
        },
      },
    ],
    stats: {
      totalSettlements: 2,
      cheaperCount: 1,
      moreExpensiveCount: 0,
    },
    ratings: new Map([
      ['shelkovo', { score: 81.2 }],
      ['test', { score: 74.3 }],
    ]),
  }),
}));

vi.mock('./site', () => ({
  canon: (path: string) =>
    new URL(
      path.replace(/^\//, ''),
      'https://kpshelkovo.online/compare/',
    ).toString(),
}));

const loadMarkdown = () => import('./markdown');

describe('compare markdown navigation', () => {
  it('keeps discovery links on the markdown home page', async () => {
    const { buildHomeMd } = await loadMarkdown();
    const body = await buildHomeMd();

    expect(body).toContain('## Навигация');
    expect(body).toContain(
      'Методика рейтинга: https://kpshelkovo.online/compare/rating/index.md',
    );
    expect(body).toContain(
      'Полный structured feed: https://kpshelkovo.online/compare/data/settlements.json',
    );
    expect(body).toContain(
      'Explorer feed: https://kpshelkovo.online/compare/data/explorer.json',
    );
  });

  it('keeps discovery links on the markdown rating page', async () => {
    const { buildRatingMd } = await loadMarkdown();
    const body = await buildRatingMd();

    expect(body).toContain('## Навигация');
    expect(body).toContain(
      'Главная в Markdown: https://kpshelkovo.online/compare/index.md',
    );
    expect(body).toContain(
      'Полный structured feed: https://kpshelkovo.online/compare/data/settlements.json',
    );
    expect(body).toContain(
      'Explorer feed: https://kpshelkovo.online/compare/data/explorer.json',
    );
  });
});
