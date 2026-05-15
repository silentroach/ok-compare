import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');
const cssTokenSeparatorPattern = String.raw`(?:[\t\n\f\r ]|\/\*[^]*?\*\/)+`;
const optionalCssTokenSeparatorPattern = `(?:${cssTokenSeparatorPattern})?`;
const sharedStyleUrl = '@shelkovo/ui/styles.css';
const cssStringPattern = String.raw`(?:(?:"(?:\\[^]|[^"\\])*")|(?:'(?:\\[^]|[^'\\])*'))`;
const sharedStyleImportPattern = new RegExp(
  String.raw`@import${cssTokenSeparatorPattern}(?:url\(${optionalCssTokenSeparatorPattern}(?<url>${cssStringPattern}|[^)]*?)${optionalCssTokenSeparatorPattern}\)|(?<quoted>${cssStringPattern}))[^;]*;`,
  'giu',
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
const decodeCssEscapes = (value: string): string =>
  value.replace(
    /\\(?:([\da-f]{1,6})[\t\n\f\r ]?|([^\da-f]))/giu,
    (_escape, hex: string | undefined, character: string | undefined) =>
      hex === undefined
        ? (character ?? '')
        : String.fromCodePoint(Number.parseInt(hex, 16)),
  );
const stripCssUrlQuotes = (value: string): string => {
  const trimmedValue = value.trim();
  const firstCharacter = trimmedValue[0];
  const lastCharacter = trimmedValue.at(-1);

  return (firstCharacter === '"' || firstCharacter === "'") &&
    firstCharacter === lastCharacter
    ? trimmedValue.slice(1, -1)
    : trimmedValue;
};
const selectorClassBoundaryPattern = String.raw`(?![-_a-zA-Z0-9])`;
const hasDuplicateSharedStyleImport = (css: string): boolean =>
  [...css.matchAll(sharedStyleImportPattern)].some(({ groups }) => {
    const importTarget = groups?.url ?? groups?.quoted;

    return (
      importTarget !== undefined &&
      decodeCssEscapes(stripCssUrlQuotes(importTarget)) === sharedStyleUrl
    );
  });
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
const getCssStringEndIndex = (css: string, startIndex: number): number => {
  const quote = css[startIndex];

  for (let index = startIndex + 1; index < css.length; index += 1) {
    if (css[index] === '\\') {
      index += 1;
      continue;
    }

    if (css[index] === quote) {
      return index;
    }
  }

  return css.length - 1;
};
const getCssCommentEndIndex = (css: string, startIndex: number): number => {
  const commentEndIndex = css.indexOf('*/', startIndex + 2);

  return commentEndIndex === -1 ? css.length - 1 : commentEndIndex + 1;
};
const getRuleSelectorPaths = (css: string): readonly (readonly string[])[] => {
  const selectorPaths: string[][] = [];
  const selectorStack: string[] = [];
  let segmentStart = 0;

  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];

    if (character === '/' && css[index + 1] === '*') {
      index = getCssCommentEndIndex(css, index);
      continue;
    }

    if (character === '"' || character === "'") {
      index = getCssStringEndIndex(css, index);
      continue;
    }

    if (character === '{') {
      const segment = css.slice(segmentStart, index);
      const selector = segment.slice(segment.lastIndexOf(';') + 1).trim();

      selectorStack.push(selector);
      selectorPaths.push([...selectorStack]);
      segmentStart = index + 1;
      continue;
    }

    if (character === '}') {
      selectorStack.pop();
      segmentStart = index + 1;
    }
  }

  return selectorPaths;
};
const hasSelectorRule = (css: string, selector: string): boolean => {
  const [rootSelector, primitiveSelector] = selector.split(' ');

  if (rootSelector === undefined || primitiveSelector === undefined) {
    return false;
  }

  const rootSelectorPattern = new RegExp(
    `${escapeRegExp(rootSelector)}${selectorClassBoundaryPattern}`,
    'u',
  );
  const primitiveSelectorPattern = new RegExp(
    `${escapeRegExp(primitiveSelector)}${selectorClassBoundaryPattern}`,
    'u',
  );

  return getRuleSelectorPaths(css).some((selectorPath) => {
    let hasCompareRoot = false;

    for (const selectorList of selectorPath) {
      const selectorItems =
        splitSelectorList(selectorList).map(decodeCssEscapes);
      const selectorListHasCompareRoot = selectorItems.some((selectorItem) =>
        rootSelectorPattern.test(selectorItem),
      );
      const selectorListHasSharedPrimitive = selectorItems.some(
        (selectorItem) => primitiveSelectorPattern.test(selectorItem),
      );

      if (
        (hasCompareRoot || selectorListHasCompareRoot) &&
        selectorListHasSharedPrimitive
      ) {
        return true;
      }

      if (selectorListHasCompareRoot) {
        hasCompareRoot = true;
      }
    }

    return false;
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

  it('detects shared UI imports written with CSS escapes', () => {
    expect(
      hasDuplicateSharedStyleImport('@import "@shelkovo\\/ui\\/styles.css";'),
    ).toBe(true);

    expect(
      hasDuplicateSharedStyleImport(
        '@import url(@shelkovo\\/ui\\/styles.css);',
      ),
    ).toBe(true);

    expect(
      hasDuplicateSharedStyleImport('@import "@shelkovo/ui/styles\\.css";'),
    ).toBe(true);

    expect(
      hasDuplicateSharedStyleImport(
        '@import "@shelkovo\\2f ui\\2f styles\\2e css";',
      ),
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

  it('detects forbidden primitive overrides in native nested CSS selectors', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare { .ui-btn { background: transparent; } }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare { & .ui-btn { background: transparent; } }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare { .compare-x, .ui-btn:hover { background: transparent; } }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });

  it('detects nested primitive overrides after braces inside CSS strings and comments', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare { --brace: "}"; .ui-btn { background: transparent; } }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare { /* } */ .ui-btn { background: transparent; } }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });

  it('detects forbidden primitive overrides with CSS-escaped selector class names', () => {
    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare .ui-\\62 tn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.ui-root-compare .\\75 i-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);

    expect(
      findForbiddenSharedPrimitiveSelectors(
        '.\\75 i-root-compare .ui-btn { background: transparent; }',
      ),
    ).toEqual(['.ui-root-compare .ui-btn']);
  });
});
