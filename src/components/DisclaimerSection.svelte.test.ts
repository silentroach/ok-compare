import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DisclaimerSection from './DisclaimerSection.svelte';

describe('DisclaimerSection', () => {
  it('renders section with disclaimer id for anchor links', () => {
    const { container } = render(DisclaimerSection);
    
    const section = container.querySelector('section#disclaimer');
    expect(section).toBeTruthy();
  });

  it('renders main heading', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/отказ|ответственност|декларац/);
  });

  it('states information is not official advice', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/не является|не официальн|не консультац/);
  });

  it('advises independent verification before decisions', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/самостоятельн|проверьте|верификац|провер/);
    expect(content).toMatch(/решени|действи/);
  });

  it('discloses data accuracy limitations', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/точност|достоверност|актуальност/);
    expect(content).toMatch(/ограничен|не гарантир|может содержать|неточност|ошибк/);
  });

  it('provides contact information for corrections', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    expect(content).toMatch(/сообщить|исправлен|обновлен|контакт/);
    expect(content).toMatch(/ошибк|неточност|заметили/);
  });

  it('renders all content in Russian', () => {
    const { container } = render(DisclaimerSection);
    
    const content = container.textContent?.toLowerCase();
    const russianPatterns = /[а-яё]/;
    expect(russianPatterns.test(content || '')).toBe(true);
  });

  it('is wrapped in semantic section element', () => {
    const { container } = render(DisclaimerSection);
    
    const section = container.querySelector('section');
    expect(section).toBeTruthy();
  });

  it('includes visual indicator (warning icon or emphasized styling)', () => {
    const { container } = render(DisclaimerSection);
    
    const section = container.querySelector('section#disclaimer');
    expect(section).toBeTruthy();
    
    // Check for warning icon or emphasized styling classes
    const icon = container.querySelector('svg, .warning, .alert, [role="alert"]');
    const emphasizedElements = container.querySelectorAll('.font-bold, .text-warning, .bg-amber');
    
    expect(icon || emphasizedElements.length > 0).toBeTruthy();
  });
});
