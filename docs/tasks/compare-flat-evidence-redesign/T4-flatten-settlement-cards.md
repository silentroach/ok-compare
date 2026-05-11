# T4 - Flatten Settlement Result Cards

Status: pending.

Dependencies: T1.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`
- `svelte-code-writer`
- `copy-editing` if any visible Russian text changes
- `web-typography` if card typography changes materially

## Goal

Keep the current settlement grid and facts, but make each result feel like a flat evidence item instead of a hover-lift card.

## Scope

In:

- Redesign `SettlementCard.svelte` to remove decorative elevation, hover lift and generic card-dashboard styling.
- Keep article semantics, title link, district, badges, rank label, tariff, delta text and `TariffRank` strip.
- Adjust `TariffRank.svelte` only if needed to match the flatter visual vocabulary.
- Update component tests when markup or accessible labels change.

Out:

- Do not replace the grid with a table.
- Do not add service evidence fields beyond what the current card already renders.
- Do not change sort/filter behavior in `SettlementsExplorer.svelte` except if tests need harmless selector updates.

## Likely Files

- `apps/www/src/compare/components/SettlementCard.svelte`
- `apps/www/src/compare/components/TariffRank.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte.test.ts`
- `apps/www/src/compare/components/TariffRank.svelte.test.ts`
- `apps/www/src/compare/components/SettlementsExplorer.svelte.test.ts`

## Acceptance Criteria

- [ ] Settlement cards no longer use hover translate, hover lift or default raised shadow as their primary affordance.
- [ ] Card hierarchy still makes settlement name, tariff and delta scannable.
- [ ] Rank and baseline markers remain textual or have accessible labels; meaning is not color-only.
- [ ] Static fallback grid in `index.astro` still renders the same `SettlementCard` component.
- [ ] Existing settlement card behavior and links remain covered by tests.

## Verification

- [ ] Run Svelte autofixer on touched `.svelte` files.
- [ ] Run `pnpm --dir apps/www test src/compare/components/SettlementCard.svelte.test.ts src/compare/components/TariffRank.svelte.test.ts src/compare/components/SettlementsExplorer.svelte.test.ts`.
- [ ] Run `pnpm --dir apps/www typecheck`.
- [ ] Confirm old hover-lift vocabulary is gone with `rg "hover:-translate|hover:shadow-lg|shadow-lg" apps/www/src/compare/components/SettlementCard.svelte` or document any intentional exception.
- [ ] Run `git diff --check`.

## Handoff Notes

- Record whether the final result should still be called a card in future tasks, or whether agents should treat it as a result row/item.

## Commit Message Suggestion

`flatten compare settlement cards`
