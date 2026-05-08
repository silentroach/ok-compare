# T3: Compose Compare Into `dist/www/815/compare` And Update Root Dev/Sitemap Wiring

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Изменить root build/dev integration so section build lands under `/815/compare/` and root sitemap points at the new compare sitemap.

## Acceptance Criteria

- [ ] `scripts/compose-www.mjs` copies `apps/compare/dist/section` into `dist/www/815/compare`.
- [ ] `apps/www/astro.config.ts` dev proxy forwards `/815/compare` compare requests and compare-origin dev assets.
- [ ] `apps/www/astro.config.ts` custom sitemap points at `https://kpshelkovo.online/815/compare/sitemap.xml`.
- [ ] Root/local docs mentioning compare section path are updated where they describe current behavior.

## Verification

- [ ] `pnpm build:main`
- [ ] `test -f dist/www/815/compare/index.html`
- [ ] Sample `dist/www/sitemap-index.xml` or generated sitemap references the new compare sitemap URL.

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

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
