import { describe, expect, it } from 'vitest';

import {
  buildNewsEventMapEmbedUrl,
  buildNewsEventMapUrl,
  formatNewsEventRange,
} from './view';

describe('formatNewsEventRange', () => {
  it('formats same-day event ranges', () => {
    expect(
      formatNewsEventRange({
        starts_iso: '2026-05-31T19:00:00+03:00',
        starts_time: '19:00',
        ends_iso: '2026-05-31T21:00:00+03:00',
        ends_time: '21:00',
      }),
    ).toBe('31 мая 2026, 19:00-21:00');
  });

  it('formats multi-day event ranges', () => {
    expect(
      formatNewsEventRange({
        starts_iso: '2026-05-31T23:30:00+03:00',
        starts_time: '23:30',
        ends_iso: '2026-06-01T01:00:00+03:00',
        ends_time: '01:00',
      }),
    ).toBe('31 мая 2026, 23:30 - 1 июня 2026, 01:00');
  });

  it('formats open-ended event ranges with start time only', () => {
    expect(
      formatNewsEventRange({
        starts_iso: '2026-05-31T19:00:00+03:00',
        starts_time: '19:00',
      }),
    ).toBe('31 мая 2026, 19:00');
  });
});

describe('buildNewsEventMapUrl', () => {
  it('prefers coordinates for Yandex Maps links', () => {
    expect(
      buildNewsEventMapUrl({
        location: 'КП Шелково, эко-клуб',
        coordinates: { lat: 55.123456, lng: 38.654321 },
      }),
    ).toBe('https://yandex.ru/maps/?pt=38.654321,55.123456&z=16&l=map');
  });

  it('builds search links from location when coordinates are missing', () => {
    const url = buildNewsEventMapUrl({ location: 'КП Шелково, эко-клуб' });

    expect(url).toBeDefined();
    expect(new URL(url ?? '').searchParams.get('text')).toBe(
      'КП Шелково, эко-клуб',
    );
  });

  it('skips map links without coordinates or location', () => {
    expect(buildNewsEventMapUrl({})).toBeUndefined();
  });

  it('builds Yandex Maps widget URLs from coordinates', () => {
    const url = buildNewsEventMapEmbedUrl({
      coordinates: { lat: 55.123456, lng: 38.654321 },
    });

    expect(url).toBeDefined();
    expect(new URL(url ?? '').searchParams.get('ll')).toBe(
      '38.654321,55.123456',
    );
    expect(new URL(url ?? '').searchParams.get('pt')).toBeNull();
  });
});
