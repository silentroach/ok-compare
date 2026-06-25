import { describe, expect, it } from 'vitest';

import { AREAS, formatArea } from './areas';

describe('formatArea', () => {
  it('formats stable public area labels from GLOSSARY.md', () => {
    expect(AREAS).toEqual(['river', 'forest', 'park', 'village']);
    expect(AREAS.map(formatArea)).toEqual([
      'Шелково Ривер',
      'Шелково Форест',
      'Шелково Парк',
      'Шелково Вилладж',
    ]);
  });
});
