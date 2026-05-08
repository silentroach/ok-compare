# Compare as `/815/compare` Migration Handoff

This file is the shared context log for agents working through `docs/tasks/compare-as-815-section-migration.md` and the task files in `docs/tasks/compare-as-815-section-migration/`.

Use it to pass forward facts that are not obvious from the current task diff: command results, path decisions, redirect counts, discovered gotchas, intentional leftovers and external validation gaps.

## Update Protocol

1. Before starting a task, add a short note under `Task Log` with task ID, date and status `in_progress`.
2. During the task, append only context that another agent would need. Avoid narrating routine edits.
3. Before committing, update task status, verification results, intentional leftovers and commit hash/message if known.
4. Keep `Task Registry` in sync with `docs/tasks/compare-as-815-section-migration.md`.
5. Do not use this file as a substitute for code comments or tests.

## Task Registry

| ID  | Status | Commit                                  | Notes                                                                           |
| --- | ------ | --------------------------------------- | ------------------------------------------------------------------------------- |
| T1  | done   | `audit compare 815 migration surface`   | `docs/tasks/compare-as-815-section-migration/T1-audit-url-surface.md`           |
| T2  | done   | `move compare section base to 815 path` | `docs/tasks/compare-as-815-section-migration/T2-move-compare-base.md`           |
| T3  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T3-compose-www-section.md`         |
| T4  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T4-update-root-links-discovery.md` |
| T5  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T5-add-compare-breadcrumbs.md`     |
| T6  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T6-nginx-redirects.md`             |
| T7  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T7-remove-legacy-build.md`         |
| T8  | todo   |                                         | `docs/tasks/compare-as-815-section-migration/T8-final-verification.md`          |

## Current Context Snapshot

Date: 2026-05-08.

- Source idea: `docs/ideas/compare-as-815-section-migration.md`.
- Root app is `apps/www`; compare app is `apps/compare`; compare must remain a separate section build.
- Current compare section build and compare dev server use `COMPARE_BASE=/815/compare` and `COMPARE_CANONICAL_BASE=/815/compare` in `apps/compare/package.json`.
- `scripts/compose-www.mjs` currently copies `apps/compare/dist/section` to `dist/www/compare`.
- Root `apps/www/astro.config.ts` currently proxies dev requests whose URL starts with `/compare` and points `customSitemaps` at `https://kpshelkovo.online/compare/sitemap.xml`.
- Root-site compare references are known in `apps/www/src/lib/discovery.ts`, `apps/www/src/lib/llms.ts`, `apps/www/src/pages/index.astro`, `apps/www/public/.well-known/agent-skills/site-sections/SKILL.md` and `apps/www/AGENTS.md`.
- Compare JSON-LD breadcrumbs currently use `Сравнение поселков` as root-ish label on rating and settlement pages. The migration idea wants `Главная > Сравнение тарифов` and settlement pages adding the settlement name.
- Shared visible breadcrumbs component is exported as `@shelkovo/ui/Breadcrumbs.astro` from `packages/ui/src/Breadcrumbs.astro`.
- `apps/www/src/lib/breadcrumbs.ts` has a home breadcrumb helper, but it is app-local to `apps/www`; compare can either add its own small helper or inline the arrays.
- `ops/nginx/kpshelkovo-online.conf` currently serves compare under `/compare/` with special handling for static assets, data, markdown negotiation, `.md`, `index.html` and API catalog.
- `ops/nginx/sravni-shelkovo.conf` currently serves standalone compare HTML from `/var/www/sravni-shelkovo` and has old root-level page handling.
- Root `pnpm build` currently runs `build:main` and `build:legacy`; CI currently rsyncs both `dist/www/` and `dist/legacy/`.

## Intentional Scope Boundaries

- Do not create a `/815/` landing page in this migration.
- Do not add `Тариф 815` to breadcrumbs until a real `/815/` page exists.
- Do not copy compare implementation into `apps/www`.
- Do not redirect old machine-readable/API/asset URLs unless a new decision is documented.
- Do not keep `/compare/` as a permanent alias.

## External Validation Gaps

- nginx logs/Search Console access is needed to validate whether old machine URLs are requested in production before removing compatibility.
- Target-host `nginx -t` is needed for final nginx validation unless a local nginx environment is available.

