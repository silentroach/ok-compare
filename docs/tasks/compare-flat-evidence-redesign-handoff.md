# Compare Flat Evidence Redesign Handoff

This file is the shared context log for agents working through `docs/tasks/compare-flat-evidence-redesign.md` and task files in `docs/tasks/compare-flat-evidence-redesign/`.

Use it to pass forward facts that are not obvious from the current task diff: command results, UI decisions, discovered gotchas, intentional leftovers and validation gaps.

## Update Protocol

1. Before starting a task, add a short note under `Task Log` with task ID, date and status `in_progress`.
2. During the task, append only context that another agent would need. Avoid narrating routine edits.
3. Before committing, update task status, verification results, intentional leftovers and commit hash/message if known.
4. Keep `Task Registry` in sync with `docs/tasks/compare-flat-evidence-redesign.md`.
5. Do not use this file as a substitute for code comments or tests.

## Task Registry

| ID  | Status | Commit | Notes                                                                        |
| --- | ------ | ------ | ---------------------------------------------------------------------------- |
| T1  | done   |        | `docs/tasks/compare-flat-evidence-redesign/T1-flatten-surface-primitives.md` |
| T2  | done   |        | `docs/tasks/compare-flat-evidence-redesign/T2-redesign-hero-kpi.md`          |
| T3  | done   |        | `docs/tasks/compare-flat-evidence-redesign/T3-flatten-explorer-map.md`       |
| T4  | done   |        | `docs/tasks/compare-flat-evidence-redesign/T4-flatten-settlement-cards.md`   |
| T5  | done   |        | `docs/tasks/compare-flat-evidence-redesign/T5-integrated-qa-closeout.md`     |

## Current Context Snapshot

Date: 2026-05-11.

- Source idea originally suggested a table-like evidence register, but discussion refined the first implementation to preserving current blocks and flattening their visual treatment.
- Current `/815/compare/` entrypoint is `apps/www/src/pages/815/compare/index.astro`.
- `/815/compare` is no longer treated as a legacy visual exception: compare pages are part of `Шелково Онлайн` and should follow the site design concept.
- Current interactive compare UI is in Svelte 5 under `apps/www/src/compare/components`.
- Current page order: breadcrumbs, `Hero`, embedded `KPIStats`, `SettlementsExplorer`; static fallback renders `SettlementCard` grid until the explorer is ready.
- `SettlementsExplorer.svelte` currently owns price filters, map toggle, map placement, result count, sort select and rendered card grid.
- `SettlementMap.svelte` popup now uses an opaque bordered surface; old `bg-card/42`, `backdrop-blur-sm` and `backdrop-saturate` treatment was removed in T3.
- `SettlementCard.svelte` now uses a flat, lightly rounded result-item treatment without hover translate or hover shadow.
- Settlement detail hero glass is intentionally preserved as a functional map overlay because it improves readability over the map background.
- Compare-local shell overrides live in `apps/www/src/compare/styles/global.css` and are guarded by `apps/www/src/compare/lib/styles.architecture.test.ts`.

## Intentional Scope Boundaries

- Do not rebuild the page as a table-first UI in this task package.
- Do not move the map.
- Do not add search, presets, saved filters, URL state or fast narrowing.
- Do not change rating math, tariff normalization or settlement data schema.
- Do not change compare routes, breadcrumbs, canonicals, sitemap or nginx config.

## Validation Gaps To Track

- Post-closeout browser review covered `/815/compare/` desktop and mobile plus the settlement detail hero map layer, but did not exercise every settlement detail variant.
- Map popup placement still needs a focused click-through check if popup behavior changes; unit tests use mocks.
- No compare-specific visual snapshot suite exists yet; future visual diffs should capture before/after notes or screenshots.

## Task Log

### Post-closeout polish - 2026-05-11 - browser readability pass

Status: done.

Context:

- User started the dev server, so browser verification became available after T5.
- Desktop `/815/compare/` kept the strong KPI-at-right intro direction, which was approved.
- The settlement list under the map was too hard to scan after the first flat pass, and the selected tariff filter was not visually obvious.
- The settlement detail page glass treatment was reviewed and intentionally kept as a functional overlay over the map.

Verification:

- Browser screenshots reviewed `/815/compare/` at 1440px and 390px widths.
- Result items now use quiet full bordered surfaces with slight rounding and less internal divider noise.
- The selected price filter now uses slight rounding, primary border, primary-soft background and primary text.
- Settlement detail table sections no longer add an extra `ui-shell` top divider between each table; the tables keep their own evidence surfaces.
- `pnpm --dir apps/www test src/compare/components/Hero.svelte.test.ts src/compare/components/KPIStats.svelte.test.ts src/compare/components/SettlementCard.svelte.test.ts src/compare/components/SettlementsExplorer.svelte.test.ts` passed: 4 files, 36 tests.

