import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');

const load = (): string => readFileSync(path, 'utf-8');
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ruleBlock = (css: string, selector: string): string => {
  const [block] =
    css.match(
      new RegExp(`${escapeRegExp(selector)}\\s*\\{[\\s\\S]*?\\n\\}`, 'u'),
    ) ?? [];

  if (block === undefined) {
    throw new Error(`Missing CSS rule for ${selector}`);
  }

  return block.trim();
};

describe('compare shared-style overrides', () => {
  it('keeps local overrides for shared shell and action primitives', () => {
    const css = load();

    expect(css).toContain("@import '@shelkovo/ui/styles.css';");
    expect(css).toContain('.ui-root-compare .ui-shell {');
    expect(css).toContain('.ui-root-compare .ui-shell-strong {');
    expect(css).toContain('.ui-root-compare .ui-chip {');
    expect(css).toContain('.ui-root-compare .ui-btn {');
  });

  it('keeps shell primitives flat by default', () => {
    const css = load();

    expect(ruleBlock(css, '.ui-root-compare .ui-shell')).toMatchInlineSnapshot(`
      ".ui-root-compare .ui-shell {
        background: transparent;
        border-top: 1px solid
          color-mix(in oklab, var(--color-border) 92%, transparent);
        border-inline: 0;
        border-bottom: 0;
        border-radius: 0;
        box-shadow: none;
      }"
    `);
    expect(ruleBlock(css, '.ui-root-compare .ui-shell-strong'))
      .toMatchInlineSnapshot(`
      ".ui-root-compare .ui-shell-strong {
        background: transparent;
        border-top: 2px solid var(--color-border-strong);
        border-inline: 0;
        border-bottom: 0;
        border-radius: 0;
        box-shadow: none;
      }"
    `);
  });

  it('keeps chips and buttons from becoming default decorative pills', () => {
    const css = load();

    expect(ruleBlock(css, '.ui-root-compare .ui-chip')).toMatchInlineSnapshot(`
      ".ui-root-compare .ui-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 0.45rem;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--color-muted-foreground);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }"
    `);
    expect(ruleBlock(css, '.ui-root-compare .ui-btn')).toMatchInlineSnapshot(`
      ".ui-root-compare .ui-btn {
        border-radius: 0;
      }"
    `);
  });

  it('rejects the old raised shell vocabulary', () => {
    const css = load();
    const shellBlocks = [
      ruleBlock(css, '.ui-root-compare .ui-shell'),
      ruleBlock(css, '.ui-root-compare .ui-shell-strong'),
    ].join('\n');

    expect(shellBlocks).not.toMatch(
      /box-shadow:\s*var\(--shadow-[12]\)|border-radius:\s*1rem|background:\s*var\(--color-(?:card|elevated)\)/u,
    );
  });
});
