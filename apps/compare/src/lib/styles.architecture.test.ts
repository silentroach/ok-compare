import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/styles/global.css');

const load = (): string => readFileSync(path, 'utf-8');

describe('compare shared-style overrides', () => {
  it('keeps local overrides for shared shell and action primitives', () => {
    const css = load();

    expect(css).toContain("@import '@shelkovo/ui/styles.css';");
    expect(css).toContain('.ui-shell {');
    expect(css).toContain('.ui-shell-strong {');
    expect(css).toContain('.ui-chip {');
    expect(css).toContain('.ui-btn {');
  });
});
