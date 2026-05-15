import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/compare/styles/global.css');
const sharedStyleImport = "@import '@shelkovo/ui/styles.css';";
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

describe('compare shared-style architecture', () => {
  it('inherits shared UI styles from BaseLayout instead of importing them again', () => {
    const css = load();

    expect(
      css,
      'compare pages use BaseLayout, so compare CSS must not re-import shared UI styles',
    ).not.toContain(sharedStyleImport);
  });

  it('does not override shared UI primitives inside the compare root', () => {
    const css = load();
    const forbiddenSelectors = compareSharedPrimitiveSelectors.filter(
      (selector) =>
        new RegExp(`${escapeRegExp(selector)}\\s*\\{`, 'u').test(css),
    );

    expect(
      forbiddenSelectors,
      'compare must inherit shared UI primitives; use compare-* classes for domain-specific local styles',
    ).toEqual([]);
  });
});
