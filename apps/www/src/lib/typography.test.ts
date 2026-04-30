import { describe, expect, it } from 'vitest';

import { formatDynamicHtml } from './typography';

describe('typography', () => {
  it('keeps Shelkovo part names on one line', () => {
    expect(formatDynamicHtml('Шелково Ривер')).toBe('Шелково\u00A0Ривер');
    expect(formatDynamicHtml('<p>Шелково Парк</p>')).toBe(
      '<p>Шелково\u00A0Парк</p>',
    );
  });

  it('does not change standalone Shelkovo mentions', () => {
    expect(formatDynamicHtml('Новости Шелково')).toBe('Новости Шелково');
  });
});
