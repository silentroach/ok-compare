import { describe, expect, it } from 'vitest';

import { mapRawNewsAuthor } from './mapper';
import type { RawNewsAuthor } from './raw-schema';

describe('mapRawNewsAuthor', () => {
  it('maps raw author short_name to domain shortName', () => {
    const raw: RawNewsAuthor = {
      name: 'ОК Комфорт',
      kind: 'official',
      short_name: 'ОКК',
      url: 'https://example.com/news',
      role: 'Официальный источник',
    };

    expect(mapRawNewsAuthor('ok-comfort', raw)).toEqual({
      id: 'ok-comfort',
      name: 'ОК Комфорт',
      kind: 'official',
      shortName: 'ОКК',
      url: 'https://example.com/news',
      role: 'Официальный источник',
    });
  });
});
