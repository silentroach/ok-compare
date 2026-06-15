import { describe, expect, it } from 'vitest';

import { RawKbPageSchema } from './raw-schema';

describe('RawKbPageSchema', () => {
  it('accepts title, description, and optional tags', () => {
    expect(
      RawKbPageSchema.parse({
        title: 'Интернет в поселке',
        description: 'Как подключить интернет и где смотреть статус.',
        tags: ['интернет', 'сервисы'],
      }),
    ).toEqual({
      title: 'Интернет в поселке',
      description: 'Как подключить интернет и где смотреть статус.',
      tags: ['интернет', 'сервисы'],
    });
  });

  it('rejects blank title or description', () => {
    expect(() =>
      RawKbPageSchema.parse({
        title: ' ',
        description: 'Как подключить интернет.',
      }),
    ).toThrow();

    expect(() =>
      RawKbPageSchema.parse({
        title: 'Интернет в поселке',
        description: ' ',
      }),
    ).toThrow();
  });

  it('rejects unknown frontmatter fields', () => {
    expect(() =>
      RawKbPageSchema.parse({
        title: 'Интернет в поселке',
        description: 'Как подключить интернет.',
        updated_at: '2026-06-01',
      }),
    ).toThrow();
  });

  it('rejects blank tag items', () => {
    expect(() =>
      RawKbPageSchema.parse({
        title: 'Интернет в поселке',
        description: 'Как подключить интернет.',
        tags: ['интернет', ' '],
      }),
    ).toThrow();
  });
});
