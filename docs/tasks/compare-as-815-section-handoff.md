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

| ID  | Status | Commit                                    | Notes                                                                           |
| --- | ------ | ----------------------------------------- | ------------------------------------------------------------------------------- |
| T1  | done   | `audit compare 815 migration surface`     | `docs/tasks/compare-as-815-section-migration/T1-audit-url-surface.md`           |
| T2  | done   | `move compare section base to 815 path`   | `docs/tasks/compare-as-815-section-migration/T2-move-compare-base.md`           |
| T3  | done   | `compose compare into 815 section`        | `docs/tasks/compare-as-815-section-migration/T3-compose-www-section.md`         |
| T4  | done   | `update root compare references`          | `docs/tasks/compare-as-815-section-migration/T4-update-root-links-discovery.md` |
| T5  | done   | `add compare breadcrumbs`                 | `docs/tasks/compare-as-815-section-migration/T5-add-compare-breadcrumbs.md`     |
| T6  | done   | `replace compare nginx redirects`         | `docs/tasks/compare-as-815-section-migration/T6-nginx-redirects.md`             |
| T7  | done   | `remove legacy compare build`             | `docs/tasks/compare-as-815-section-migration/T7-remove-legacy-build.md`         |
| T8  | done   | `finalize compare migration verification` | `docs/tasks/compare-as-815-section-migration/T8-final-verification.md`          |

## Current Context Snapshot

Date: 2026-05-09.

- Source idea: `docs/ideas/compare-as-815-section-migration.md`.
- Root app is `apps/www`; compare app is `apps/compare`; compare must remain a separate section build.
- Current compare section build and compare dev server use `COMPARE_BASE=/815/compare` and `COMPARE_CANONICAL_BASE=/815/compare` in `apps/compare/package.json`.
- `scripts/compose-www.mjs` copies `apps/compare/dist/section` to `dist/www/815/compare`.
- Root `apps/www/astro.config.ts` proxies dev requests whose URL starts with `/815/compare` and points `customSitemaps` at `https://kpshelkovo.online/815/compare/sitemap.xml`.
- Root-site visible links and agent-facing discovery references now use `/815/compare/` in `apps/www/src/lib/discovery.ts`, `apps/www/src/lib/llms.ts`, `apps/www/src/pages/index.astro`, `apps/www/public/.well-known/agent-skills/site-sections/SKILL.md`, `apps/www/AGENTS.md` and root `AGENTS.md`.
- Compare visible and JSON-LD breadcrumbs now use `Главная > Сравнение тарифов`; settlement pages add the settlement name as the third item.
- Shared visible breadcrumbs component is exported as `@shelkovo/ui/Breadcrumbs.astro` from `packages/ui/src/Breadcrumbs.astro`.
- `apps/www/src/lib/breadcrumbs.ts` has a home breadcrumb helper, but it is app-local to `apps/www`; compare can either add its own small helper or inline the arrays.
- `ops/nginx/kpshelkovo-online.conf` serves compare under `/815/compare/` and keeps temporary `/compare/` public page redirects until `2026-08-08`.
- `ops/nginx/sravni-shelkovo.conf` is redirect-only except ACME: public pages redirect to `/815/compare/...`; unmatched URLs redirect to `https://kpshelkovo.online/` by T6 decision.
- Root `pnpm build` now runs only `build:main`; CI rsyncs only `dist/www/` and still deploys both nginx configs.

## Intentional Scope Boundaries

- Do not create a `/815/` landing page in this migration.
- Do not add `Тариф 815` to breadcrumbs until a real `/815/` page exists.
- Do not copy compare implementation into `apps/www`.
- Do not redirect old machine-readable/API/asset URLs unless a new decision is documented. T6 documents the old-domain unmatched URL redirect to the new root.
- Do not keep `/compare/` as a permanent alias.

## External Validation Gaps

- nginx logs/Search Console access is needed to validate whether old machine URLs are requested in production before removing compatibility.
- Target-host `nginx -t` is needed for final nginx validation unless a local nginx environment is available.

## Final Deployment Notes

