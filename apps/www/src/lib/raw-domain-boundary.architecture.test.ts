import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');

const codeExtensions = ['.ts', '.astro', '.svelte'] as const;

const externalBoundaryPathParts = [
  '.test.',
  '/data/',
  '/fixtures/',
  '/raw-schema.ts',
  '/mapper.ts',
  '/public-dto.ts',
  '/discovery.ts',
  '/llms.ts',
  '/markdown.ts',
  '/content.config.ts',
  '/compare/lib/schema.ts',
  '/compare/lib/full.ts',
  '/compare/lib/explorer.ts',
  '/compare/lib/llms.ts',
  '/compare/lib/markdown.ts',
  '/compare/lib/settlement/schema.ts',
  '/lib/reglament/',
  '/pages/815/compare/data/',
  '/pages/815/regulation/',
  '/pages/news/data/',
  '/pages/status/data/',
  '/pages/people/data/',
  '/pages/.well-known/',
] as const;

const snakeCaseToken = /(?<![A-Z])\b[a-z][a-z0-9]*_[a-z0-9_]*\b/g;
const zodShortcutToken = /\bz\.(infer|output)</;
const exportedZodDomainTypeToken =
  /export type (?!Raw)[A-Z][A-Za-z0-9]* = z\.(infer|output)</;
const readonlyPropertyToken = /readonly\s+\w+\??:/;
const allowedInternalSnakeTokens = new Set([
  'active_incident',
  'cover_alt',
  'date_checked',
  'ended_at',
  'ends_at',
  'has_time',
  'more_expensive',
  'no_incidents',
  'pinned_until',
  'rating_asc',
  'rating_desc',
  'site_name',
  'source_url',
  'started_at',
  'starts_at',
  'summary_large_image',
  'tariff_asc',
  'tariff_desc',
]);

const toRepoPath = (path: string): string =>
  relative(process.cwd(), path).split('\\').join('/');

const isCodeFile = (path: string): boolean =>
  codeExtensions.some((extension) => path.endsWith(extension));

const walk = (dir: string): readonly string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return isCodeFile(path) ? [path] : [];
  });

const isExternalBoundaryFile = (repoPath: string): boolean =>
  externalBoundaryPathParts.some((part) => `/${repoPath}`.includes(part));

const loadSourceFiles = (): readonly {
  readonly repoPath: string;
  readonly code: string;
}[] =>
  walk(SRC_ROOT).map((path) => ({
    repoPath: toRepoPath(path),
    code: readFileSync(path, 'utf-8'),
  }));

describe('raw/domain/public data boundary architecture', () => {
  it('keeps raw snake_case tokens out of internal domain files', () => {
    const violations = loadSourceFiles()
      .filter(({ repoPath }) => !isExternalBoundaryFile(repoPath))
      .flatMap(({ repoPath, code }) =>
        [...new Set(code.match(snakeCaseToken) ?? [])]
          .filter(
            (token) => !token.includes('__') && !token.startsWith('a11y_'),
          )
          .filter((token) => !allowedInternalSnakeTokens.has(token))
          .map((token) => `${repoPath}: ${token}`),
      );

    expect(violations).toEqual([]);
  });

  it('does not use Zod inferred types as domain shortcuts', () => {
    const violations = loadSourceFiles().flatMap(({ repoPath, code }) => {
      if (repoPath.endsWith('/types.ts')) {
        if (code.includes("from 'zod'") || zodShortcutToken.test(code)) {
          return [`${repoPath}: domain types must be handwritten`];
        }
      }

      if (exportedZodDomainTypeToken.test(code)) {
        return [`${repoPath}: exported Zod-inferred type must be Raw* only`];
      }

      return [];
    });

    expect(violations).toEqual([]);
  });

  it('keeps domain types readonly instead of mutable arrays or maps', () => {
    const violations = loadSourceFiles()
      .filter(({ repoPath }) => repoPath.endsWith('/types.ts'))
      .flatMap(({ repoPath, code }) =>
        code
          .split('\n')
          .map((line, index) => ({ line, index: index + 1 }))
          .filter(({ line }) => readonlyPropertyToken.test(line))
          .filter(
            ({ line }) =>
              !line.includes(': readonly ') && !line.includes(': ReadonlyMap<'),
          )
          .filter(({ line }) => /\b(?:Map|Set)<|\[]/.test(line))
          .map(({ index, line }) => `${repoPath}:${index}: ${line.trim()}`),
      );

    expect(violations).toEqual([]);
  });
});
