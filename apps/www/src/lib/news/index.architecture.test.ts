import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentConfigPath = join(process.cwd(), 'src/content.config.ts');
const schemaPath = join(process.cwd(), 'src/lib/news/schema.ts');
const typesPath = join(process.cwd(), 'src/lib/news/types.ts');
const rawSchemaPath = join(process.cwd(), 'src/lib/news/raw-schema.ts');
const domainContractPaths = [
  'src/lib/news/types.ts',
  'src/lib/news/mentions.ts',
  'src/lib/news/sort.ts',
  'src/lib/news/view.ts',
  'src/lib/news/archives.ts',
  'src/lib/news/tags.ts',
  'src/lib/news/calendar.ts',
  'src/lib/news/seo.ts',
  'src/lib/sitemap.ts',
  'src/lib/sitemap-data.ts',
  'src/components/news/NewsCard.astro',
  'src/components/news/NewsEventCard.astro',
  'src/pages/index.astro',
  'src/pages/news/[year]/[month]/[entry]/index.astro',
  'src/pages/news/feed.xml.ts',
].map((path) => join(process.cwd(), path));
const newsUiContractPaths = [
  'src/components/news/NewsMeta.astro',
  'src/components/news/NewsCard.astro',
  'src/pages/news/[year]/[month]/[entry]/index.astro',
].map((path) => join(process.cwd(), path));
const rawArticleDomainTokens = [
  'markdown_url',
  'published_at',
  'published_iso',
  'source_url',
  'cover_url',
  'cover_alt',
  'cover_width',
  'cover_height',
  'starts_at',
  'starts_iso',
  'starts_time',
  'ends_at',
  'ends_iso',
  'ends_time',
  'ics_url',
  'applies_to_all_areas',
  'news_articles',
  'by_id',
  'by_tag',
  'by_year',
  'by_month',
  'mention_registry',
] as const;

const loadContentConfig = (): string =>
  readFileSync(contentConfigPath, 'utf-8');
const loadSchema = (): string => readFileSync(schemaPath, 'utf-8');
const loadTypes = (): string => readFileSync(typesPath, 'utf-8');
const loadRawSchema = (): string => readFileSync(rawSchemaPath, 'utf-8');
const loadDomainContracts = (): Record<string, string> =>
  Object.fromEntries(
    domainContractPaths.map((path) => [path, readFileSync(path, 'utf-8')]),
  );
const loadNewsUiContracts = (): Record<string, string> =>
  Object.fromEntries(
    newsUiContractPaths.map((path) => [path, readFileSync(path, 'utf-8')]),
  );

describe('news raw/domain data boundary', () => {
  it('keeps news domain interfaces in types.ts instead of schema.ts', () => {
    expect(loadTypes()).toContain('export interface NewsAuthor');
    expect(loadTypes()).toContain('readonly shortName?: string');
    expect(loadSchema()).not.toMatch(/export interface News[A-Z]/);
    expect(loadSchema()).not.toContain('short_name?: string');
  });

  it('keeps reusable raw schemas outside content.config.ts', () => {
    const contentConfig = loadContentConfig();
    const rawSchema = loadRawSchema();

    expect(contentConfig).toContain('RawNewsAuthorSchema');
    expect(contentConfig).toContain('createRawNewsArticleSchema');
    expect(rawSchema).toContain('export const RawNewsAuthorSchema');
    expect(rawSchema).toContain('export const createRawNewsArticleSchema');
    expect(contentConfig).not.toContain('short_name: text(');
    expect(contentConfig).not.toContain('starts_at: newsDateTime(');
  });

  it('keeps raw author field names out of news UI contracts', () => {
    for (const [path, code] of Object.entries(loadNewsUiContracts())) {
      expect(code, `${path} must use domain author.shortName`).not.toContain(
        'short_name',
      );
    }
  });

  it('keeps raw article field names out of news domain contracts', () => {
    for (const [path, code] of Object.entries(loadDomainContracts())) {
      for (const token of rawArticleDomainTokens) {
        expect(code, `${path} must use camelCase domain fields`).not.toContain(
          token,
        );
      }
    }
  });
});
