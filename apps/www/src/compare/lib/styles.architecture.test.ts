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

const expectDeclaration = (
  block: string,
  property: string,
  value: string,
): void => {
  expect(block).toMatch(
    new RegExp(`${property}:\\s*${escapeRegExp(value)}`, 'u'),
  );
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
    const shell = ruleBlock(css, '.ui-root-compare .ui-shell');
    const shellStrong = ruleBlock(css, '.ui-root-compare .ui-shell-strong');

    for (const block of [shell, shellStrong]) {
      expectDeclaration(block, 'background', 'transparent');
      expectDeclaration(block, 'border-inline', '0');
      expectDeclaration(block, 'border-bottom', '0');
      expectDeclaration(block, 'border-radius', '0');
      expectDeclaration(block, 'box-shadow', 'none');
    }
  });

  it('keeps chips and buttons from becoming default decorative pills', () => {
    const css = load();
    const chip = ruleBlock(css, '.ui-root-compare .ui-chip');
    const button = ruleBlock(css, '.ui-root-compare .ui-btn');

    expectDeclaration(chip, 'padding', '0');
    expectDeclaration(chip, 'border', '0');
    expectDeclaration(chip, 'border-radius', '0');
    expectDeclaration(chip, 'background', 'transparent');
    expectDeclaration(button, 'border-radius', '0');
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
