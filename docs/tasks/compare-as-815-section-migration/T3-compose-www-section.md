# T3: Compose Compare Into `dist/www/815/compare` And Update Root Dev/Sitemap Wiring

Status: done

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Изменить root build/dev integration so section build lands under `/815/compare/` and root sitemap points at the new compare sitemap.

## Acceptance Criteria

- [x] `scripts/compose-www.mjs` copies `apps/compare/dist/section` into `dist/www/815/compare`.
- [x] `apps/www/astro.config.ts` dev proxy forwards `/815/compare` compare requests and compare-origin dev assets.
- [x] `apps/www/astro.config.ts` custom sitemap points at `https://kpshelkovo.online/815/compare/sitemap.xml`.
- [x] Root/local docs mentioning compare section path are updated where they describe current behavior.

## Verification

- [x] `pnpm build:main`
- [x] `test -f dist/www/815/compare/index.html`
- [x] Sample `dist/www/sitemap-index.xml` or generated sitemap references the new compare sitemap URL.

## Dependencies

- T2.

## Likely Touched Files

- `scripts/compose-www.mjs`
- `apps/www/astro.config.ts`
- `AGENTS.md`
- `apps/www/AGENTS.md`
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T3-compose-www-section.md`

## Estimated Scope

M.

## Completion

- [x] Mark this file `Status: done`.
- [x] Update task index status.
- [x] Update handoff task registry and task log.
- [x] Commit this task separately.
