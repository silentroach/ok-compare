import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';

import { collections } from '@/content.config';

const schemaFactory = collections.newsArticles.schema as unknown as (context: {
  readonly image: () => z.ZodType<unknown>;
}) => {
  readonly safeParse: (value: unknown) => {
    readonly success: boolean;
    readonly error?: {
      readonly issues: readonly {
        readonly path: readonly (string | number)[];
        readonly message: string;
      }[];
    };
  };
};

const schema = schemaFactory({ image: () => z.unknown() });

describe('newsArticles collection schema', () => {
  it('rejects article addenda', () => {
    const result = schema.safeParse({
      title: 'Проезд через дамбу временно закрыт',
      summary: 'Кратко о временном ограничении проезда.',
      date: '30.04.2026',
      author: { id: 'ok-comfort' },
      addenda: [
        {
          date: '30.04.2026 13:30',
          body: 'Позднее уточнение.',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['addenda'],
          message: 'addenda is not supported',
        }),
      ]),
    );
  });
});
