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

| ID  | Status | Commit | Notes                                                                           |
| --- | ------ | ------ | ------------------------------------------------------------------------------- |
| T1  | todo   |        | `docs/tasks/compare-as-815-section-migration/T1-audit-url-surface.md`           |
| T2  | todo   |        | `docs/tasks/compare-as-815-section-migration/T2-move-compare-base.md`           |
| T3  | todo   |        | `docs/tasks/compare-as-815-section-migration/T3-compose-www-section.md`         |
| T4  | todo   |        | `docs/tasks/compare-as-815-section-migration/T4-update-root-links-discovery.md` |
| T5  | todo   |        | `docs/tasks/compare-as-815-section-migration/T5-add-compare-breadcrumbs.md`     |
| T6  | todo   |        | `docs/tasks/compare-as-815-section-migration/T6-nginx-redirects.md`             |
| T7  | todo   |        | `docs/tasks/compare-as-815-section-migration/T7-remove-legacy-build.md`         |
| T8  | todo   |        | `docs/tasks/compare-as-815-section-migration/T8-final-verification.md`          |

## Current Context Snapshot

Date: 2026-05-08.

- Source idea: `docs/ideas/compare-as-815-section-migration.md`.
- Root app is `apps/www`; compare app is `apps/compare`; compare must remain a separate section build.
- Current compare section build uses `COMPARE_BASE=/compare` and `COMPARE_CANONICAL_BASE=/compare` in `apps/compare/package.json`.
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

## Intentional Leftovers

Add entries here when `rg` finds old strings that should remain.

| Pattern     | Location                       | Why it remains                                   | Removal condition                                                 |
| ----------- | ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| `/compare/` | docs/history or redirect tasks | Historical/source context or old-path redirects. | Remove only if it stops documenting history or redirect behavior. |

## Verification Notes

Add command results here when they affect later tasks.

| Date       | Task | Command                   | Result  | Notes                                     |
| ---------- | ---- | ------------------------- | ------- | ----------------------------------------- |
| 2026-05-08 | T0   | Documentation review only | not run | Planning docs only; no build/test needed. |
