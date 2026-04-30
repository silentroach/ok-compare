import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  NEWS_AREAS,
  NEWS_AUTHOR_KINDS,
  isAbsoluteUrl,
  isAttachmentUrl,
  normalizeTagKey,
} from './lib/news/schema';

const YEAR = /^\d{4}$/;
const MONTH = /^(0[1-9]|1[0-2])$/;
const DAY_KEY = /^(?:0?[1-9]|[12]\d|3[01])$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const TAG = /^[а-яё0-9 -]+$/u;

interface DateParts {
  readonly year: string;
  readonly month: string;
  readonly day: string;
}

const text = (name: string) =>
  z
    .string()
    .min(1, `${name} is required`)
    .refine((value) => value.trim().length > 0, `${name} must not be blank`)
    .refine(
      (value) => value === value.trim(),
      `${name} must not start or end with whitespace`,
    );

const absoluteUrl = (name: string) =>
  text(name).refine(
    (value) => isAbsoluteUrl(value),
    `${name} must be an absolute URL`,
  );

const attachmentUrl = (name: string) =>
  text(name).refine(
    (value) => isAttachmentUrl(value),
    `${name} must be an absolute URL or a root-relative path`,
  );

const time = (name: string) =>
  text(name).refine(
    (value) => TIME.test(value),
    `${name} must use HH:MM or HH:MM:SS`,
  );

const tag = () =>
  text('tags[]')
    .refine(
      (value) => value === value.toLowerCase(),
      'tags[] must be lower-case',
    )
    .refine(
      (value) => TAG.test(value),
      'tags[] may contain only Cyrillic, digits, spaces, and hyphen',
    );

const attachment = () =>
  z.object({
    title: text('attachments[].title'),
    url: attachmentUrl('attachments[].url'),
    type: text('attachments[].type').optional(),
    size: text('attachments[].size').optional(),
  });

const photo = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    alt: text('photos[].alt'),
    caption: text('photos[].caption').optional(),
  });

const media = (image: SchemaContext['image']) => ({
  photos: z.array(photo(image)).min(1).optional(),
  attachments: z.array(attachment()).min(1).optional(),
});

function addendum(image: SchemaContext['image']) {
  return z
    .object({
      date: z.coerce.date(),
      time: time('addenda[].time').optional(),
      title: text('addenda[].title').optional(),
      author: reference('newsAuthors').optional(),
      source_url: absoluteUrl('addenda[].source_url').optional(),
      body: text('addenda[].body').optional(),
      ...media(image),
    })
    .superRefine((data, ctx) => {
      if (
        data.title ||
        data.body ||
        data.source_url ||
        data.photos?.length ||
        data.attachments?.length
      ) {
        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['body'],
        message:
          'addenda[] must include body, title, source_url, photos, or attachments',
      });
    });
}

const trimMarkdown = (entry: string): string => entry.replace(/\.md$/i, '');

const articleId = (entry: string): string =>
  trimMarkdown(entry).replace(/\/index$/i, '');

function readDateParts(data: unknown): readonly DateParts[] {
  if (!data || typeof data !== 'object' || !('date' in data)) {
    return [];
  }

  const value = (data as { date?: unknown }).date;

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return [
        {
          year: match[1],
          month: match[2],
          day: match[3],
        },
      ];
    }

    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? [] : dateParts(date);
  }

  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? [] : dateParts(value);
  }

  return [];
}

function dateParts(date: Date): readonly DateParts[] {
  const local = {
    year: String(date.getFullYear()).padStart(4, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  } satisfies DateParts;
  const utc = {
    year: String(date.getUTCFullYear()).padStart(4, '0'),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
    day: String(date.getUTCDate()).padStart(2, '0'),
  } satisfies DateParts;

  return local.year === utc.year &&
    local.month === utc.month &&
    local.day === utc.day
    ? [local]
    : [local, utc];
}

function fail(
  kind: 'article' | 'addendum',
  entry: string,
  reason: string,
): never {
  throw new Error(`news ${kind} path \"${entry}\" ${reason}`);
}

function validateArticleEntry(entry: string, data: unknown): void {
  const id = articleId(entry);
  const parts = id.split('/');

  if (parts.length !== 3) {
    fail('article', entry, 'must resolve to YYYY/MM/[entry]');
  }

  const [year, month, key] = parts;

  if (!YEAR.test(year) || !MONTH.test(month) || key.length === 0) {
    fail(
      'article',
      entry,
      'must use YYYY/MM/[entry] with numeric year and month',
    );
  }

  const dates = readDateParts(data);

  if (
    dates.length > 0 &&
    !dates.some((date) => date.year === year && date.month === month)
  ) {
    fail('article', entry, 'must match the frontmatter date year and month');
  }

  if (!/^\d+$/.test(key)) {
    return;
  }

  if (!DAY_KEY.test(key)) {
    fail('article', entry, 'numeric day keys must be valid calendar days');
  }

  if (
    dates.length > 0 &&
    !dates.some((date) => Number(key) === Number(date.day))
  ) {
    fail(
      'article',
      entry,
      'numeric day keys must match the frontmatter date day',
    );
  }
}

function validateTags(
  tags: readonly string[] | undefined,
  ctx: z.RefinementCtx,
): void {
  if (!tags) {
    return;
  }

  const seen = new Set<string>();

  tags.forEach((item, index) => {
    const key = normalizeTagKey(item);

    if (!key) {
      return;
    }

    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tags', index],
        message: `duplicate tag key \"${key}\" after normalization`,
      });
      return;
    }

    seen.add(key);
  });
}

const newsAuthors = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/data/news/authors',
  }),
  schema: z.object({
    name: text('name'),
    kind: z.enum(NEWS_AUTHOR_KINDS),
    short_name: text('short_name').optional(),
    url: absoluteUrl('url').optional(),
    role: text('role').optional(),
    is_official: z.boolean().optional(),
  }),
});

const newsArticles = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/data/news/articles',
    generateId: ({ entry, data }) => {
      validateArticleEntry(entry, data);
      return articleId(entry);
    },
  }),
  schema: ({ image }) =>
    z
      .object({
        title: text('title'),
        summary: text('summary'),
        date: z.coerce.date(),
        time: time('time').optional(),
        author: reference('newsAuthors'),
        pinned: z.boolean().optional(),
        areas: z.array(z.enum(NEWS_AREAS)).min(1).optional(),
        tags: z.array(tag()).min(1).optional(),
        source_url: absoluteUrl('source_url').optional(),
        cover: image().optional(),
        cover_alt: text('cover_alt').optional(),
        ...media(image),
        addenda: z.array(addendum(image)).min(1).optional(),
        seo_title: text('seo_title').optional(),
        seo_description: text('seo_description').optional(),
      })
      .superRefine((data, ctx) => {
        if (data.cover && !data.cover_alt) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cover_alt'],
            message: 'cover_alt is required when cover is set',
          });
        }

        validateTags(data.tags, ctx);
      }),
});

export const collections = {
  newsAuthors,
  newsArticles,
};
