import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
  it('renders copyright notice', () => {
    const { container } = render(Footer);

    expect(container.textContent).toContain('©');
    expect(container.textContent).toContain(new Date().getFullYear().toString());
  });

  it('renders navigation links', () => {
    const { container } = render(Footer);

    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('contains methodology link', () => {
    const { container } = render(Footer);

    expect(container.textContent?.toLowerCase()).toContain('методолог');
  });

  it('contains disclaimer link', () => {
    const { container } = render(Footer);

    expect(container.textContent?.toLowerCase()).toContain('ответствен');
    expect(container.textContent?.toLowerCase()).toContain('отказ');
  });

  it('is wrapped in semantic footer element', () => {
    const { container } = render(Footer);

    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
  });
});
