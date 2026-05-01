import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  normalizeNewsTimestampInput,
  parseNewsTimestampInput,
} from './lib/news/date';
import {
  NEWS_AREAS,
  NEWS_AUTHOR_KINDS,
  isAbsoluteUrl,
  isAttachmentUrl,
  normalizeTagKey,
} from './lib/news/schema';
import {
  normalizeStatusTimestampInput,
  parseStatusTimestampInput,
  STATUS_AREAS,
  STATUS_KINDS,
  STATUS_SERVICES,
} from './lib/status/schema';

const YEAR = /^\d{4}$/;
const MONTH = /^(0[1-9]|1[0-2])$/;
const DAY_KEY = /^(?:0?[1-9]|[12]\d|3[01])$/;
const TAG = /^[а-яё0-9 -]+$/u;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MARKDOWN_FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)*/u;
const STATUS_INCIDENTS_DIR = fileURLToPath(
  new URL('./data/status/incidents/', import.meta.url),
);

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

const newsDate = (name: string) =>
  z.union([text(name), z.date()]).transform((value, ctx) => {
    const normalized = normalizeNewsTimestampInput(value);

    if (normalized && parseNewsTimestampInput(value)) {
      return normalized;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    });

    return z.NEVER;
  });

const statusDate = (name: string) =>
  z.union([text(name), z.date()]).transform((value, ctx) => {
    const normalized = normalizeStatusTimestampInput(value);

    if (normalized && parseStatusTimestampInput(value)) {
      return normalized;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    });

    return z.NEVER;
  });

const forbiddenTime = (name: string) =>
  text(name).refine(
    () => false,
    `${name} is not supported; include time in date as dd.mm.yyyy hh:mm`,
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
      date: newsDate('addenda[].date'),
      time: forbiddenTime('addenda[].time').optional(),
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

const rawMarkdownBody = (root: string, entry: string): string =>
  readFileSync(join(root, entry), 'utf8').replace(MARKDOWN_FRONTMATTER, '');

const articleId = (entry: string): string =>
  trimMarkdown(entry).replace(/\/index$/i, '');

const hasDate = (data: unknown): data is { readonly date: unknown } =>
  typeof data === 'object' && data !== null && 'date' in data;

function readDateParts(data: unknown): readonly DateParts[] {
  if (!hasDate(data)) {
    return [];
  }

  const parsed = parseNewsTimestampInput(data.date);

  return parsed
    ? [
        {
          year: parsed.year,
          month: parsed.month,
          day: parsed.day,
        },
      ]
    : [];
}

function fail(
  kind: 'article' | 'addendum',
  entry: string,
  reason: string,
): never {
  throw new Error(`news ${kind} path \"${entry}\" ${reason}`);
}

function failStatus(entry: string, reason: string): never {
  throw new Error(`status incident path \"${entry}\" ${reason}`);
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

const hasStartedAt = (
  data: unknown,
): data is { readonly started_at: unknown } =>
  typeof data === 'object' && data !== null && 'started_at' in data;

function validateStatusEntry(entry: string, data: unknown): void {
  const id = trimMarkdown(entry);
  const parts = id.split('/');

  if (parts.length !== 3) {
    failStatus(entry, 'must resolve to YYYY/MM/[slug]');
  }

  const [year, month, slug] = parts;

  if (!YEAR.test(year) || !MONTH.test(month) || slug.length === 0) {
    failStatus(entry, 'must use YYYY/MM/[slug] with numeric year and month');
  }

  if (!SLUG.test(slug)) {
    failStatus(
      entry,
      'slug must use lower-case Latin letters, digits, and hyphen',
    );
  }

  const started = hasStartedAt(data)
    ? parseStatusTimestampInput(data.started_at)
    : undefined;

  if (started && (started.year !== year || started.month !== month)) {
    failStatus(entry, 'must match the frontmatter started_at year and month');
  }

  const body = rawMarkdownBody(STATUS_INCIDENTS_DIR, entry);

  if (body.length > 0 && body.trim().length === 0) {
    failStatus(entry, 'body must not be blank');
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
        date: newsDate('date'),
        time: forbiddenTime('time').optional(),
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

const statusIncidents = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/data/status/incidents',
    generateId: ({ entry, data }) => {
      validateStatusEntry(entry, data);
      return trimMarkdown(entry);
    },
  }),
  schema: z
    .object({
      title: text('title'),
      service: z.enum(STATUS_SERVICES),
      kind: z.enum(STATUS_KINDS),
      started_at: statusDate('started_at'),
      ended_at: statusDate('ended_at').optional(),
      areas: z.array(z.enum(STATUS_AREAS)).min(1).optional(),
      source_url: absoluteUrl('source_url').optional(),
    })
    .superRefine((data, ctx) => {
      const started = parseStatusTimestampInput(data.started_at);
      const ended = data.ended_at
        ? parseStatusTimestampInput(data.ended_at)
        : undefined;

      if (started && ended && ended.at.valueOf() < started.at.valueOf()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ended_at'],
          message: 'ended_at must be later than or equal to started_at',
        });
      }
    }),
});

export const collections = {
  newsAuthors,
  newsArticles,
  statusIncidents,
};