- Deploy current output from `dist/www/`; compare is included at `dist/www/815/compare` and no `dist/legacy` artifact is required.
- Stage both nginx configs, run `nginx -t` on the target host, and reload nginx only after the config test passes.
- Keep temporary new-domain `/compare/`, `/compare/rating/`, and `/compare/settlements/:slug/` redirects until `2026-08-08`; before removal, review production logs/Search Console for old URL traffic.
- The old domain remains redirect-only except ACME handling: public pages go to `/815/compare/...`, unmatched URLs go to `https://kpshelkovo.online/` by the T6 decision.

## Task Log

### T8 - 2026-05-09 - final verification

Status: done.

Context:

- Running the final repo-wide verification and documentation cleanup for the `/815/compare` migration.
- Recent git history shows one commit per completed migration task: T1 through T7 are already committed separately; T8 is recorded as `finalize compare migration verification`.

Verification:

- `pnpm build`: pass; root build runs `build:main`, then composes compare into `dist/www/815/compare`.
- `test -d "dist/www/815/compare" && test -f "dist/www/815/compare/index.html" && test ! -e "dist/legacy" && test ! -e "apps/compare/dist/legacy"`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 31 compare files / 241 tests and 38 www files / 228 tests.
- `rg "/compare|815/compare|dist/legacy|build:legacy|DEPLOY_COMPARE_PATH"` with generated/cache exclusions: reviewed; remaining old `/compare` references are temporary redirects, migration history, tests, or documented exceptions.
- Built output grep confirmed `https://kpshelkovo.online/815/compare` URLs and root sitemap `https://kpshelkovo.online/815/compare/sitemap.xml`; no `https://kpshelkovo.online/compare` canonical/href/src references were found in `dist/www/815/compare`.

External/manual gaps:

- Production nginx logs/Search Console access is still needed before removing old URL compatibility.
- Target-host `nginx -t` is still required before nginx reload/deploy.

Commit:

- `finalize compare migration verification`

### T7 - 2026-05-09 - remove legacy build

Status: done.

Context:

- Removing standalone legacy build and deploy wiring now that the old domain is redirect-only.
- Root `package.json`, `apps/compare/package.json` and `turbo.json` no longer expose `build:legacy`.
- `scripts/compose-legacy.mjs` was deleted.
- `.github/workflows/ci.yml` no longer reads `DEPLOY_COMPARE_PATH` and no longer rsyncs `dist/legacy/`; nginx deploy still uploads/applies both configs.
- Workspace docs now describe only `dist/www` and `dist/www/815/compare` as current build outputs.

Verification:

- `pnpm build`: pass; command ran `build:main` only.
- `test ! -e "dist/legacy" && test ! -e "apps/compare/dist/legacy"`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 31 compare files / 241 tests and 38 www files / 228 tests.
- `rg "build:legacy|compose-legacy|dist/legacy|DEPLOY_COMPARE_PATH"` with generated/cache exclusions: reviewed; remaining hits are migration task docs, T1 audit history and T8 verification checklist.
- `git diff --check`: pass.

Commit:

- `remove legacy compare build`

### T6 - 2026-05-08 - nginx redirects

Status: done.

Context:

- Replacing old compare public page serving with hardcoded redirects to `/815/compare/...`.
- `ops/nginx/kpshelkovo-online.conf` now serves compare under `/815/compare` for static assets, data, public pages, markdown negotiation, `.md`, `index.html`, API catalog and fallback paths.
- New-domain `/compare/`, `/compare/rating/` and `/compare/settlements/:slug/` redirects are temporary and carry TODO removal date `2026-08-08`.
- `ops/nginx/sravni-shelkovo.conf` no longer serves standalone compare HTML. ACME handling remains; old public pages redirect to `/815/compare/...`.
- T6 user decision: unmatched old-domain URLs redirect to `https://kpshelkovo.online/` instead of returning 404.
- Settlement redirect source: `apps/compare/src/data/settlements/*.yaml`, excluding `_template.yaml`; generated slug count is 37.

Verification:

