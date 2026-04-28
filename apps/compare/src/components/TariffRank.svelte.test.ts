import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TariffRank from './TariffRank.svelte';

describe('TariffRank', () => {
  it('renders strip container', () => {
    const { container } = render(TariffRank, {
      props: {
        rank: 2,
        base: 4,
        total: 9,
        tone: 'success',
      },
    });

    expect(
      container.querySelector('[data-testid="tariff-rank-strip"]'),
    ).toBeTruthy();
  });

  it('renders one dot per settlement', () => {
    const { container } = render(TariffRank, {
      props: {
        rank: 3,
        base: 5,
        total: 7,
        tone: 'warning',
      },
    });

    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(8);
  });

  it('marks current and baseline positions separately', () => {
    const { container } = render(TariffRank, {
      props: {
        rank: 2,
        base: 5,
        total: 6,
        tone: 'success',
      },
    });

    expect(
      container.querySelector('[data-testid="tariff-rank-current"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="tariff-rank-base"]'),
    ).toBeTruthy();
  });

  it('uses single marker when current rank matches baseline', () => {
    const { container } = render(TariffRank, {
      props: {
        rank: 4,
        base: 4,
        total: 8,
        tone: 'info',
      },
    });

    expect(
      container.querySelector('[data-testid="tariff-rank-current"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="tariff-rank-base"]'),
    ).toBeNull();
  });

  it('exposes an accessible summary', () => {
    const { container } = render(TariffRank, {
      props: {
        rank: 6,
        base: 3,
        total: 10,
        tone: 'warning',
      },
    });

    expect(
      container.querySelector('[aria-label="Ранг 6 из 10. Дороже базового."]'),
    ).toBeTruthy();
  });
});
