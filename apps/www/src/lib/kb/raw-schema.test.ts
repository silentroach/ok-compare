import { describe, expect, it } from 'vitest';

import { RawKbPageSchema } from './raw-schema';

describe('RawKbPageSchema', () => {
  it('accepts noindex as a page flag', () => {
    expect(
      RawKbPageSchema.parse({
        title: 'Служебная статья',
        flags: ['noindex'],
      }),
    ).toEqual({
      title: 'Служебная статья',
      flags: ['noindex'],
    });
  });

  it('rejects unknown page flags', () => {
    expect(() =>
      RawKbPageSchema.parse({
        title: 'Служебная статья',
        flags: ['draft'],
      }),
    ).toThrow();
  });
});
