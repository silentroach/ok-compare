import { describe, expect, it } from 'vitest';

import { renderNewsMarkdown } from './html';

describe('renderNewsMarkdown', () => {
  it('applies typography inside markdown links', () => {
    expect(renderNewsMarkdown('[Шелково Парк](/compare/)')).toBe(
      '<p><a href="/compare/">Шелково\u00A0Парк</a></p>',
    );
  });

  it('does not render raw html from markdown', () => {
    const html = renderNewsMarkdown(
      '<span data-title="Шелково Парк">Шелково Парк</span>',
    );

    expect(html).not.toContain('<span');
    expect(html).not.toContain('data-title=');
    expect(html).toBe('<p>Шелково\u00A0Парк</p>');
  });
});