- `node -e ...`: pass; confirmed 37 settlement slugs, no missing new-domain redirects, no missing old-domain redirects, and no generic old-path settlement redirect regex.
- `rg "return 301|/compare|/815/compare" ops/nginx`: reviewed for rule order and shadowing.
- Specific `rg` checks found no old `/compare` serving rules left in `ops/nginx/kpshelkovo-online.conf`; only exact temporary redirects remain.
- `git diff --check`: pass.
- `nginx -v`: failed locally with `command not found`; target host must run `nginx -t` before reload/deploy.

Commit:

- `replace compare nginx redirects`

### T5 - 2026-05-08 - compare breadcrumbs

Status: done.

Context:

- Added `apps/compare/src/lib/breadcrumbs.ts` as the compare-local source for visible breadcrumbs and `BreadcrumbList` schema.
- Compare index and rating pages render `Главная > Сравнение тарифов`; rating intentionally does not add `Методика рейтинга` or `Тариф 815`.
- Settlement pages render `Главная > Сравнение тарифов > [Название поселка]` and add only the settlement item to JSON-LD after the compare item.
- Existing `К списку поселков` and `Назад к списку` links remain and point back to the compare index, so they do not contradict the breadcrumbs.

Verification:

- `pnpm --dir apps/compare test`: pass, 31 files / 241 tests.
- `pnpm --dir apps/compare typecheck`: pass.
- `pnpm --dir apps/compare build`: pass.
- Built HTML samples checked: `apps/compare/dist/section/index.html`, `apps/compare/dist/section/rating/index.html`, `apps/compare/dist/section/settlements/shelkovo/index.html` contain breadcrumb nav and expected JSON-LD names/URLs.

Commit:

- `add compare breadcrumbs`

### T4 - 2026-05-08 - update root links and discovery

Status: done.

Context:

- Updating root-site visible compare links and root agent-facing discovery references from `/compare/` to `/815/compare/`.
- Home tariff dropdown now links to `/815/compare/`.
- Root API catalog, `llms.txt`, `llms-full.txt`, root markdown companion and `site-sections` skill now use `/815/compare/...` for compare HTML, markdown, feed, `llms.txt`, API catalog and skill index URLs.
- Updated the root news markdown typography test fixture to use the current compare path instead of leaving a stale `/compare/` sample.
- Review found no old-path `/compare/` URLs left in `apps/www` or `packages`; remaining `/compare/` hits in `docs` are migration history, redirect scope, or future nginx/legacy tasks.

Verification:

- `pnpm --dir apps/www test`: pass, 38 files / 228 tests.
- `pnpm --dir apps/www typecheck`: pass.
- `rg "/compare" apps/www packages docs AGENTS.md`: reviewed; old-path leftovers are limited to migration/history/redirect docs or non-URL path text like `apps/compare`.

Commit:

- `update root compare references`

### T3 - 2026-05-08 - compose www section

Status: done.

Context:

- Updating root compose output, root dev proxy and root sitemap from `/compare` to `/815/compare`.
- `scripts/compose-www.mjs` now creates `dist/www/815` and copies the compare section to `dist/www/815/compare`.
- Root www dev proxy now forwards `/815/compare` requests and compare-origin dev assets whose referer contains `/815/compare`.
- Root docs were updated for the new current section path; root-site visible links and discovery references remain in T4 scope.
- `ops/nginx/kpshelkovo-online.conf` still serves `/compare` and remains in T6 scope.

Verification:

- `pnpm build:main`: pass.
- `test -f dist/www/815/compare/index.html`: pass.
- `dist/www/sitemap-index.xml` contains `https://kpshelkovo.online/815/compare/sitemap.xml`.

Commit:

- `compose compare into 815 section`

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

| Pattern                                                                | Location                                 | Why it remains                                         | Removal condition                                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `/compare/`                                                            | docs/history or redirect tasks           | Historical/source context or old-path redirects.       | Remove only if it stops documenting history or redirect behavior.                      |
| `/compare/`                                                            | `ops/nginx/kpshelkovo-online.conf`       | Temporary new-domain public page redirects.            | Remove after `2026-08-08` if migration traffic is clean.                               |
| `build:legacy`, `compose-legacy`, `dist/legacy`, `DEPLOY_COMPARE_PATH` | migration task docs and T1/T7/T8 history | Historical task context and final verification record. | Keep while migration history is useful; do not treat as current build/deploy behavior. |