Residual risks:

- Full `pnpm --dir apps/www typecheck` and build still need to run for the final session closeout.

### Post-closeout polish - 2026-05-11 - filter density and rating nav

Status: done.

Context:

- User asked to reduce the top/bottom padding in the compare filters by about half after the first density pass.
- Rating method page still had `ui-shell` in the right rail, so the rail was flattened and given an explicit active section state.

Verification:

- `SettlementsExplorer.svelte` controls now use `py-1.5` instead of `py-3`; the component test guards this density.
- Rating right rail no longer uses `ui-shell`; nav links use `aria-current="true"` with a restrained primary-soft selected state.
- Svelte autofixer passed for `SettlementsExplorer.svelte` with no issues.
- `pnpm --dir apps/www test src/compare/components/SettlementsExplorer.svelte.test.ts` passed: 1 file, 12 tests.
- `pnpm --dir apps/www typecheck` passed.
- `git diff --check` passed.
- `pnpm build` passed and regenerated `dist/www`.

Residual risks:

- Browser visual check was skipped because `http://127.0.0.1:4321/815/compare/` was not running; do not start `pnpm dev` without explicit user approval.

### T5 - 2026-05-11 - integrated QA and closeout

Status: done.

Context:

- Scope is limited to integrated QA, small consistency fixes if needed and closing out the redesign docs.
- Preserve current block order, map placement, user-facing data and compare behavior.
- Do not add fast narrowing, search, presets, URL state or a table-first redesign.
- Static code review found no required integration fixes in the root `/815/compare/` flow: block order remains breadcrumbs, `Hero`, embedded `KPIStats`, `SettlementsExplorer`, and static fallback `SettlementCard` grid.
- `impeccable` was applied as a product polish pass. Context loaded from `PRODUCT.md` and `DESIGN.md`; canonical design rules came from `docs/design/design-code-shelkovo.md`. The pass confirmed the restrained, flat evidence-register direction and found no mandatory UI changes before closeout.
- Static grep of old surface vocabulary found only test assertions, compare primitive definitions and `SourcesList.svelte` on settlement detail pages, not a T2-T4 root compare regression.

Verification:

- `pnpm --dir apps/www test` passed: 65 files, 431 tests.
- `pnpm --dir apps/www typecheck` passed.
- `pnpm build` passed and generated `/815/compare/index.html` plus compare data/routes.
- `curl --fail --silent --show-error --max-time 2 "http://127.0.0.1:4321/815/compare/" >/dev/null` failed because no local server was running; T5 did not start `pnpm dev` without explicit approval.
- `git diff --check` passed.

Residual risks:

- Mobile and desktop browser visual review gap was closed in the post-closeout polish pass for `/815/compare/`.
- Yandex Maps popup placement still needs focused real-browser click-through if popup behavior changes.
- Settlement detail source rows remain quiet bordered evidence rows; they no longer sit inside an extra top-divided section wrapper.

Recommended follow-up:

- Turn `docs/ideas/ui-ux-critique-2026-05-11/03-compare-fast-narrowing.md` into a separate task package.
- Decide whether fast narrowing gets URL state before implementation; this affects sharing and browser history behavior.
- Keep search/presets restrained: settlement, company, district, clear reset and visible count, without turning the page into an analytics dashboard.

### T4 - 2026-05-11 - flatten settlement result cards

Status: done.

Context:

- Scope is limited to `SettlementCard.svelte`, `TariffRank.svelte` if needed, related tests and this task documentation.
- Preserve article semantics, settlement links, district, badges, rank label, tariff, delta text, `TariffRank` meaning and explorer/static grid behavior.
- Do not introduce table mode, new evidence fields, filter/sort behavior changes, search, presets or URL state.
- Settlement result items now use a lightly rounded bordered surface and typography for hierarchy instead of hover lift or raised-card affordance.
- The `rabstvo` badge uses the standard danger badge treatment by default, with the stronger danger fill only on hover.
- `TariffRank` markers now use flat border/fill classes; `shadow`, `ring` and `bg-card` marker vocabulary was removed.

Verification:

