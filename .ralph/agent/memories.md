# Memories

## Patterns

### mem-1779350926-2ac9

> pattern: sitemap source contracts are internal build-time inputs for raw-to-domain migration; section-specific fields should use camelCase domain names, with raw snake_case only at frontmatter parsing or explicit public DTO boundaries

<!-- tags: sitemap, raw-domain-data, status, news | created: 2026-05-21 -->

## Decisions

## Fixes

### mem-1779358539-787b

> failure: cmd=node --input-type=module -e <broad schema consumer adversarial harness>, exit=1, error=regex spanned across unrelated imports and flagged legal schema constant imports as domain type imports, next=make adversarial import checks line-scoped or parse imports before treating as boundary violations

<!-- tags: tooling, raw-domain-data, architecture | created: 2026-05-21 -->

### mem-1779358539-50f4

> failure: cmd=node --input-type=module -e <adversarial boundary harness with template literals>, exit=1, error=zsh interpreted template literals and stripped Node expressions, next=rerun inline Node harness using single-quoted command and string concatenation

<!-- tags: tooling, raw-domain-data, architecture | created: 2026-05-21 -->

### mem-1779358110-fdcb

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=remaining consumers imported NewsListArticle/StatusIncident from schema compatibility exports, next=migrate NewsCard.test.ts and status feed to import domain types from types.ts

<!-- tags: raw-domain-data, typecheck, architecture | created: 2026-05-21 -->

### mem-1779357882-2a97

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/raw-domain-boundary.architecture.test.ts, exit=1, error=expected RED guard caught news/status/people schema.ts importing/re-exporting ./types, next=remove schema compatibility type re-exports and migrate consumers to import domain types from types.ts

<!-- tags: raw-domain-data, architecture, testing | created: 2026-05-21 -->

### mem-1779357759-d162

> failure: cmd=node --input-type=module -e <schema/domain boundary adversarial check>, exit=1, error=news/status/people schema.ts import and re-export domain types from ./types, next=remove compatibility type re-exports and migrate consumers to import domain types from types.ts directly; add guard so schema.ts cannot import ./types

<!-- tags: raw-domain-data, architecture | created: 2026-05-21 -->

### mem-1779357523-74e2

> failure: cmd=pnpm exec prettier --check apps/www/src/lib/raw-domain-boundary.architecture.test.ts apps/www/src/lib/status/types.ts apps/www/src/lib/status/load.ts apps/www/src/lib/status/view.ts apps/www/src/lib/status/public-dto.ts apps/www/src/lib/status/load.test.ts apps/www/src/lib/sitemap.ts apps/www/src/lib/sitemap-data.ts apps/www/src/lib/sitemap.test.ts docs/migrations/raw-to-domain-data/progress.md .ralph/agent/scratchpad.md, exit=1, error=Prettier reported style issues in status/load.ts status/public-dto.ts status/load.test.ts, next=run prettier --write on touched Step 13 rejection-fix files and re-check

<!-- tags: formatting, raw-domain-data, status | created: 2026-05-21 -->

### mem-1779357523-5c3e

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/raw-domain-boundary.architecture.test.ts, exit=1, error=expected RED after removing broad raw-token allowlist found internal status active_incident/no_incidents plus other legacy raw-like tokens, next=convert status domain modes to camelCase and keep any unavoidable exceptions file-scoped with justification

<!-- tags: testing, raw-domain-data, status | created: 2026-05-21 -->

### mem-1779357159-6885

> failure: tool=Read docs/decisions/013-raw-to-domain-data-boundary.md and docs/decisions/011-public-markdown-and-llms.md, error=file not found because ADR filenames are 013-raw-domain-public-data-boundary.md and 011-public-surface-registry.md, next=use docs/decisions README or glob when ADR path is uncertain

<!-- tags: tooling, raw-domain-data | created: 2026-05-21 -->

### mem-1779356520-bf7d

> failure: cmd=Read docs/migrations/raw-to-domain-data/tasks/13-final-guards-and-docs.md, error=file not found because Step 13 artifact is named tasks/13-final-guardrails.md, next=use plan.md/CONTEXT.md artifact path as source of truth

