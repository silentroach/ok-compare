import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import KPIStats from './KPIStats.svelte';
import type { Stats } from '../lib/schema';

describe('KPIStats', () => {
  const mockStats: Stats = {
    shelkovoTariff: 4500,
    medianTariff: 3650,
    peerMedianTariff: 3200,
    meanTariff: 3800,
    minTariff: 2800,
    maxTariff: 5200,
    shelkovoRank: 3,
    totalSettlements: 4,
    cheaperCount: 2,
    moreExpensiveCount: 1,
    shelkovoVsMedianPercent: 23,
    shelkovoVsPeerMedianPercent: 41,
    shelkovoVsMeanPercent: 18,
  };

  it('displays median comparison when more expensive', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toMatch(/3\s200 ₽\/сотка/);
    expect(container.textContent).toMatch(/3\s650 ₽\/сотка/);
    expect(container.textContent).toContain('Похожие по уровню');
    expect(container.textContent).toContain('Все поселки');
    expect(container.textContent).toContain('медиана тарифа');
    expect(container.textContent).toContain('общая медиана тарифа');
    expect(container.textContent).toContain('Шелково: +41%');
    expect(container.textContent).toContain('Шелково: +23%');
  });

  it('displays median comparison when cheaper', () => {
    const cheaperStats: Stats = {
      ...mockStats,
      shelkovoVsMedianPercent: -15,
      shelkovoVsPeerMedianPercent: -8,
    };

    const { container } = render(KPIStats, {
      props: { stats: cheaperStats },
    });

    expect(container.textContent).toContain('Шелково: −15%');
    expect(container.textContent).toContain('Шелково: −8%');
  });

  it('displays median equality text', () => {
    const equalStats: Stats = {
      ...mockStats,
      shelkovoVsMedianPercent: 0,
      shelkovoVsPeerMedianPercent: 0,
    };

    const { container } = render(KPIStats, {
      props: { stats: equalStats },
    });

    expect(container.textContent).toContain('на уровне Шелково');
  });

  it('formats percentage correctly', () => {
    const { container } = render(KPIStats, {
      props: { stats: mockStats },
    });

    expect(container.textContent).toContain('%');
  });
});
