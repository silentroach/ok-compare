import { describe, expect, it } from 'vitest';

import { renderNewsMarkdown } from './html';

describe('renderNewsMarkdown', () => {
  it('applies typography inside markdown links', () => {
    expect(renderNewsMarkdown('[Шелково Парк](/compare/)')).toBe(
      '<p><a href="/compare/">Шелково\u00A0Парк</a></p>',
    );
  });

  it('keeps raw html attributes unchanged', () => {
    const html = renderNewsMarkdown(
      '<span data-title="Шелково Парк">Шелково Парк</span>',
    );

    expect(html).toContain('data-title="Шелково Парк"');
    expect(html).toContain('Шелково\u00A0Парк');
  });
});
