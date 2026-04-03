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
    shelkovoVsMeanPercent: 18
  };

  it('renders rank information', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats }
    });

    expect(container.textContent).toContain('Шелково');
    expect(container.textContent).toContain('3-й');
    expect(container.textContent).toContain('4');
    expect(container.textContent).toContain('по стоимости');
  });

  it('displays median comparison when more expensive', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats }
    });

    expect(container.textContent).toContain('дороже');
    expect(container.textContent).toContain('медианы');
  });

  it('displays median comparison when cheaper', () => {
    const cheaperStats: Stats = {
      ...mockStats,
      shelkovoVsMedianPercent: -15
    };
    
    const { container } = render(KPIStats, {
      props: { stats: cheaperStats }
    });

    expect(container.textContent).toContain('дешевле');
    expect(container.textContent).toContain('медианы');
  });

  it('displays cheaper count', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats }
    });

    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('дешевле');
  });

  it('displays more expensive count', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats }
    });

    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('дороже');
  });

  it('formats percentage correctly', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats }
    });

    expect(container.textContent).toContain('%');
  });
});
