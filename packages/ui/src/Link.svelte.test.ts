import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import Link from './Link.svelte';

describe('Link package', () => {
  it('prepends base-aware slash for internal links', () => {
    const { container } = render(Link, {
      props: {
        href: 'settlements/test/',
        class: 'ui-link',
        'data-testid': 'link',
      },
    });

    const link = container.querySelector('[data-testid="link"]');

    expect(link?.getAttribute('href')).toBe('/settlements/test/');
    expect(link?.getAttribute('class')).toBe('ui-link');
  });

  it('passes through external links', () => {
    const { container } = render(Link, {
      props: {
        href: 'https://example.com',
        'data-testid': 'link',
      },
    });

    const link = container.querySelector('[data-testid="link"]');

    expect(link?.getAttribute('href')).toBe('https://example.com');
  });
});
