import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero', () => {
  it('renders title and subtitle', () => {
    const { container } = render(Hero, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle'
      }
    });

    expect(container.textContent).toContain('Test Title');
    expect(container.textContent).toContain('Test Subtitle');
  });

  it('renders with Russian text for Shelkovo comparison', () => {
    const { container } = render(Hero, {
      props: {
        title: 'Сравнение тарифов на содержание коттеджных поселков',
        subtitle: 'Анализ стоимости обслуживания в Истринском районе Московской области'
      }
    });

    expect(container.textContent).toContain('Сравнение тарифов на содержание коттеджных поселков');
    expect(container.textContent).toContain('Анализ стоимости обслуживания в Истринском районе Московской области');
  });

  it('uses semantic h1 for title', () => {
    const { container } = render(Hero, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle'
      }
    });

    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Test Title');
  });
});
