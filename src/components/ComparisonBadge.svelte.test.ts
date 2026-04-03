import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ComparisonBadge from './ComparisonBadge.svelte';

describe('ComparisonBadge', () => {
  it('renders cheaper badge with green styling', () => {
    const { container } = render(ComparisonBadge, {
      props: {
        delta: 50,
        deltaPercent: 33,
        isCheaper: true,
        isBaseline: false
      }
    });

    expect(container.textContent).toContain('−50 ₽');
    expect(container.textContent).toContain('(дешевле на 33%)');

    const badge = container.querySelector('[data-testid="comparison-badge"]');
    expect(badge).toBeTruthy();
    // Check for green text styling on inner element
    const greenElement = container.querySelector('.text-green');
    expect(greenElement).toBeTruthy();
  });

  it('renders more expensive badge with red styling', () => {
    const { container } = render(ComparisonBadge, {
      props: {
        delta: -30,
        deltaPercent: -20,
        isCheaper: false,
        isBaseline: false
      }
    });

    expect(container.textContent).toContain('+30 ₽');
    expect(container.textContent).toContain('(дороже на 20%)');

    const badge = container.querySelector('[data-testid="comparison-badge"]');
    expect(badge).toBeTruthy();
    // Check for red text styling on inner element
    const redElement = container.querySelector('.text-red');
    expect(redElement).toBeTruthy();
  });

  it('renders baseline badge with neutral styling', () => {
    const { container } = render(ComparisonBadge, {
      props: {
        delta: 0,
        deltaPercent: 0,
        isCheaper: false,
        isBaseline: true
      }
    });

    expect(container.textContent).toContain('Наш');
    
    // Baseline badge should render (wrapper has data-testid)
    const badge = container.querySelector('[data-testid="comparison-badge"]');
    expect(badge).toBeTruthy();
    // Inner text element should have gray styling
    const textElement = container.querySelector('.text-gray-600');
    expect(textElement).toBeTruthy();
  });

  it('renders nothing when delta is 0 and not baseline', () => {
    const { container } = render(ComparisonBadge, {
      props: {
        delta: 0,
        deltaPercent: 0,
        isCheaper: false,
        isBaseline: false
      }
    });

    // Svelte renders <!----> when conditional is false
    const badge = container.querySelector('[data-testid="comparison-badge"]');
    expect(badge).toBeFalsy();
  });
});
