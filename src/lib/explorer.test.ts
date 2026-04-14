import { describe, expect, it } from 'vitest';
import { toExplorer } from './explorer';
import type { Rating } from './rating';
import type { Settlement } from './schema';

const settlement: Settlement = {
  name: 'КП Тестовый',
  short_name: 'Тестовый',
  slug: 'test',
  website: 'https://example.com',
  telegram: 'testchat',
  management_company: {
    title: 'УК Тест',
    url: 'https://example.com/company',
  },
  is_baseline: false,
  location: {
    address_text: 'МО, округ Истра, д. Тестово',
    lat: 55.8,
    lng: 37.1,
    map_url: 'https://example.com/map',
    district: 'Истринский район',
  },
  tariff: {
    value: 120,
    unit: 'rub_per_sotka',
    period: 'month',
    normalized_per_sotka_month: 120,
    normalized_is_estimate: true,
    note: 'Тестовое примечание',
  },
  rabstvo: true,
  infrastructure: { gas: 'yes', roads: 'asphalt' },
  common_spaces: { playgrounds: 'yes' },
  service_model: { snow_removal: 'yes' },
  sources: [
    {
      title: 'Источник',
      url: 'https://example.com/source',
      type: 'official',
      date_checked: '2026-04-09',
      comment: 'ok',
    },
  ],
};

const ratings = new Map<string, Rating>([
  [
    'test',
    {
      score: 72.4,
      km: 62.1,
      ring: 43.9,
    },
  ],
]);

describe('toExplorer', () => {
  it('keeps only fields needed by the main explorer', () => {
    const [item] = toExplorer([settlement], ratings);

    expect(item).toEqual({
      name: 'КП Тестовый',
      short_name: 'Тестовый',
      slug: 'test',
      rating: 72.4,
      rabstvo: true,
      management_company: { title: 'УК Тест' },
      is_baseline: false,
      location: {
        lat: 55.8,
        lng: 37.1,
        district: 'Истринский район',
      },
      tariff: {
        normalized_per_sotka_month: 120,
        normalized_is_estimate: true,
      },
    });

    expect('website' in item).toBe(false);
    expect('telegram' in item).toBe(false);
    expect('address_text' in item.location).toBe(false);
    expect('map_url' in item.location).toBe(false);
    expect('value' in item.tariff).toBe(false);
    expect('unit' in item.tariff).toBe(false);
    expect('period' in item.tariff).toBe(false);
    expect('note' in item.tariff).toBe(false);
    expect('url' in (item.management_company as { title: string })).toBe(false);
    expect(JSON.stringify([item]).length).toBeLessThan(
      JSON.stringify([settlement]).length,
    );
  });
});
