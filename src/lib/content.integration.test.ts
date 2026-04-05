import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src/data/settlements');

function list() {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yaml') && !name.startsWith('_'))
    .map((name) => ({
      name,
      code: readFileSync(join(dir, name), 'utf-8')
    }));
}

function parseSlug(code: string): string | undefined {
  return code.match(/^slug:\s*["']?([^"'\n]+)["']?/m)?.[1];
}

function parseBase(code: string): boolean | undefined {
  const v = code.match(/^is_baseline:\s*(true|false)\s*$/m)?.[1];
  if (!v) {
    return;
  }

  return v === 'true';
}

describe('settlements content collection', () => {
  it('does not include settlement-slug in route data', () => {
    const slugs = list()
      .map((file) => parseSlug(file.code))
      .filter((slug): slug is string => Boolean(slug));

    expect(slugs).not.toContain('settlement-slug');
  });

  it('uses unique slug values', () => {
    const rows = list().map((file) => ({
      name: file.name,
      slug: parseSlug(file.code)
    }));

    const miss = rows.filter((row) => !row.slug).map((row) => row.name);
    expect(miss, `Missing slug in files: ${miss.join(', ')}`).toEqual([]);

    const slugs = rows.map((row) => row.slug).filter((slug): slug is string => Boolean(slug));
    const dup = slugs.filter((slug, idx) => slugs.indexOf(slug) !== idx);
    expect(dup, `Duplicate slugs: ${dup.join(', ')}`).toEqual([]);
  });

  it('has exactly one baseline settlement', () => {
    const rows = list().map((file) => ({
      name: file.name,
      base: parseBase(file.code)
    }));

    const miss = rows.filter((row) => row.base === undefined).map((row) => row.name);
    expect(miss, `Missing is_baseline in files: ${miss.join(', ')}`).toEqual([]);

    const base = rows.filter((row) => row.base).map((row) => row.name);
    expect(base, `Baseline files: ${base.join(', ')}`).toHaveLength(1);
  });
});
