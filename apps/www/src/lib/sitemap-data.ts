import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareRuText } from '@shelkovo/format';

import { parseNewsTimestamp } from './news/date';
import { normalizeTagKey } from './news/schema';
import {
  buildSitemapMetadataIndex,
  type SitemapMeetingInput,
  type SitemapMetadataIndex,
  type SitemapNewsArticleInput,
  type SitemapSettlementInput,
  type SitemapStatusIncidentInput,
} from './sitemap';

interface MarkdownParts {
  readonly frontmatter: string;
  readonly body: string;
}

const MARKDOWN_FRONTMATTER =
  /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---(?:\r?\n(?<body>[\s\S]*))?$/u;
const NEWS_DATE = /^\s*(?:-\s*)?date:\s*(?<value>.+?)\s*$/gmu;
const TAGS = /^tags:\s*\n(?<items>(?:\s+-\s*.+\s*\n?)+)/mu;
const TAG_ITEM = /^\s+-\s*(?<value>.+?)\s*$/gmu;
const SOURCE_DATE_CHECKED =
  /^\s*date_checked:\s*(?<value>\d{4}-\d{2}-\d{2})\s*$/gmu;

const newsArticlesDir = fileURLToPath(
  new URL('../data/news/articles/', import.meta.url),
);
const statusIncidentsDir = fileURLToPath(
  new URL('../data/status/incidents/', import.meta.url),
);
const settlementsDir = fileURLToPath(
  new URL('../data/compare/settlements/', import.meta.url),
);
const meetingsDir = fileURLToPath(
  new URL('../data/meetings/', import.meta.url),
);

const scalarField = (source: string, name: string): string | undefined => {
  const match = source.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'mu'));
  return match?.[1]?.trim();
};

const stripQuotes = (value: string): string =>
  value.replace(/^['"]|['"]$/gu, '').trim();

const markdownParts = (path: string): MarkdownParts => {
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(MARKDOWN_FRONTMATTER);

  if (!match?.groups) {
    throw new Error(`markdown frontmatter is required in ${path}`);
  }

  return {
    frontmatter: match.groups.frontmatter,
    body: match.groups.body ?? '',
  };
};

function listFiles(root: string, extension: string): readonly string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(path, extension));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path);
    }
  }

  return files.sort(compareRuText);
}

const relativeEntryId = (
  root: string,
  path: string,
  extension: string,
): string => {
  const entry = relative(root, path).replaceAll('\\', '/');
  const stem = entry.endsWith(extension)
    ? entry.slice(0, -extension.length)
    : entry;

  return stem.replace(/\/index$/u, '');
};

const latestTimestamp = (
  values: readonly string[],
  context: string,
): string => {
  const latest = values.reduce<string | undefined>((result, value) => {
    if (!result) {
      return value;
    }

    return Date.parse(value) >= Date.parse(result) ? value : result;
  }, undefined);

  if (!latest) {
    throw new Error(`${context} must include date`);
  }

  return latest;
};

const parseTimestamp = (value: string, context: string): string => {
  const timestamp = parseNewsTimestamp(stripQuotes(value));

  if (!timestamp) {
    throw new Error(`${context} must use a supported date format`);
  }

  return timestamp.has_time
    ? timestamp.iso
    : `${timestamp.year}-${timestamp.month}-${timestamp.day}`;
};

const newsDates = (frontmatter: string, context: string): readonly string[] =>
  [...frontmatter.matchAll(NEWS_DATE)].map((match) =>
    parseTimestamp(match.groups?.value ?? '', context),
  );

const newsTags = (frontmatter: string): readonly { readonly url: string }[] => {
  const items = frontmatter.match(TAGS)?.groups?.items;

  if (!items) {
    return [];
  }

  return [...items.matchAll(TAG_ITEM)].map((match) => ({
    url: `/news/tags/${normalizeTagKey(stripQuotes(match.groups?.value ?? ''))}/`,
  }));
};