## Task Log

### T0 - 2026-05-08 - planning docs created

Status: done.

Context:

- Created the task index, one file per task, and this handoff file from the migration idea.
- No implementation task has started yet.
- Future agents should take T1 first.

Verification:

- Reviewed source idea, workspace/app AGENTS docs, package scripts, compose scripts, compare/www Astro configs, current nginx configs and breadcrumb patterns.

Commit:

- `plan compare 815 section migration tasks`

### T1 - 2026-05-08 - audit URL surface

Status: done.

Context:

- Reviewed the current `/compare`, build, compose, discovery, deployment and nginx surfaces before changing the section base.

Audit:

| Surface                                   | Current state                                                                                                                                                                                                                                                                                                                    | Covered by         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Compare section base/canonical            | `apps/compare/package.json` sets `COMPARE_BASE=/compare` and `COMPARE_CANONICAL_BASE=/compare` for `dev` and `build:section`; `apps/compare/src/lib/site.ts` and `src/lib/url.ts` derive generated canonical/internal URLs from those values.                                                                                    | T2                 |
| Compare markdown/discovery URL generation | `apps/compare/src/lib/markdown.ts`, `src/lib/llms.ts`, `src/lib/discovery.ts` build URLs from canonical/base helpers; hardcoded `/compare` expectations are currently in `apps/compare/src/lib/markdown.test.ts`.                                                                                                                | T2                 |
| Compare route inventory                   | Current compare pages include public HTML `/`, `/rating/`, `/settlements/:slug/`; companions/machine surfaces include `/index.md`, `/rating/index.md`, `/settlements/:slug/index.md`, `/data/*.json`, `/schemas/*.json`, `/openapi/*.json`, `/llms*.txt`, `/.well-known/api-catalog` and `/.well-known/agent-skills/index.json`. | T2, T6, T8         |
| Compare settlement slugs                  | Current source for redirect slug generation is `apps/compare/src/data/settlements/*.yaml`, excluding `_template.yaml`; local audit found 37 current settlement files.                                                                                                                                                            | T6                 |
| Root compose output                       | `scripts/compose-www.mjs` copies `apps/compare/dist/section` into `dist/www/compare`.                                                                                                                                                                                                                                            | T3                 |
| Root dev and sitemap wiring               | `apps/www/astro.config.ts` proxies URLs matching `/compare` and compare-origin dev assets; root sitemap points to `https://kpshelkovo.online/compare/sitemap.xml`.                                                                                                                                                               | T3                 |
| Root visible links                        | `apps/www/src/pages/index.astro` links to `/compare/`.                                                                                                                                                                                                                                                                           | T4                 |
| Root agent discovery                      | `apps/www/src/lib/discovery.ts`, `apps/www/src/lib/llms.ts` and `apps/www/public/.well-known/agent-skills/site-sections/SKILL.md` describe compare under `/compare/` and its machine-readable surfaces.                                                                                                                          | T4                 |
| Compare breadcrumbs                       | `apps/compare/src/pages/rating.astro` and `apps/compare/src/pages/settlements/[slug]/index.astro` have JSON-LD breadcrumbs rooted at `Сравнение поселков`; compare index has no visible breadcrumb.                                                                                                                              | T5                 |
| New-domain nginx compare serving          | `ops/nginx/kpshelkovo-online.conf` has `/compare/` locations for static assets, data, public pages, markdown negotiation, `.md`, `index.html`, API catalog and fallback serving.                                                                                                                                                 | T6                 |
| Old-domain nginx serving                  | `ops/nginx/sravni-shelkovo.conf` serves standalone compare HTML from `/var/www/sravni-shelkovo` for `/`, `/rating/`, `/settlements/:slug/`, markdown, data/assets and fallback paths.                                                                                                                                            | T6                 |
| Legacy build artifact                     | Root `package.json`, `apps/compare/package.json`, `turbo.json` and `scripts/compose-legacy.mjs` still build/copy `dist/legacy`.                                                                                                                                                                                                  | T7                 |
| Legacy deploy path                        | `.github/workflows/ci.yml` still validates `DEPLOY_COMPARE_PATH` and rsyncs `dist/legacy/` to it, while deploying both nginx configs.                                                                                                                                                                                            | T7                 |
| Workspace docs                            | `AGENTS.md`, `README.md`, `apps/compare/AGENTS.md` and `apps/www/AGENTS.md` still document `/compare`, `dist/www/compare`, `dist/legacy` and old-domain standalone behavior as current.                                                                                                                                          | T2, T3, T4, T7, T8 |
| Migration docs and historical references  | `docs/ideas/*`, task files and this handoff intentionally contain old `/compare` references as source context and task tracking.                                                                                                                                                                                                 | T8                 |