<!-- tags: tooling, raw-domain-data | created: 2026-05-21 -->

### mem-1779356348-7796

> failure: cmd=node --input-type=module -e <Step 12 built public DTO harness>, exit=1, error=expected people profile_count at top-level/profile but built people JSON stores counts under stats, next=adjust harness to assert people.stats.profile_count and rerun

<!-- tags: tooling, people, raw-domain-data, public-dto | created: 2026-05-21 -->

### mem-1779355860-e99a

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/root-discovery-routes.test.ts, exit=1, error=expected RED guard found docs/migrations/raw-to-domain-data/inventory.md missing Intentional legacy public fields section, next=add inventory section listing intentional legacy public DTO fields and rerun focused test

<!-- tags: testing, raw-domain-data, public-dto | created: 2026-05-21 -->

### mem-1779355704-e0c5

> failure: cmd=ralph emit tasks.ready --payload '{...}', exit=2, error=unexpected argument '--payload'; usage is ralph emit <TOPIC> [PAYLOAD], next=emit with JSON payload as positional argument

<!-- tags: ralph-tools, tooling | created: 2026-05-21 -->

### mem-1779355535-b39c

> failure: cmd=node --input-type=module -e <built people public contract harness>, exit=1, error=expected profile markdown backlinks section but built people Markdown uses heading '## Где упоминается', next=assert stable heading/contact/backlink content or JSON backlink data instead and rerun harness

<!-- tags: tooling, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779355353-67e9

> failure: cmd=node --input-type=module -e <built people JSON contract harness>, exit=1, error=expected kschemelinin to have a news backlink with html_url/markdown_url/source_id but built data may legitimately place populated backlinks on another profile/section, next=inspect actual built backlink distribution and rerun harness against any populated backlink

<!-- tags: tooling, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779355074-689d

> failure: cmd=pnpm exec prettier --check apps/www/src/lib/people/backlinks.ts apps/www/src/lib/people/backlinks.test.ts apps/www/src/lib/people/load.ts apps/www/src/lib/people/load.test.ts apps/www/src/lib/people/public-dto.ts apps/www/src/lib/people/public-dto.test.ts docs/migrations/raw-to-domain-data/progress.md .ralph/agent/scratchpad.md, exit=1, error=Prettier reported style issues in apps/www/src/lib/people/backlinks.test.ts, next=run prettier --write on changed Step 11 rejection-fix files and re-check

<!-- tags: formatting, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779355020-3d8a

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts, exit=1, error=expected RED guard caught apps/www/src/lib/people/load.ts importing createPeopleBacklinksFromGraph from ./public-dto, next=move graph-to-domain backlinks adapter into internal people/backlinks.ts and rerun focused people tests

<!-- tags: testing, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779354567-c2db

> failure: cmd=pnpm exec prettier --check apps/www/src/lib/people/public-dto.ts apps/www/src/lib/people/public-dto.test.ts apps/www/src/lib/people/discovery.ts apps/www/src/lib/people/load.ts apps/www/src/lib/people/llms.test.ts docs/migrations/raw-to-domain-data/progress.md .ralph/agent/scratchpad.md, exit=1, error=Prettier reported style issues in public-dto.test.ts, next=run prettier --write on changed Step 11 files and re-check

<!-- tags: formatting, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779354472-7eaf

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=src/lib/people/discovery.ts kept unused absoluteUrl import after moving people payload adapter to public-dto.ts, next=remove stale import and rerun typecheck

<!-- tags: typecheck, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779354355-d9e6

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/public-dto.test.ts src/lib/people/discovery.test.ts src/lib/people/load.test.ts, exit=1, error=public-dto.test imported adapter before setting import.meta.env SITE so absoluteUrl used default kpshelkovo.online, next=dynamic-import public-dto after env setup and rerun focused tests

<!-- tags: testing, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779354251-817c

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/public-dto.test.ts, exit=1, error=expected RED missing ./public-dto module for Step 11 people public DTO adapter, next=add public-dto.ts and rerun focused people tests

