import { describe, expect, it } from 'vitest';

import { toFull } from './full';
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
    normalized_is_estimate: false,
    note: 'Тестовое примечание',
  },
  water_in_tariff: true,
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
      comment: '',
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

describe('toFull', () => {
  it('keeps the full settlement shape and adds rating', () => {
    const [item] = toFull([settlement], ratings);

    expect(item).toEqual({
      ...settlement,
      rating: 72.4,
    });

    expect(item.website).toBe('https://example.com');
    expect(item.location.address_text).toBe('МО, округ Истра, д. Тестово');
    expect(item.tariff.note).toBe('Тестовое примечание');
    expect(item.sources[0]?.url).toBe('https://example.com/source');
  });
});
