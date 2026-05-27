import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseNewsTimestampInput } from './lib/news/date';
import {
  RawNewsAuthorSchema,
  createRawNewsArticleSchema,
} from './lib/news/raw-schema';
import { RawMeetingFrontmatterSchema } from './lib/meetings/raw-schema';
import { createMeetingSourceId } from './lib/meetings/source';
import { RawPersonProfileSchema } from './lib/people/raw-schema';
import { RawStatusIncidentSchema } from './lib/status/raw-schema';
import { parseStatusTimestampInput } from './lib/status/schema';
import { SettlementSchema } from './compare/lib/schema';

const YEAR = /^\d{4}$/;
const MONTH = /^(0[1-9]|1[0-2])$/;
const DAY_KEY = /^(?:0?[1-9]|[12]\d|3[01])$/;
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

function fail(kind: 'article', entry: string, reason: string): never {
  throw new Error(`news ${kind} path \"${entry}\" ${reason}`);
}

function failStatus(entry: string, reason: string): never {
  throw new Error(`status incident path \"${entry}\" ${reason}`);
}

function failPerson(entry: string, reason: string): never {
  throw new Error(`person profile path \"${entry}\" ${reason}`);
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

function validatePersonEntry(entry: string): void {
  if (entry.includes('/')) {
    failPerson(entry, 'must live directly under src/data/people');
  }

  const slug = trimMarkdown(entry);

  if (!SLUG.test(slug)) {
    failPerson(
      entry,
      'slug must use lower-case Latin letters, digits, and hyphen',
    );
  }
}

const newsAuthors = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/data/news/authors',
  }),
  schema: RawNewsAuthorSchema,
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
  schema: ({ image }) => createRawNewsArticleSchema(image),
});

const statusIncidents = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/AGENTS.md'],
    base: './src/data/status/incidents',
    generateId: ({ entry, data }) => {
      validateStatusEntry(entry, data);
      return trimMarkdown(entry);
    },
  }),
  schema: RawStatusIncidentSchema,
});

const peopleProfiles = defineCollection({
  loader: glob({
    pattern: ['*.md', '!AGENTS.md'],
    base: './src/data/people',
    generateId: ({ entry }) => {
      validatePersonEntry(entry);
      return trimMarkdown(entry);
    },
  }),
  schema: RawPersonProfileSchema,
});

const meetings = defineCollection({
  loader: glob({
    pattern: ['**/index.md', '!AGENTS.md'],
    base: './src/data/meetings',
    generateId: ({ entry, data }) => createMeetingSourceId(entry, data),
  }),
  schema: RawMeetingFrontmatterSchema,
});

const settlements = defineCollection({
  loader: glob({
    pattern: '[!_]*.yaml',
    base: './src/data/compare/settlements',
  }),
  schema: SettlementSchema,
});

export const collections = {
  newsAuthors,
  newsArticles,
  settlements,
  statusIncidents,
  peopleProfiles,
  meetings,
};