<!-- tags: testing, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779353841-41bd

> failure: cmd=node --input-type=module -e <built people JSON/HTML/Markdown harness>, exit=1, error=Markdown assertion expected ## Профиль but profiles without body legitimately render contacts/backlinks only, next=check profile heading and contacts/backlinks instead

<!-- tags: tooling, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779353574-7720

> failure: cmd=git diff -- apps/www/src/pages/people/[slug]/index.astro ..., exit=1, error=zsh expanded [slug] as a glob and found no matches, next=quote bracketed Astro route paths in git diff commands

<!-- tags: tooling, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779353521-7b16

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=PeopleDataset type was imported from registry after moving it to people/types.ts but registry no longer re-exported it, causing implicit any in people/root llms reducers, next=re-export PeopleDataset from registry and rerun typecheck

<!-- tags: typecheck, people, raw-domain-data | created: 2026-05-21 -->

### mem-1779352470-e98f

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/schema.test.ts, exit=1, error=expected RED guard caught StatusIncidentMeta.astro using source_url/applies_to_all_areas, next=migrate StatusIncidentMeta to sourceUrl/appliesToAllAreas and rerun tests

<!-- tags: testing, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779352086-d01e

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=discovery.ts kept unused statusIncidentMarkdownUrl/statusServiceMarkdownUrl imports after moving status public DTO adapter, next=remove stale imports and rerun typecheck

<!-- tags: typecheck, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779351785-4979

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/schema.test.ts src/components/status/StatusServiceTimeline.test.ts, exit=1, error=expected RED for Step 9 caught timeline tooltip browser DTO using is_active/started_iso/started_has_time/ended_iso/ended_has_time/total_minutes, next=migrate timeline tooltip DTO serialization/parsing to camelCase and rerun tests

<!-- tags: testing, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779351070-06ea

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/schema.test.ts, exit=1, error=expected RED guard caught sitemap status contracts using status_incidents/started_iso/ended_iso/has_page, next=migrate status sitemap source contract to camelCase and rerun tests

<!-- tags: testing, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779350256-a4d8

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/load.test.ts src/lib/status/schema.test.ts, exit=1, error=status migration broke related tests because people fixtures still passed mention_registry and status discovery/pages still read raw field names, next=migrate remaining status call sites and tests to camelCase

<!-- tags: testing, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779350034-f05b

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/load.test.ts src/lib/status/schema.test.ts, exit=1, error=expected RED for Step 8: missing status mapper/raw-schema and dataset still exposes by_id/started_iso raw domain fields, next=add status raw-schema/types/mapper and migrate loader/tests to camelCase

<!-- tags: testing, status, raw-domain-data | created: 2026-05-21 -->

### mem-1779349783-7a36

> failure: cmd=node --input-type=module -e <inline built news JSON harness>, exit=1, error=SyntaxError: missing ) after argument list from over-escaped quote needles in shell string, next=use JSON.stringify(key)+':' key probes in inline Node harness and rerun

<!-- tags: tooling, news, raw-domain-data | created: 2026-05-21 -->

### mem-1779349425-aebf

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/index.architecture.test.ts, exit=1, error=expected RED guard caught sitemap news contracts using published_iso/updated_iso/news_articles, next=migrate sitemap news source contract to camelCase and rerun tests

<!-- tags: testing, news, raw-domain-data | created: 2026-05-21 -->

### mem-1779348903-dc95

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=src/lib/news/discovery.ts unused absoluteUrl import after moving news public DTO adapters, next=remove stale import and rerun typecheck

<!-- tags: testing, news, raw-domain-data | created: 2026-05-21 -->

### mem-1779347498-1505

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/index.architecture.test.ts, exit=1, error=expected RED guard caught NewsMeta.astro raw author short_name contract, next=switch NewsMeta author prop to domain shortName and rerun tests

<!-- tags: testing, news, raw-domain-data | created: 2026-05-21 -->

