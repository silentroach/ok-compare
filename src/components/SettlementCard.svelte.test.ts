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
    note: ''
  },
  infrastructure: {},
  service_model: {},
  promises_vs_fact: {
    promised: [],
    actual: [],
    notes: ''
  },
  transparency: {
    has_public_tariff: false,
    has_website: false,
    has_phone: false,
    has_management_info: false,
    notes: ''
  },
  sources: [],
  comparison_notes: []
};

const mockComparison: ComparisonResult = {
  tariffDelta: 50,
  tariffDeltaPercent: 33,
  isCheaper: true,
  infrastructureDelta: { betterCount: 2, worseCount: 1 },
  servicesDelta: { betterCount: 1, worseCount: 0 },
  transparencyDelta: { betterCount: 0, worseCount: 1 }
};

describe('SettlementCard', () => {
  it('renders settlement name and location', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparison,
        maxTariff: 150,
        isBaseline: false
      }
    });

    expect(container.textContent).toContain('Тестово');
    expect(container.textContent).toContain('Тестовский район');
  });

  it('renders tariff formatted correctly', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparison,
        maxTariff: 150,
        isBaseline: false
      }
    });

    expect(container.textContent).toContain('100 ₽/сотка');
  });

  it('renders comparison badge for non-baseline', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparison,
        maxTariff: 150,
        isBaseline: false
      }
    });

    const badge = container.querySelector('[data-testid="comparison-badge"]');
    expect(badge).toBeTruthy();
  });

  it('renders baseline badge for baseline settlement', () => {
    const baselineSettlement = { ...mockSettlement, is_baseline: true };
    const { container } = render(SettlementCard, {
      props: {
        settlement: baselineSettlement,
        comparison: null,
        maxTariff: 150,
        isBaseline: true
      }
    });

    expect(container.textContent).toContain('Наш');
  });

  it('renders tariff bar', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparison,
        maxTariff: 150,
        isBaseline: false
      }
    });

    const tariffBar = container.querySelector('[data-testid="tariff-bar"]');
    expect(tariffBar).toBeTruthy();
  });

  it('renders title link to detail page', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: mockComparison,
        maxTariff: 150,
        isBaseline: false
      }
    });

    const link = container.querySelector('h3 a[href="/settlements/testovo/"]');
    expect(link).toBeTruthy();
  });

  it('handles missing comparison gracefully', () => {
    const { container } = render(SettlementCard, {
      props: {
        settlement: mockSettlement,
        comparison: null,
        maxTariff: 150,
        isBaseline: false
      }
    });

    // Should still render without errors
    expect(container.querySelector('[data-testid="settlement-card"]')).toBeTruthy();
  });
});
