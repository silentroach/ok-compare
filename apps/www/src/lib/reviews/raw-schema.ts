import { z } from 'astro/zod';

import { AREAS } from '@/lib/areas';

import { REVIEW_ASPECT_TYPES, REVIEW_DATE, REVIEW_SLUG } from './schema';

const text = z.string().trim();

const reviewDate = (name: string) =>
  z.union([text, z.date()]).transform((value, ctx) => {
    const normalized =
      value instanceof Date ? value.toISOString().slice(0, 10) : value;

    if (REVIEW_DATE.test(normalized)) {
      return normalized;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} must use YYYY-MM-DD`,
    });

    return z.NEVER;
  });

const aspect = z.object({
  type: z.enum(REVIEW_ASPECT_TYPES),
  rating: z.number().int().min(1).max(5).optional(),
  body: text.optional(),
});

type RawReviewAspectInput = z.infer<typeof aspect>;

const validateUniqueAspectTypes = (
  aspects: readonly RawReviewAspectInput[] | undefined,
  ctx: z.RefinementCtx,
): void => {
  if (!aspects?.length) {
    return;
  }

  const seen = new Set<string>();

  aspects.forEach((item, index) => {
    if (seen.has(item.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aspects', index, 'type'],
        message: `duplicate aspect type "${item.type}"`,
      });
      return;
    }

    seen.add(item.type);
  });
};

export const RawReviewSchema = z
  .object({
    published_at: reviewDate('published_at'),
    slug: text.refine((value) => REVIEW_SLUG.test(value), {
      message: 'slug must use lower-case Latin letters, digits, and hyphen',
    }),
    area: z.enum(AREAS),
    title: text.optional(),
    author: text.optional(),
    aspects: z.array(aspect).min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => validateUniqueAspectTypes(data.aspects, ctx));

export type RawReview = z.output<typeof RawReviewSchema>;