## Verification Notes

Add command results here when they affect later tasks.

| Date       | Task | Command                                   | Result  | Notes                                                                       |
| ---------- | ---- | ----------------------------------------- | ------- | --------------------------------------------------------------------------- |
| 2026-05-08 | T0   | Documentation review only                 | not run | Planning docs only; no build/test needed.                                   |
| 2026-05-08 | T1   | `rg "/compare\|COMPARE_BASE\|..."`        | pass    | Reviewed repo-wide URL/build/deploy surfaces; docs-only task.               |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare test`            | pass    | 30 files / 238 tests.                                                       |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare typecheck`       | pass    | Astro sync and `tsc --noEmit` passed.                                       |
| 2026-05-08 | T2   | `pnpm --dir=apps/compare build`           | pass    | Built `apps/compare/dist/section` with `/815/compare` canonical/base links. |
| 2026-05-08 | T3   | `pnpm build:main`                         | pass    | Built root site, compare section and composed into `dist/www/815/compare`.  |
| 2026-05-08 | T3   | `test -f dist/www/815/compare/index.html` | pass    | Confirmed composed compare index exists.                                    |
| 2026-05-08 | T4   | `pnpm --dir apps/www test`                | pass    | 38 files / 228 tests.                                                       |
| 2026-05-08 | T4   | `pnpm --dir apps/www typecheck`           | pass    | Astro sync and `tsc --noEmit` passed.                                       |
| 2026-05-08 | T5   | `pnpm --dir apps/compare test`            | pass    | 31 files / 241 tests.                                                       |
| 2026-05-08 | T5   | `pnpm --dir apps/compare typecheck`       | pass    | Astro sync and `tsc --noEmit` passed.                                       |
| 2026-05-08 | T5   | `pnpm --dir apps/compare build`           | pass    | Built `apps/compare/dist/section` with compare breadcrumbs.                 |
| 2026-05-08 | T5   | Built HTML breadcrumb sample check        | pass    | Checked index, rating and `settlements/shelkovo` HTML plus JSON-LD.         |
| 2026-05-08 | T6   | `rg "return 301\|/compare\|/815/compare"` | pass    | Reviewed redirect order and `/815/compare` serving rules.                   |
| 2026-05-08 | T6   | Settlement redirect coverage script       | pass    | 37 slugs from settlement YAML files; no missing hardcoded redirects.        |
| 2026-05-08 | T6   | `git diff --check`                        | pass    | No whitespace errors.                                                       |
| 2026-05-08 | T6   | `nginx -v`                                | failed  | Local nginx is unavailable; run `nginx -t` on the target host.              |
| 2026-05-09 | T7   | `pnpm build`                              | pass    | Built root site and compare section through `build:main` only.              |
| 2026-05-09 | T7   | Legacy artifact existence check           | pass    | `dist/legacy` and `apps/compare/dist/legacy` were absent after build.       |
| 2026-05-09 | T7   | `pnpm typecheck`                          | pass    | Workspace typecheck passed.                                                 |
| 2026-05-09 | T7   | `pnpm test`                               | pass    | 31 compare files / 241 tests; 38 www files / 228 tests.                     |
| 2026-05-09 | T7   | Legacy reference rg review                | pass    | Remaining hits are migration docs/history and T8 checklist only.            |
| 2026-05-09 | T7   | `git diff --check`                        | pass    | No whitespace errors.                                                       |
| 2026-05-09 | T8   | `pnpm build`                              | pass    | Built root site and compare section through `build:main` only.              |
| 2026-05-09 | T8   | Final artifact existence check            | pass    | `dist/www/815/compare/index.html` exists; legacy outputs are absent.        |
| 2026-05-09 | T8   | `pnpm typecheck`                          | pass    | Workspace typecheck passed.                                                 |
| 2026-05-09 | T8   | `pnpm test`                               | pass    | 31 compare files / 241 tests; 38 www files / 228 tests.                     |
| 2026-05-09 | T8   | Final migration reference rg review       | pass    | Remaining old-path references are redirects, tests, history or exceptions.  |
