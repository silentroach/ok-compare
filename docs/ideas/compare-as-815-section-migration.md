# Compare as 815 Section Migration

## Problem Statement

How might we move the compare experience under `/815/compare/` so residents, search engines, and old links land on the right content without keeping two separately deployed compare sites?

## Recommended Direction

Move `apps/compare` from the current section path `/compare` to `/815/compare` while keeping it as a separate section build. Do not copy compare pages into `apps/www`; instead change the section base/canonical, compose it into `dist/www/815/compare`, and update root-site references that currently point at `/compare/`.

Make the old Russian domain redirect-only. It should no longer serve standalone HTML. For public page URLs only, generate static nginx redirect rules from compare routes and settlement slugs once, paste them into the nginx configs as hardcoded rules, and delete the generator. The old URL list is known and should not expand: `/`, `/rating/`, `/settlements/:slug/` on the old domain, plus `/compare/`, `/compare/rating/`, `/compare/settlements/:slug/` on the new domain. Keep the new-domain old-path redirects for 3 months with an explicit removal TODO.

Add visible and schema breadcrumbs using the simple hierarchy that exists today: `Главная > Сравнение тарифов` for compare index/rating pages and `Главная > Сравнение тарифов > [Название поселка]` for settlement pages. Do not add a `Тариф 815` breadcrumb until there is a real `/815/` page.

## Key Assumptions to Validate

- [ ] Old public URL scope is only pages, not `.md`, JSON, OpenAPI, schemas, `llms.txt`, or assets. Validate against nginx logs/search console before removing compatibility for machine URLs.
- [ ] `COMPARE_BASE=/815/compare` does not break assets, links, sitemap, Svelte hydration, or canonical URL generation. Validate with `pnpm build`, sampled built files, and curl/browser checks.
- [ ] A redirect-only old domain is acceptable with no standalone rollback artifact. Rollback is intentionally out of scope.
- [ ] Breadcrumb text `Главная > Сравнение тарифов > [Название поселка]` matches the current information architecture. Validate visually on home, rating, and settlement pages.
- [ ] Hardcoded nginx redirects can be deployed predictably. Validate generated-then-pasted rules with config review and `nginx -t` on the target host.

## MVP Scope

In scope:

- Change compare section base/canonical from `/compare` to `/815/compare`.
- Compose compare into `dist/www/815/compare`.
- Update sitemap, root discovery/llms references, home dropdown link, and any hardcoded `/compare/` links.
- Add compare breadcrumbs using the existing shared `Breadcrumbs` pattern and update JSON-LD breadcrumbs.
- Replace old-domain serving behavior with permanent redirects to new direct page URLs.
- Add temporary 3-month permanent redirects from `kpshelkovo.online/compare/...` page URLs to `kpshelkovo.online/815/compare/...`.
- Generate static nginx page redirect rules from compare settlement data once, paste them into configs, and remove the generator.
- Remove standalone legacy build/deploy path; rollback is not required.

## Implementation Tracking

- Task index and per-task files: `docs/tasks/compare-as-815-section-migration.md`
- Agent handoff context: `docs/tasks/compare-as-815-section-handoff.md`

## Not Doing (and Why)

- Keeping `/compare` as an alias forever - it preserves ambiguity and weakens the canonical migration.
- Redirecting old machine-readable/API/asset URLs - current scope is public pages only; preserving every surface would make the migration bigger and harder to delete.
- Creating a new `/815/` landing page or adding `Тариф 815` to breadcrumbs - useful later, but it is product scope, not migration scope.
- Copying compare code into `apps/www` - violates the existing section-build boundary.
- Redesigning compare pages - breadcrumbs are enough to express hierarchy for this migration.

## Open Questions

- No unresolved questions before implementation.