- Svelte autofixer passed for `SettlementCard.svelte` and `TariffRank.svelte` with no issues.
- `pnpm --dir apps/www test src/compare/components/SettlementCard.svelte.test.ts src/compare/components/TariffRank.svelte.test.ts src/compare/components/SettlementsExplorer.svelte.test.ts` passed: 3 files, 31 tests.
- `pnpm --dir apps/www typecheck` passed.
- `rg "hover:-translate|hover:shadow-lg|shadow-lg" apps/www/src/compare/components/SettlementCard.svelte` produced no matches.
- `git diff --check` passed.

Intentional leftovers:

- No browser visual review was run because the workflow forbids `pnpm dev` without explicit approval.
- Integrated page QA remains for T5.

### T3 - 2026-05-11 - flatten explorer controls and map panel

Status: done.

Context:

- Scope is limited to `SettlementsExplorer.svelte`, `SettlementMap.svelte`, related tests if needed and this task documentation.
- Preserve filter behavior, count/sort behavior, map placement and desktop/mobile map defaults.
- Explorer controls now use a flat `border-y` evidence row, with filter radio labels, count/sort row and map toggle kept in the same page flow.
- Active filters are marked by a text marker with a divider, not a pill.
- `SettlementMap` shell now uses a plain border and opaque surface; map popup panel and arrow use `bg-[color:var(--color-surface)]` with `border-border`, without blur/saturate/glass classes.

Verification:

- Svelte autofixer passed for `SettlementsExplorer.svelte` and `SettlementMap.svelte` with no issues; remaining suggestions were pre-existing state/effect and bind:this patterns outside T3 scope.
- `pnpm --dir apps/www test src/compare/components/SettlementsExplorer.svelte.test.ts src/compare/components/SettlementMap.svelte.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `rg "backdrop-blur|backdrop-saturate|bg-card/" apps/www/src/compare/components/SettlementMap.svelte` produced no matches.
- `git diff --check` passed.

Intentional leftovers:

- No browser visual review was run because the workflow forbids `pnpm dev` without explicit approval.
- Settlement result cards remain for T4.

### T2 - 2026-05-11 - redesign hero and KPI summary as flat evidence intro

Status: done.

Context:

- Scope is limited to `Hero.svelte`, `KPIStats.svelte`, related component tests and this task documentation.
- Preserve current title, subtitle, rating link, peer median, all-settlements median and delta text; redesign only the visual hierarchy and surface treatment.
- Hero now uses a flat `border-y` intro surface, `bg-[color:var(--color-bg-soft)]`, typography and a desktop grid instead of `ui-shell-strong`.
- Embedded `KPIStats` now sits as divided evidence items inside the hero, not as nested rounded/shadowed tiles.
- Standalone `KPIStats` keeps the flat compare `ui-shell` wrapper and uses inner dividers rather than raised cards.
- Component tests now guard subtitle link rendering and reject `rounded`, `shadow`, `bg-card` and `surface-raised` inner KPI tile vocabulary.

Verification:

- Svelte autofixer passed for `Hero.svelte` and `KPIStats.svelte` with no issues.
- `pnpm --dir apps/www test src/compare/components/Hero.svelte.test.ts src/compare/components/KPIStats.svelte.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `git diff --check` passed.

Intentional leftovers:

- No browser visual review was run because the workflow forbids `pnpm dev` without explicit approval.
- Explorer controls, map popup and settlement cards remain for T3-T4.

### T1 - 2026-05-11 - flatten compare surface primitives

Status: done.

Context:

- Compare-local `ui-shell` now uses a transparent surface, top divider, zero radius and no shadow.
- Compare-local `ui-shell-strong` now differs only by a stronger top divider, not by elevation.
- Compare-local `ui-chip` is text-like by default: no background, border, radius or pill padding.
- Compare-local `ui-btn` explicitly keeps square corners so filters remain usable without making every control a decorative pill.
- Architecture test snapshots guard these four primitive rules and reject the old raised shell vocabulary: `var(--shadow-1)`, `var(--shadow-2)`, `border-radius: 1rem`, `background: var(--color-card)` and `background: var(--color-elevated)` inside shell rules.

Verification:

- `pnpm --dir apps/www test src/compare/lib/styles.architecture.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `git diff --check` passed.

Intentional leftovers:

- Hero, KPI, explorer, map popup and settlement-card layout remain for T2-T4.
- No browser visual review was run because T1 only changes local primitives and the workflow forbids `pnpm dev` without explicit approval.

### T0 - 2026-05-11 - planning docs created

Status: done.

Context:

- Created task index, handoff and one task file per implementation slice.
- Product direction: keep existing blocks and order; flatten visual system; leave fast narrowing for later.

Verification:

- Planning-only change. No code verification run.
