# Task: Reduce Initial DOM Size On Compare Page

## Goal

Reduce the initial DOM size of `/815/compare/` to improve render cost and maintainability while preserving the core comparison workflow.

## Lighthouse Finding

- Category: Performance diagnostic.
- Affected URL: `/815/compare/`.
- Audit: `dom-size`.
- Reported DOM size: about `5,118` elements.
- Large node: settlement card grid under `section#settlements`.

## Current Code

- Compare route renders a large settlement explorer with many cards and interactive controls.
- Likely components include `apps/www/src/compare/components/SettlementsExplorer.svelte` and `SettlementCard.svelte`.

## Proposed Work

- Identify which content must be visible on first load and which can be progressively revealed.
- Consider rendering fewer settlement cards initially with a "show more" or pagination pattern.
- Consider collapsing low-priority card details until a card is expanded.
- Avoid virtual scrolling unless simpler progressive disclosure cannot meet UX needs.
- Preserve URL/data contracts used by agent-facing surfaces and compare discovery outputs.

## Acceptance Criteria

- [ ] Initial DOM node count on `/815/compare/` is materially lower than the current representative run.
- [ ] Users can still access all settlements and filters.
- [ ] The page remains crawlable enough for key comparison content.
- [ ] Lighthouse Performance does not regress and ideally improves LCP/Speed Index.

## Verification

- [ ] Run compare component tests touched by the change.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.
- [ ] Run Lighthouse against `/815/compare/` and compare DOM size, LCP, and Speed Index.
- [ ] Manually test filtering, sorting, map toggles, and settlement links.

## Files Likely Touched

- `apps/www/src/pages/815/compare/index.astro`
- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte`
- Compare tests under `apps/www/src/compare/components/*.test.ts`

## Risks

- Hiding too much content can hurt SEO and agent-facing usefulness.
- Pagination can complicate filter counts and keyboard navigation.
- Virtualization can reduce DOM size but often harms find-in-page, accessibility, and static content value.
