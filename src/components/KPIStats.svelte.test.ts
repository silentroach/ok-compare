import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import KPIStats from './KPIStats.svelte';
import type { Stats } from '../lib/schema';

describe('KPIStats', () => {
  const mockStats: Stats = {
    shelkovoTariff: 4500,
    medianTariff: 3650,
    meanTariff: 3800,
    minTariff: 2800,
    maxTariff: 5200,
    shelkovoRank: 3,
    totalSettlements: 4,
    cheaperCount: 2,
    moreExpensiveCount: 1,
    shelkovoVsMedianPercent: 23,
    shelkovoVsMeanPercent: 18,
  };

  it('displays median comparison when more expensive', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toMatch(/3\s650 ₽\/сотка/);
    expect(container.textContent).toContain('медиана по поселкам');
    expect(container.textContent).toContain('Шелково: +23% к медиане');
  });

  it('displays median comparison when cheaper', () => {
    const cheaperStats: Stats = {
      ...mockStats,
      shelkovoVsMedianPercent: -15,
    };

    const { container } = render(KPIStats, {
      props: { stats: cheaperStats },
    });

    expect(container.textContent).toContain('Шелково: −15% к медиане');
  });

  it('displays median equality text', () => {
    const equalStats: Stats = {
      ...mockStats,
      shelkovoVsMedianPercent: 0,
    };

    const { container } = render(KPIStats, {
      props: { stats: equalStats },
    });

    expect(container.textContent).toContain('Шелково = медиане');
  });

  it('displays cheaper count', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('поселка дешевле Шелково');
    expect(container.textContent).toContain('67% остальных поселков');
  });

  it('displays more expensive count', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('поселок дороже Шелково');
    expect(container.textContent).toContain('33% остальных поселков');
  });

  it('uses plural form for many settlements', () => {
    const manyStats: Stats = {
      ...mockStats,
      moreExpensiveCount: 5,
    };

    const { container } = render(KPIStats, {
      props: { stats: manyStats },
    });

    expect(container.textContent).toContain('поселков дороже Шелково');
  });

  it('formats percentage correctly', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toContain('%');
  });
});
