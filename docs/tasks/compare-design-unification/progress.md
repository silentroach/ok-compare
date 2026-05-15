# Progress

## Task 01: Update compare style architecture guard

- Active runtime task: `task-1778869760-134f`.
- Focused RED check: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` failed as expected after rewriting the guard because `global.css` still imported shared UI styles and overrode shared `.ui-*` primitives.
- GREEN change: removed the duplicate shared UI import and forbidden `.ui-root-compare .ui-*` primitive override rules from `apps/www/src/compare/styles/global.css`, leaving compare-specific styles in place.
- Final verification: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` passed with 82 files / 476 tests.
- Extra verification: `pnpm --filter @shelkovo/www typecheck` passed.

## Task 01 rejection fix: robust architecture guard

- Review feedback: guard missed double-quote imports, grouped selectors, and pseudo-state shared primitive overrides.
- RED check: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` failed with 3 expected failures after adding regression coverage for those variants.
- GREEN change: import detection now accepts both quote styles and `url(...)`, and forbidden selector detection now catches exact shared primitive classes in grouped or pseudo-state selector rules.
- Final verification: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` passed with 82 files / 479 tests.
- Extra verification: `pnpm --filter @shelkovo/www typecheck` passed.

## Task 01 rejection fix: CSS whitespace descendant selectors

- Review feedback: guard missed valid CSS descendant selectors when whitespace between `.ui-root-compare` and shared `.ui-*` primitive was a newline or tab.
- RED check: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` failed as expected after adding newline/tab regression coverage.
- GREEN change: selector detection now treats the canonical descendant space as CSS whitespace (`tab`, `newline`, `form feed`, `carriage return`, or regular space) while preserving the exact primitive class boundary.
- Focused verification: `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts` passed with 82 files / 480 tests.
