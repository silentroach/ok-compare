import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');
const cssTokenSeparatorPattern = String.raw`(?:[\t\n\f\r ]|\/\*[^]*?\*\/)+`;
const optionalCssTokenSeparatorPattern = `(?:${cssTokenSeparatorPattern})?`;
const sharedStyleUrlPattern = String.raw`@shelkovo\/ui\/styles\.css`;
const sharedStyleImportPattern = new RegExp(
  String.raw`@import${cssTokenSeparatorPattern}(?:url\(${optionalCssTokenSeparatorPattern}['"]?${sharedStyleUrlPattern}['"]?${optionalCssTokenSeparatorPattern}\)|['"]${sharedStyleUrlPattern}['"])[^;]*;`,
  'iu',
);
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
const selectorClassBoundaryPattern = String.raw`(?![-_a-zA-Z0-9])`;
const hasDuplicateSharedStyleImport = (css: string): boolean =>
  sharedStyleImportPattern.test(css);
const splitSelectorList = (selectorList: string): readonly string[] => {
  const selectors: string[] = [];
  let current = '';
  let wrapperDepth = 0;

  for (const character of selectorList) {
    if (character === '(') {
      wrapperDepth += 1;
    }

    if (character === ')') {
      wrapperDepth = Math.max(0, wrapperDepth - 1);
    }

    if (character === ',' && wrapperDepth === 0) {
      selectors.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  selectors.push(current);

  return selectors;
};
const hasSelectorRule = (css: string, selector: string): boolean => {
  const [rootSelector, primitiveSelector] = selector.split(' ');

  if (rootSelector === undefined || primitiveSelector === undefined) {
    return false;
  }

  const selectorPattern = new RegExp(
    `${escapeRegExp(rootSelector)}${selectorClassBoundaryPattern}[^{}]*${escapeRegExp(primitiveSelector)}${selectorClassBoundaryPattern}`,
    'u',
  );

  return [...css.matchAll(/([^{}]+)\{/gu)].some((match) => {
    const selectorList = match[1];

    if (selectorList === undefined) {
      return false;
    }

    return splitSelectorList(selectorList).some((selectorItem) =>
      selectorPattern.test(selectorItem),
    );
  });
};
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

  it('detects shared UI imports with url wrappers and trailing import conditions', () => {
    expect(
      hasDuplicateSharedStyleImport(
        '@import url( "@shelkovo/ui/styles.css" );',
      ),
    ).toBe(true);

    expect(
      hasDuplicateSharedStyleImport(
        '@import "@shelkovo/ui/styles.css" layer(base);',
      ),
    ).toBe(true);
  });

  it('detects shared UI imports with unquoted url wrappers', () => {
    expect(
      hasDuplicateSharedStyleImport('@import url(@shelkovo/ui/styles.css);'),
    ).toBe(true);
  });

  it('detects shared UI imports with CSS comments after the at-rule and uppercase import names', () => {
    expect(
      hasDuplicateSharedStyleImport('@import/**/"@shelkovo/ui/styles.css";'),
    ).toBe(true);

    expect(
      hasDuplicateSharedStyleImport('@IMPORT "@shelkovo/ui/styles.css";'),
    ).toBe(true);
  });

  it('detects forbidden primitive overrides when CSS comments separate selector tokens', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare/**/.ui-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });

  it('detects forbidden primitive overrides through child combinators and selector wrappers', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare > .ui-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare :where(.ui-btn) { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare :is(.ui-btn) { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });
});
