import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('settlements content collection', () => {
  const dir = join(process.cwd(), 'src/data/settlements');

  it('excludes template file from collection pattern', () => {
    const cfg = join(process.cwd(), 'src/content.config.ts');
    const code = readFileSync(cfg, 'utf-8');
    expect(code).toContain("pattern: '[!_]*.yaml'");
  });

  it('does not include settlement-slug in route data', () => {
    const files = readdirSync(dir).filter((name) => name.endsWith('.yaml') && !name.startsWith('_'));
    const slugs = files
      .map((name) => readFileSync(join(dir, name), 'utf-8'))
      .map((code) => code.match(/^slug:\s*["']?([^"'\n]+)["']?/m)?.[1])
      .filter((slug): slug is string => Boolean(slug));

    expect(slugs).not.toContain('settlement-slug');
  });
});
