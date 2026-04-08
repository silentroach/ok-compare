import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SettlementCard from './SettlementCard.svelte';
import type { Settlement, ComparisonResult } from '../lib/schema';

const mockSettlement: Settlement = {
  name: 'Тестовый поселок',
  short_name: 'Тестово',
  slug: 'testovo',
  website: 'https://testovo.ru',
  management_company: 'УК Тестово',
  is_baseline: false,
  location: {
    address_text: 'МО, Тестовский р-н',
    lat: 55.5,
    lng: 37.5,
    district: 'Тестовский район',
  },
  tariff: {
    value: 100,
    unit: 'rub_per_sotka',
    period: 'month',
    normalized_per_sotka_month: 100,
    normalized_is_estimate: false,
    note: '',
  },
  infrastructure: {},
  common_spaces: {},
  service_model: {},
  sources: [],
};

const mockComparisonCheaper: ComparisonResult = {
  tariffDelta: 50,
  tariffDeltaPercent: 33,
  isCheaper: true,
};

const mockComparisonExpensive: ComparisonResult = {
  tariffDelta: 50,
  tariffDeltaPercent: 33,
  isCheaper: false,
};

describe('SettlementCard', () => {
  it('renders settlement name and location', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('Тестово');
    expect(container.textContent).toContain('Тестовский район');
  });

  it('renders tariff formatted correctly', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('100 ₽/сотка');
  });

  it('renders rank as plain text in header', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(
      container.querySelector('[data-testid="tariff-rank-label"]')?.textContent,
    ).toContain('1 / 3');
  });

  it('renders estimated tariff with tilde and hint', () => {
    const settlement = {
      ...mockSettlement,
      tariff: {
        value: 12000,
        unit: 'rub_per_lot' as const,
        period: 'month' as const,
        normalized_per_sotka_month: 1200,
        normalized_is_estimate: true,
      },
    };

    const { container } = render(SettlementCard, {
      props: {
        settlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('~1');
    expect(container.textContent).toContain('₽/сотка');
    expect(
      container.querySelector(
        '[title="Тариф приведен к сотке автоматически."]',
      ),
    ).toBeTruthy();
  });

  it('renders "дешевле на" for cheaper settlement', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('дешевле на');
    expect(container.textContent).toContain('50');
  });

  it('renders "дороже на" for more expensive settlement', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonExpensive,
        rank: 3,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('дороже на');
    expect(container.textContent).toContain('50');
  });

  it('renders "базовый тариф" for baseline settlement', () => {
    const baselineSettlement = { ...mockSettlement, is_baseline: true };
    const { container } = render(SettlementCard, {
      props: {
        settlement: baselineSettlement,
        rank: 2,
        base: 2,
        total: 3,
        isBaseline: true,
      },
    });

    expect(container.textContent).toContain('базовый тариф');
    expect(container.textContent).toContain('наш');
  });

  it('renders tariff rank strip', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    const tariffRank = container.querySelector('[data-testid="tariff-rank"]');
    expect(tariffRank).toBeTruthy();
  });

  it('renders title link to detail page', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparisonCheaper,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    const link = container.querySelector('h3 a[href*="settlements/testovo/"]');
    expect(link).toBeTruthy();
  });

  it('handles missing comparison gracefully', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        rank: 1,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    // Should still render without errors
    expect(
      container.querySelector('[data-testid="settlement-card"]'),
    ).toBeTruthy();
    // Should render tariff but no comparison text
    expect(container.textContent).toContain('100 ₽/сотка');
    expect(container.textContent).not.toContain('дешевле на');
    expect(container.textContent).not.toContain('дороже на');
  });

  it('does not show comparison text when tariff delta is zero', () => {
    const zeroComparison: ComparisonResult = {
      tariffDelta: 0,
      tariffDeltaPercent: 0,
      isCheaper: false,
    };

    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: zeroComparison,
        rank: 2,
        base: 2,
        total: 3,
        isBaseline: false,
      },
    });

    expect(container.textContent).toContain('100 ₽/сотка');
    expect(container.textContent).not.toContain('дешевле на 0');
    expect(container.textContent).not.toContain('дороже на 0');
    expect(container.textContent).not.toContain('базовый тариф');
  });
});
