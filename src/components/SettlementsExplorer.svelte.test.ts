import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/svelte';
import SettlementsExplorer from './SettlementsExplorer.svelte';
import type { ComparisonResult, Settlement, Stats } from '../lib/schema';

type Row = Settlement & { rating: number };

const mockMap = {
  addChild: vi.fn(),
  removeChild: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
};

const mockYandexMaps = {
  ready: Promise.resolve(),
  YMap: vi.fn(function YMap() {
    return mockMap;
  }),
  YMapDefaultSchemeLayer: vi.fn(function YMapDefaultSchemeLayer() {
    return {};
  }),
  YMapDefaultFeaturesLayer: vi.fn(function YMapDefaultFeaturesLayer() {
    return {};
  }),
  YMapMarker: vi.fn(function YMapMarker() {
    return {};
  }),
};

const stats: Stats = {
  shelkovoTariff: 120,
  medianTariff: 100,
  peerMedianTariff: 95,
  meanTariff: 110,
  minTariff: 80,
  maxTariff: 160,
  shelkovoRank: 2,
  totalSettlements: 2,
  cheaperCount: 1,
  moreExpensiveCount: 0,
  shelkovoVsMedianPercent: 20,
  shelkovoVsPeerMedianPercent: 26,
  shelkovoVsMeanPercent: 10,
};

const settlements: Row[] = [
  {
    name: 'КП Шелково',
    short_name: 'Шелково',
    slug: 'shelkovo',
    rating: 71.2,
    website: 'https://example.com/shelkovo',
    management_company: 'УК Шелково',
    is_baseline: true,
    location: {
      address_text: 'Московская область',
      lat: 55.82,
      lng: 37.14,
      district: 'Истринский район',
    },
    tariff: {
      value: 120,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 120,
      normalized_is_estimate: false,
      note: '',
    },
    infrastructure: { gas: 'yes', security: 'yes', roads: 'asphalt' },
    common_spaces: {},
    service_model: {},
    sources: [],
  },
  {
    name: 'КП Лесное',
    short_name: 'Лесное',
    slug: 'lesnoe',
    rating: 58.4,
    website: 'https://example.com/lesnoe',
    management_company: 'УК Лесное',
    is_baseline: false,
    location: {
      address_text: 'Московская область',
      lat: 55.85,
      lng: 37.2,
      district: 'Истринский район',
    },
    tariff: {
      value: 90,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 90,
      normalized_is_estimate: false,
      note: '',
    },
    infrastructure: { gas: 'yes', security: 'no', roads: 'gravel' },
    common_spaces: {},
    service_model: {},
    sources: [],
  },
  {
    name: 'КП Усадьбы',
    short_name: 'Усадьбы',
    slug: 'usadby',
    rating: 84.7,
    website: 'https://example.com/usadby',
    management_company: 'УК Усадьбы',
    is_baseline: false,
    location: {
      address_text: 'Московская область',
      lat: 55.83,
      lng: 37.16,
      district: 'Истринский район',
    },
    tariff: {
      value: 150,
      unit: 'rub_per_sotka',
      period: 'month',
      normalized_per_sotka_month: 150,
      normalized_is_estimate: false,
      note: '',
    },
    infrastructure: { gas: 'yes', security: 'yes', roads: 'asphalt' },
    common_spaces: {},
    service_model: {},
    sources: [],
  },
];

const comparisons: Record<string, ComparisonResult> = {
  shelkovo: {
    tariffDelta: 0,
    tariffDeltaPercent: 0,
    isCheaper: false,
  },
  lesnoe: {
    tariffDelta: -30,
    tariffDeltaPercent: -25,
    isCheaper: true,
  },
  usadby: {
    tariffDelta: 30,
    tariffDeltaPercent: 25,
    isCheaper: false,
  },
};

function cardNames(container: HTMLElement): string[] {
  return [
    ...container.querySelectorAll('[data-testid="settlement-card"] h3'),
  ].map((el) => el.textContent?.trim() ?? '');
}

