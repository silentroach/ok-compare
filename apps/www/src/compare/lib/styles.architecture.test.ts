import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');

const load = (): string => readFileSync(path, 'utf-8');

describe('compare shared-style overrides', () => {
  it('keeps local overrides for shared shell and action primitives', () => {
    const css = load();

    expect(css).toContain("@import '@shelkovo/ui/styles.css';");
    expect(css).toContain('.ui-root-compare .ui-shell {');
    expect(css).toContain('.ui-root-compare .ui-shell-strong {');
    expect(css).toContain('.ui-root-compare .ui-chip {');
    expect(css).toContain('.ui-root-compare .ui-btn {');
  });
});
