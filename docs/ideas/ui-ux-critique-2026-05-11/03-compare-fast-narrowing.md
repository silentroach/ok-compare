# Compare Needs Fast Narrowing

## Status

Idea for discussion.

## Source

Impeccable critique, 2026-05-11.

## Problem

`/815/compare/` has filters and sorting, but it does not give users a fast way to find a known settlement, company or nearby alternative.

## Why It Matters

A resident or buyer often arrives with a specific comparison in mind. Scanning a long card grid or map makes the task slower than it needs to be.

## Change Idea

Add a narrowing layer above the results:

- search by settlement, company and district;
- presets like `рядом с Шелково`, `дешевле 815 ₽`, `похожий уровень`;
- visible result count after each filter change;
- a clear reset action.

The feature should reduce decision load without turning the page into a complex analytics tool.

## Likely Scope

- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- settlement data/search helpers under `apps/www/src/compare` if needed.

## Suggested Impeccable Command

`impeccable layout /815/compare/`

## Open Questions

- Which fields are reliable enough for search and presets today?
- Should presets be mutually exclusive filters or quick saved searches?
- Should search state be reflected in the URL for sharing?
