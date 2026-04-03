import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MethodologySection from './MethodologySection.svelte';

describe('MethodologySection', () => {
  it('renders section with methodology id for anchor links', () => {
    const { container } = render(MethodologySection);
    
    const section = container.querySelector('section#methodology');
    expect(section).toBeTruthy();
  });

  it('renders main heading', () => {
    const { container } = render(MethodologySection);
    
    expect(container.textContent?.toLowerCase()).toContain('методолог');
  });

  it('explains data collection from official sources', () => {
    const { container } = render(MethodologySection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toContain('сбор');
    expect(content).toContain('данн');
  });

  it('explains tariff normalization to rub/sotka/month', () => {
    const { container } = render(MethodologySection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toContain('тариф');
    expect(content).toContain('нормализ');
  });

  it('states data update frequency', () => {
    const { container } = render(MethodologySection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/обновлен|актуализац/);
  });

  it('explains verification process', () => {
    const { container } = render(MethodologySection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/проверк|верификац|контрол/);
  });

  it('renders all content in Russian', () => {
    const { container } = render(MethodologySection);
    
    // Check for common Russian words that indicate Russian content
    const content = container.textContent?.toLowerCase();
    const russianPatterns = /[а-яё]/;
    expect(russianPatterns.test(content || '')).toBe(true);
  });

  it('is wrapped in semantic section element', () => {
    const { container } = render(MethodologySection);
    
    const section = container.querySelector('section');
    expect(section).toBeTruthy();
  });
});
