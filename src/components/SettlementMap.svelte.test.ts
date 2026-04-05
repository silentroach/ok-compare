import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import SettlementMap from './SettlementMap.svelte';

const mockMap = {
  addChild: vi.fn(),
  removeChild: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
};

const markers: HTMLElement[] = [];

const mockYandexMaps = {
  ready: Promise.resolve(),
  Map: vi.fn(function Map() {
    return mockMap;
  }),
  YMap: vi.fn(function YMap() {
    return mockMap;
  }),
  YMapDefaultSchemeLayer: vi.fn(function YMapDefaultSchemeLayer() {
    return {};
  }),
  YMapDefaultFeaturesLayer: vi.fn(function YMapDefaultFeaturesLayer() {
    return {};
  }),
  YMapMarker: vi.fn(function YMapMarker(_: unknown, el: HTMLElement) {
    markers.push(el);
    return { el };
  }),
};

// Mock settlements data
const mockSettlements = [
  {
    slug: 'shelkovo',
    name: 'КП Шелково',
    shortName: 'Шелково',
    lat: 55.8234,
    lng: 37.1456,
    normalizedTariff: 120,
    isBaseline: true,
    companyText: 'ОК "Комфорт"',
  },
  {
    slug: 'lesnoe',
    name: 'КП Лесное',
    shortName: 'Лесное',
    lat: 55.85,
    lng: 37.2,
    normalizedTariff: 80,
    isBaseline: false,
    companyText: 'УК Лесное',
  },
  {
    slug: 'usadby',
    name: 'Усадьбы Истра',
    shortName: 'Усадьбы Истра',
    lat: 55.78,
    lng: 37.1,
    normalizedTariff: 150,
    isBaseline: false,
    companyText: 'УК Усадьбы',
  },
];

describe('SettlementMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markers.length = 0;

    Object.defineProperty(window, 'ymaps3', {
      value: mockYandexMaps,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { ymaps3?: unknown }).ymaps3;
  });

  it('renders map container', () => {
    const { container } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    const mapContainer = container.querySelector(
      '[data-testid="settlement-map"]',
    );
    expect(mapContainer).toBeTruthy();
  });

  it('displays loading state initially', () => {
    const { container } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    expect(container.textContent).toContain('Загрузка карты');
  });

  it('creates markers for all settlements when ymaps3 is available', async () => {
    render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    await waitFor(() => {
      expect(markers.length).toBe(mockSettlements.length);
    });
  });

  it('uses dynamic gradient for non-baseline markers', async () => {
    render(SettlementMap, {
      props: {
        settlements: [
          {
            slug: 'base',
            name: 'База',
            shortName: 'База',
            lat: 55.8,
            lng: 37.1,
            normalizedTariff: 640,
            isBaseline: true,
          },
          {
            slug: 'low',
            name: 'Низкий',
            shortName: 'Низкий',
            lat: 55.81,
            lng: 37.11,
            normalizedTariff: 495,
            isBaseline: false,
          },
          {
            slug: 'high',
            name: 'Высокий',
            shortName: 'Высокий',
            lat: 55.82,
            lng: 37.12,
            normalizedTariff: 815,
            isBaseline: false,
          },
        ],
      },
    });

    await waitFor(() => {
      expect(markers.length).toBe(3);
    });

    expect(markers[0]?.style.background).toBe('#0369a1');
    expect(markers[1]?.style.background).not.toBe(markers[2]?.style.background);
  });

  it('uses neutral color when all non-baseline tariffs are equal', async () => {
    render(SettlementMap, {
      props: {
        settlements: [
          {
            slug: 'base',
            name: 'База',
            shortName: 'База',
            lat: 55.8,
            lng: 37.1,
            normalizedTariff: 700,
            isBaseline: true,
          },
          {
            slug: 'same-1',
            name: 'Одинаковый 1',
            shortName: 'Одинаковый 1',
            lat: 55.81,
            lng: 37.11,
            normalizedTariff: 700,
            isBaseline: false,
          },
          {
            slug: 'same-2',
            name: 'Одинаковый 2',
            shortName: 'Одинаковый 2',
            lat: 55.82,
            lng: 37.12,
            normalizedTariff: 700,
            isBaseline: false,
          },
        ],
      },
    });

    await waitFor(() => {
      expect(markers.length).toBe(3);
    });

    expect(markers[0]?.style.background).toBe('#0369a1');
    expect(markers[1]?.style.background).toBe('rgb(205, 165, 101)');
    expect(markers[2]?.style.background).toBe('rgb(205, 165, 101)');
  });

  it('updates markers and recenters on settlements change', async () => {
    const { rerender } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    await waitFor(() => {
      expect(mockYandexMaps.YMapMarker).toHaveBeenCalledTimes(3);
    });

    await rerender({ settlements: [mockSettlements[0]] });

    await waitFor(() => {
      expect(mockYandexMaps.YMapMarker).toHaveBeenCalledTimes(4);
      expect(mockMap.update).toHaveBeenCalled();
    });
  });

  it('handles empty settlements array gracefully', () => {
    const { container } = render(SettlementMap, {
      props: { settlements: [] },
    });

    // Should still render container without crashing
    expect(
      container.querySelector('[data-testid="settlement-map"]'),
    ).toBeTruthy();
  });

  it('opens popup on marker click with details link', async () => {
    const { container } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    await waitFor(() => {
      expect(markers.length).toBe(mockSettlements.length);
    });

    markers[1]?.click();

    await waitFor(() => {
      expect(container.querySelector('[data-testid="map-popup"]')).toBeTruthy();
      expect(container.textContent).toContain('Лесное');
      expect(container.textContent).toContain('УК Лесное');
    });

    const link = container.querySelector('[data-testid="map-popup-link"]');
    expect(link?.getAttribute('href')).toContain('/settlements/lesnoe/');
  });

  it('renders fallback message when API key is not configured', async () => {
    delete (window as { ymaps3?: unknown }).ymaps3;

    const { container } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    await waitFor(
      () => {
        expect(container.textContent).toContain('API ключ не настроен');
      },
      { timeout: 2000 },
    );
  });
});