Redirect scope confirmation:

| Host                | In redirect scope                                                                                     | Out of redirect scope                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `сравни.шелково.рф` | `/`, `/rating/`, `/settlements/:slug/` only.                                                          | `.md`, JSON/data, OpenAPI, schemas, `llms.txt`, agent skills, assets, sitemap and other fallback paths.                                                                        |
| `kpshelkovo.online` | Temporary old-path redirects for `/compare/`, `/compare/rating/`, `/compare/settlements/:slug/` only. | `/compare/*.md`, `/compare/data/*`, `/compare/openapi/*`, `/compare/schemas/*`, `/compare/llms*.txt`, `/compare/.well-known/*`, `/compare/static/*`, sitemap and other assets. |

Verification:

- Ran `rg "/compare|COMPARE_BASE|COMPARE_CANONICAL_BASE|dist/www/compare|dist/legacy|build:legacy|compose-legacy"` and reviewed the important results above.
- No build, typecheck or test was needed for T1 because it only updates task/handoff documentation.

External validation gaps:

- Local workspace does not include production nginx logs or Search Console access; validating real traffic for old machine-readable/API/asset URLs remains external/manual.
- Target-host `nginx -t` remains required during T6/T8 deployment validation unless a local equivalent nginx environment is added.

Commit:

- `audit compare 815 migration surface`

### T2 - 2026-05-08 - move compare base

Status: done.

Context:

- Switched compare app `dev`, `build:section` base/canonical and legacy canonical to `/815/compare` in `apps/compare/package.json`; legacy base remains `/` and standalone removal remains for T7.
- Updated compare-local markdown tests and `apps/compare/AGENTS.md` to the new section path.
- Root compose output, root dev proxy and root sitemap still point at `/compare` and remain in T3 scope.

Verification:

- `pnpm --dir=apps/compare exec vitest run src/lib/markdown.test.ts`: failed before implementation, then passed after switching the mock canonical base.
- `pnpm --dir=apps/compare test`: pass, 30 files / 238 tests.
- `pnpm --dir=apps/compare typecheck`: pass.
- `pnpm --dir=apps/compare build`: pass.
- Sample grep under `apps/compare/dist/section` confirmed `https://kpshelkovo.online/815/compare`, `/815/compare/static` and sitemap `<loc>` entries; `https://kpshelkovo.online/compare` was not found.

Commit:

- `move compare section base to 815 path`

## Intentional Leftovers

Add entries here when `rg` finds old strings that should remain.

| Pattern     | Location                       | Why it remains                                   | Removal condition                                                 |
| ----------- | ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| `/compare/` | docs/history or redirect tasks | Historical/source context or old-path redirects. | Remove only if it stops documenting history or redirect behavior. |

## Verification Notes

Add command results here when they affect later tasks.

| Date       | Task | Command                             | Result       | Notes                                                                       |
| ---------- | ---- | ----------------------------------- | ------------ | --------------------------------------------------------------------------- | ---------------- | ----------- | ------------ | ---------------- | ---- | ------------------------------------------------------------- |
| 2026-05-08 | T0   | Documentation review only           | not run      | Planning docs only; no build/test needed.                                   |
| 2026-05-08 | T1   | `rg "/compare                       | COMPARE_BASE | COMPARE_CANONICAL_BASE                                                      | dist/www/compare | dist/legacy | build:legacy | compose-legacy"` | pass | Reviewed repo-wide URL/build/deploy surfaces; docs-only task. |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare test`      | pass         | 30 files / 238 tests.                                                       |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare typecheck` | pass         | Astro sync and `tsc --noEmit` passed.                                       |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare build`     | pass         | Built `apps/compare/dist/section` with `/815/compare` canonical/base links. |
