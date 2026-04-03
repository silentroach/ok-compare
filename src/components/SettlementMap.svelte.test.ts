import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import SettlementMap from './SettlementMap.svelte';

const mockMap = {
  addChild: vi.fn(),
  destroy: vi.fn(),
};

const markers: HTMLElement[] = [];

const mockYandexMaps = {
  ready: Promise.resolve(),
  Map: vi.fn(() => mockMap),
  YMap: vi.fn(() => mockMap),
  YMapDefaultSchemeLayer: vi.fn(() => ({})),
  YMapDefaultFeaturesLayer: vi.fn(() => ({})),
  YMapMarker: vi.fn((_: unknown, el: HTMLElement) => {
    markers.push(el);
    return { el };
  })
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
  },
  {
    slug: 'lesnoe',
    name: 'КП Лесное',
    shortName: 'Лесное',
    lat: 55.8500,
    lng: 37.2000,
    normalizedTariff: 80,
    isBaseline: false,
  },
  {
    slug: 'usadby',
    name: 'Усадьбы Истра',
    shortName: 'Усадьбы Истра',
    lat: 55.7800,
    lng: 37.1000,
    normalizedTariff: 150,
    isBaseline: false,
  },
];

describe('SettlementMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markers.length = 0;

    Object.defineProperty(window, 'ymaps3', {
      value: mockYandexMaps,
      writable: true,
      configurable: true
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

    const mapContainer = container.querySelector('[data-testid="settlement-map"]');
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

  it('handles empty settlements array gracefully', () => {
    const { container } = render(SettlementMap, {
      props: { settlements: [] },
    });

    // Should still render container without crashing
    expect(container.querySelector('[data-testid="settlement-map"]')).toBeTruthy();
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
    });

    const link = container.querySelector('[data-testid="map-popup-link"]');
    expect(link?.getAttribute('href')).toContain('/settlements/lesnoe/');
  });

  it('renders fallback message when API key is not configured', async () => {
    delete (window as { ymaps3?: unknown }).ymaps3;

    const { container } = render(SettlementMap, {
      props: { settlements: mockSettlements },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('API ключ не настроен');
    }, { timeout: 2000 });
  });
});
