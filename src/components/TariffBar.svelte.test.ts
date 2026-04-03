import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TariffBar from './TariffBar.svelte';

describe('TariffBar', () => {
  it('renders bar with correct width percentage', () => {
    const { container } = render(TariffBar, {
      props: {
        value: 100,
        maxValue: 200,
        shelkovoValue: 150
      }
    });

    const barFill = container.querySelector('[data-testid="tariff-bar-fill"]') as HTMLElement;
    expect(barFill).toBeTruthy();
    expect(barFill?.style.width).toBe('50%');
  });

  it('caps width at 100% when value exceeds max', () => {
    const { container } = render(TariffBar, {
      props: {
        value: 250,
        maxValue: 200,
        shelkovoValue: 150
      }
    });

    const barFill = container.querySelector('[data-testid="tariff-bar-fill"]') as HTMLElement;
    expect(barFill).toBeTruthy();
    expect(barFill?.style.width).toBe('100%');
  });

  it('marks bar when value matches shelkovo', () => {
    const { container } = render(TariffBar, {
      props: {
        value: 150,
        maxValue: 200,
        shelkovoValue: 150
      }
    });

    const barContainer = container.querySelector('[data-testid="tariff-bar"]');
    expect(barContainer).toBeTruthy();
    expect(barContainer?.classList.toString()).toContain('is-baseline');
  });

  it('shows value label', () => {
    const { container } = render(TariffBar, {
      props: {
        value: 100,
        maxValue: 200,
        shelkovoValue: 150
      }
    });

    expect(container.textContent).toContain('100 ₽');
  });

  it('handles zero max value gracefully', () => {
    const { container } = render(TariffBar, {
      props: {
        value: 100,
        maxValue: 0,
        shelkovoValue: 150
      }
    });

    // Should not throw and should render
    expect(container.querySelector('[data-testid="tariff-bar"]')).toBeTruthy();
  });
});