const loadNewsArticlesForSitemap = (): readonly SitemapNewsArticleInput[] =>
  listFiles(newsArticlesDir, '.md').map((path) => {
    const id = relativeEntryId(newsArticlesDir, path, '.md');
    const [year, month, entry] = id.split('/');
    const context = `news article ${id}`;
    const { frontmatter } = markdownParts(path);
    const dates = newsDates(frontmatter, context);
    const latest = latestTimestamp(dates, context);

    if (!year || !month || !entry) {
      throw new Error(`${context} must resolve to YYYY/MM/[entry] with date`);
    }

    return {
      url: `/news/${year}/${month}/${entry}/`,
      publishedIso: dates[0] ?? latest,
      ...(latest !== dates[0] ? { updatedIso: latest } : {}),
      year: Number(year),
      month: Number(month),
      tags: newsTags(frontmatter),
    };
  });

const loadStatusIncidentsForSitemap =
  (): readonly SitemapStatusIncidentInput[] =>
    listFiles(statusIncidentsDir, '.md')
      .filter((path) => !path.endsWith('/AGENTS.md'))
      .map((path) => {
        const id = relativeEntryId(statusIncidentsDir, path, '.md');
        const [year, month, slug] = id.split('/');
        const context = `status incident ${id}`;
        const { frontmatter, body } = markdownParts(path);
        const service = scalarField(frontmatter, 'service');
        const startedAt = scalarField(frontmatter, 'started_at');
        const endedAt = scalarField(frontmatter, 'ended_at');

        if (!year || !month || !slug || !service || !startedAt) {
          throw new Error(
            `${context} must resolve to YYYY/MM/[slug] with service and started_at`,
          );
        }

        return {
          url: `/status/incidents/${year}/${month}/${slug}/`,
          service,
          startedIso: parseTimestamp(startedAt, `${context} started_at`),
          ...(endedAt
            ? { endedIso: parseTimestamp(endedAt, `${context} ended_at`) }
            : {}),
          hasPage: body.trim().length > 0,
        };
      });

const loadSettlementsForSitemap = (): readonly SitemapSettlementInput[] =>
  listFiles(settlementsDir, '.yaml')
    .filter((path) => !path.endsWith('/_template.yaml'))
    .map((path) => {
      const source = readFileSync(path, 'utf8');
      const slug = scalarField(source, 'slug');

      if (!slug) {
        throw new Error(`settlement ${path} must include slug`);
      }

      return {
        slug,
        sources: [...source.matchAll(SOURCE_DATE_CHECKED)].map((match) => ({
          dateChecked: match.groups?.value ?? '',
        })),
      };
    });

const loadMeetingsForSitemap = (): readonly SitemapMeetingInput[] =>
  listFiles(meetingsDir, '.md')
    .filter((path) => path.endsWith('/index.md'))
    .map((path) => {
      const id = relativeEntryId(meetingsDir, path, '.md');
      const parts = id.split('/');
      const [pathDate, pathSlug] = parts;
      const context = `meeting ${id}`;
      const { frontmatter } = markdownParts(path);
      const date = scalarField(frontmatter, 'date');
      const slug = scalarField(frontmatter, 'slug');
      const parsedDate = date ? parseTimestamp(date, `${context} date`) : '';
      const parsedSlug = slug ? stripQuotes(slug) : '';

      if (!pathDate || !pathSlug || parts.length !== 2) {
        throw new Error(
          `${context} must resolve to YYYY-MM-DD/[slug]/index.md`,
        );
      }

      if (!parsedDate || !parsedSlug) {
        throw new Error(`${context} must include date and slug`);
      }

      if (pathDate !== parsedDate || pathSlug !== parsedSlug) {
        throw new Error(`${context} path must match frontmatter date and slug`);
      }

      return {
        url: `/meetings/${parsedDate}/${parsedSlug}/`,
        date: parsedDate,
      };
    });

export const loadSitemapMetadataIndex =
  async (): Promise<SitemapMetadataIndex> =>
    buildSitemapMetadataIndex({
      newsArticles: loadNewsArticlesForSitemap(),
      statusIncidents: loadStatusIncidentsForSitemap(),
      settlements: loadSettlementsForSitemap(),
      meetings: loadMeetingsForSitemap(),
    });
