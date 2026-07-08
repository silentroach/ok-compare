import { z } from 'astro/zod';

import {
  CONTACT_CATEGORIES,
  CONTACT_REVIEW_SENTIMENTS,
  CONTACT_SLUG,
  isContactCalendarDate,
} from './schema';

const nonBlankText = z.string().trim().min(1);

const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const contactUrl = nonBlankText.url().refine(isHttpsUrl, {
  message: 'url must use https://',
});

const contactDate = (name: string) =>
  z.union([nonBlankText, z.date()]).transform((value, ctx) => {
    const normalized =
      value instanceof Date ? value.toISOString().slice(0, 10) : value;

    if (isContactCalendarDate(normalized)) {
      return normalized;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} must use YYYY-MM-DD`,
    });

    return z.NEVER;
  });

const contacts = z
  .object({
    phone: nonBlankText.optional(),
    telegram: contactUrl.optional(),
    whatsapp: contactUrl.optional(),
    email: nonBlankText.email().optional(),
    website: contactUrl.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.phone ||
      value.telegram ||
      value.whatsapp ||
      value.email ||
      value.website
    ) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'contacts must include at least one public contact method',
    });
  });

const location = z
  .object({
    title: nonBlankText,
    url: contactUrl,
    address: nonBlankText.optional(),
  })
  .strict();

const seo = z
  .object({
    description: nonBlankText.optional(),
  })
  .strict();

const review = z
  .object({
    sentiment: z.enum(CONTACT_REVIEW_SENTIMENTS),
    summary: nonBlankText,
    published_at: contactDate('reviews.published_at'),
    url: contactUrl,
  })
  .strict();

export const RawContactSchema = z
  .object({
    title: nonBlankText,
    slug: nonBlankText.refine((value) => CONTACT_SLUG.test(value), {
      message: 'slug must use lower-case Latin letters, digits, and hyphen',
    }),
    category: z.enum(CONTACT_CATEGORIES),
    updated_at: contactDate('updated_at'),
    summary: nonBlankText.optional(),
    contacts,
    location: location.optional(),
    reviews: z.array(review).optional(),
    seo: seo.optional(),
  })
  .strict();

export type RawContact = z.output<typeof RawContactSchema>;
