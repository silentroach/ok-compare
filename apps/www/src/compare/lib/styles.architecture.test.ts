import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');
const sharedStyleImportPattern =
  /@import\s+(?:url\()?['"]@shelkovo\/ui\/styles\.css['"]\)?\s*;/u;
const compareSharedPrimitiveSelectors = [
  '.ui-root-compare .ui-shell',
  '.ui-root-compare .ui-shell-strong',
  '.ui-root-compare .ui-chip',
  '.ui-root-compare .ui-btn',
  '.ui-root-compare .ui-copy',
  '.ui-root-compare .ui-link',
] as const;

const load = (): string => readFileSync(path, 'utf-8');
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const selectorToPattern = (selector: string): string =>
  selector.split(' ').map(escapeRegExp).join('[\\t\\n\\f\\r ]+');
const hasDuplicateSharedStyleImport = (css: string): boolean =>
  sharedStyleImportPattern.test(css);
const hasSelectorRule = (css: string, selector: string): boolean =>
  new RegExp(
    `${selectorToPattern(selector)}(?![-_a-zA-Z0-9])[^{}]*\\{`,
    'u',
  ).test(css);
const findForbiddenSharedPrimitiveSelectors = (
  css: string,
): readonly string[] =>
  compareSharedPrimitiveSelectors.filter((selector) =>
    hasSelectorRule(css, selector),
  );

describe('compare shared-style architecture', () => {
  it('inherits shared UI styles from BaseLayout instead of importing them again', () => {
    const css = load();

    expect(
      hasDuplicateSharedStyleImport(css),
      'compare pages use BaseLayout, so compare CSS must not re-import shared UI styles',
    ).toBe(false);
  });

  it('does not override shared UI primitives inside the compare root', () => {
    const css = load();
    const forbiddenSelectors = findForbiddenSharedPrimitiveSelectors(css);

    expect(
      forbiddenSelectors,
      'compare must inherit shared UI primitives; use compare-* classes for domain-specific local styles',
    ).toEqual([]);
  });

  it('detects shared UI imports regardless of quote style', () => {
    expect(
      hasDuplicateSharedStyleImport('@import "@shelkovo/ui/styles.css";'),
    ).toBe(true);
  });

  it('detects forbidden primitive overrides in grouped selectors', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare .ui-shell, .compare-panel { padding: 1rem; }',
      ),
    ).toEqual(['.ui-root-compare .ui-shell']);
  });

  it('detects forbidden primitive overrides with pseudo states', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare .ui-btn:hover { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });

  it('detects forbidden primitive overrides with CSS whitespace descendant selectors', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare\n.ui-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare\t.ui-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });
});