### mem-1779347221-b0e5

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/mapper.test.ts src/lib/news/index.architecture.test.ts, exit=1, error=expected RED for Step 6: missing news mapper/types/raw-schema and inline content.config/schema contracts, next=add raw-schema.ts/types.ts/mapper.ts and rerun focused tests

<!-- tags: testing, news, raw-domain-data | created: 2026-05-21 -->

### mem-1779346192-2a75

> failure: cmd=pnpm exec prettier --check changed Step 5 rejection-fix files, exit=1, error=index.architecture.test.ts formatting differed, next=run prettier --write on changed files and re-check

<!-- tags: formatting, compare, raw-domain-data | created: 2026-05-21 -->

### mem-1779346164-e65b

> failure: cmd=mkdir logs, exit=1, error=logs already existed despite glob not matching bare directory, next=use Read or ls for known repo-local logs directory before mkdir

<!-- tags: tooling, raw-domain-data | created: 2026-05-21 -->

### mem-1779346123-359e

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/index.architecture.test.ts, exit=1, error=expected RED guard caught public compare JSON exposing domain ComparisonResult/Stats and routes assembling payload inline, next=add explicit public DTO whole-payload adapters and route through them

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-21 -->

### mem-1779345567-0545

> failure: cmd=git diff -- apps/www/src/compare/lib/explorer.ts apps/www/src/compare/components apps/www/src/pages/815/compare/index.astro apps/www/src/pages/815/compare/settlements/[slug]/index.astro apps/www/src/compare/lib/llms.ts apps/www/src/compare/lib/index.architecture.test.ts, exit=1, error=zsh expanded [slug] as glob and found no matches, next=quote bracketed Astro route path when inspecting diff

<!-- tags: tooling, compare | created: 2026-05-21 -->

### mem-1779345252-5f59

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/index.architecture.test.ts, exit=1, error=RED guard confirmed compare routes/Svelte still read raw snake_case settlement fields, next=migrate UI/component DTO access to camelCase and rerun

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-21 -->

### mem-1779310019-71eb

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=domain loader exposed remaining raw compare lib/page type uses in format tests, llms and settlement markdown route, next=broaden transitional public-format adapters or migrate remaining call sites to domain fields

<!-- tags: typecheck, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779309985-69cb

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib, exit=1, error=markdown mock settlements lacked raw tariff unit/value/period before mapper conversion, next=complete raw fixture tariff fields and rerun compare lib tests

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779309736-c1cf

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/data.test.ts, exit=1, error=after migrating core helpers, broad vitest run exposed stale raw-shaped compare tests/components still passing snake_case fixtures into domain helpers, next=migrate test fixtures and necessary compare UI call sites or adapter boundaries to domain-compatible objects

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779309397-c172

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/data.test.ts, exit=1, error=RED confirmed loadSettlements returned raw snake_case collection data instead of domain Settlement, next=map entries with mapRawSettlement and migrate core imports/field access

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779309237-d592

> failure: cmd=pnpm exec prettier --check docs/migrations/raw-to-domain-data/progress.md .ralph/agent/scratchpad.md, exit=1, error=Prettier reported style issues in .ralph/agent/scratchpad.md after planner append, next=run prettier --write on progress.md and scratchpad.md then re-check

<!-- tags: formatting, raw-domain-data | created: 2026-05-20 -->

### mem-1779308867-a369

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/settlement/mapper.test.ts, exit=1, error=RED phase confirmed unsupported raw tariff unit did not throw and fell through to fixed, next=add explicit rub_fixed mapping plus unsupported-unit error

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779308577-2db8

> failure: cmd=pnpm exec prettier --check changed Step 03 files, exit=1, error=Prettier reported style issues in mapper.ts/schema.ts/schema.test.ts, next=run prettier --write on changed files and re-check

<!-- tags: formatting, compare, raw-domain-data | created: 2026-05-20 -->

### mem-1779308380-adbe

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/settlement/mapper.test.ts, exit=1, error=Cannot find module './mapper' during intentional RED phase for new compare mapper test, next=implement settlement mapper/schema/types

<!-- tags: testing, compare, raw-domain-data | created: 2026-05-20 -->

## Context