function setScreen(mobile: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: mobile && query.includes('max-width: 767px'),
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('SettlementsExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('hides map by default on mobile', async () => {
    setScreen(true);

    const { container } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="filtered-map"]'),
      ).toBeNull();
    });
  });

  it('toggles map visibility by button', async () => {
    setScreen(true);

    const { getByTestId, container } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(getByTestId('map-toggle')).toBeTruthy();
    });
    const btn = getByTestId('map-toggle');
    await fireEvent.click(btn);

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="filtered-map"]'),
      ).toBeTruthy();
    });
  });

  it('updates map markers after filter change', async () => {
    setScreen(false);

    const { getByLabelText } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(mockYandexMaps.YMapMarker).toHaveBeenCalledTimes(3);
    });

    await fireEvent.click(getByLabelText(/Дешевле Шелково/));

    await waitFor(() => {
      expect(mockYandexMaps.YMapMarker).toHaveBeenCalledTimes(4);
    });
  });

  it('uses rating order by default', async () => {
    setScreen(false);

    const { container } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Усадьбы', 'Шелково', 'Лесное']);
    });
  });

  it('sorts by conditional level in both directions', async () => {
    setScreen(false);

    const { container, getByLabelText } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(getByLabelText('Сортировка:')).toBeTruthy();
    });

    await fireEvent.change(getByLabelText('Сортировка:'), {
      target: { value: 'rating_desc' },
    });

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Усадьбы', 'Шелково', 'Лесное']);
    });

    await fireEvent.change(getByLabelText('Сортировка:'), {
      target: { value: 'rating_asc' },
    });

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Лесное', 'Шелково', 'Усадьбы']);
    });
  });

  it('shows help link for conditional level sorting', async () => {
    setScreen(false);

    const { container, getByLabelText, queryByTestId } = render(
      SettlementsExplorer,
      {
        props: { settlements, comparisons, stats },
      },
    );

    await waitFor(() => {
      expect(getByLabelText('Сортировка:')).toBeTruthy();
    });

    await waitFor(() => {
      const link = container.querySelector(
        '[data-testid="rating-help-link"]',
      ) as HTMLAnchorElement | null;
      expect(link?.getAttribute('href')).toBe('/rating/');
    });

    await fireEvent.change(getByLabelText('Сортировка:'), {
      target: { value: 'tariff_asc' },
    });

    await waitFor(() => {
      expect(queryByTestId('rating-help-link')).toBeNull();
    });
  });

  it('sorts by distance to MKAD', async () => {
    setScreen(false);

    const { container, getByLabelText } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(getByLabelText('Сортировка:')).toBeTruthy();
    });

    await fireEvent.change(getByLabelText('Сортировка:'), {
      target: { value: 'mkad' },
    });

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Лесное', 'Усадьбы', 'Шелково']);
    });
  });

  it('sorts by distance from Shelkovo', async () => {
    setScreen(false);

    const { container, getByLabelText } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(getByLabelText('Сортировка:')).toBeTruthy();
    });
    const sort = getByLabelText('Сортировка:') as HTMLSelectElement;
    sort.value = 'distance';
    await fireEvent.change(sort);

    expect(sort.value).toBe('distance');

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Шелково', 'Усадьбы', 'Лесное']);
    });
  });

  it('sorts alphabetically by name', async () => {
    setScreen(false);

    const { container, getByLabelText } = render(SettlementsExplorer, {
      props: { settlements, comparisons, stats },
    });

    await waitFor(() => {
      expect(getByLabelText('Сортировка:')).toBeTruthy();
    });
    await fireEvent.change(getByLabelText('Сортировка:'), {
      target: { value: 'name' },
    });

    await waitFor(() => {
      expect(cardNames(container)).toEqual(['Лесное', 'Усадьбы', 'Шелково']);
    });
  });

  it('keeps explicit control links for accessibility', async () => {
    setScreen(false);

    const { getByTestId, getByLabelText, container } = render(
      SettlementsExplorer,
      {
        props: { settlements, comparisons, stats },
      },
    );

    await waitFor(() => {
      expect(getByTestId('sort-select')).toBeTruthy();
    });
    const sort = getByTestId('sort-select') as HTMLSelectElement;
    const sortLabel = getByLabelText('Сортировка:') as HTMLSelectElement;
    expect(sortLabel.id).toBe(sort.id);

    const filter = getByTestId('price-cheaper') as HTMLInputElement;
    const filterLabel = container.querySelector(`label[for="${filter.id}"]`);
    expect(filterLabel?.textContent).toContain('Дешевле');
    expect(getByTestId('price-cheaper-count').textContent).toBe('1');
    expect(getByTestId('price-more-count').textContent).toBe('0');

    const btn = getByTestId('map-toggle');
    const mapid = btn.getAttribute('aria-controls');
    expect(mapid).toBeTruthy();
    expect(container.querySelector(`#${mapid}`)).toBeTruthy();
  });

  it('uses one rank for duplicate tariffs', async () => {
    setScreen(false);

    const tied = [
      ...settlements,
      {
        ...settlements[2],
        name: 'КП Усадьбы 2',
        short_name: 'Усадьбы 2',
        slug: 'usadby-2',
        website: 'https://example.com/usadby-2',
      },
    ];

    const { container } = render(SettlementsExplorer, {
      props: { settlements: tied, comparisons, stats },
    });

    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-testid="settlement-card"]'),
      ).toHaveLength(4);
    });

    const labels = [
      ...container.querySelectorAll('[data-testid="tariff-rank-label"]'),
    ].map((item) => item.textContent?.trim() ?? '');

    expect(labels).toContain('3 / 3');
    expect(labels.filter((item) => item === '3 / 3')).toHaveLength(2);
  });
});
