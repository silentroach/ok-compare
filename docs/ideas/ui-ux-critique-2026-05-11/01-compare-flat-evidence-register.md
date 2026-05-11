# Compare as Flat Evidence Register

## Status

Idea for discussion.

## Source

Impeccable critique, 2026-05-11.

## Problem

`/815/compare/` uses a card-dashboard vocabulary: KPI tiles, rounded shells, hover-lift cards, map panels and repeated settlement cards.

This conflicts with the current design direction: flat-first surfaces, no SaaS hero-metric template, no identical card grids.

## Why It Matters

The page is about trust and comparison. If it looks like a generic dashboard, it weakens the local evidence-register tone of `Шелково Онлайн`.

## Change Idea

Make the desktop default closer to a sortable evidence register:

- settlement name;
- tariff;
- delta from `815 ₽`;
- rating explanation;
- key service evidence;
- source or methodology link.

Keep the map and card view as secondary modes, not the main reading structure.

## Likely Scope

- `apps/www/src/pages/815/compare/index.astro`
- `apps/www/src/compare/components/Hero.svelte`
- `apps/www/src/compare/components/KPIStats.svelte`
- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte`
- `apps/www/src/compare/styles/global.css`

## Suggested Impeccable Command

`impeccable quieter /815/compare/`

## Open Questions

- Should the table/list become the only desktop default, or should card view remain switchable?
- Should map move below the evidence list, into a collapsed section, or into a separate tab?
- Which comparison fields are mandatory for the first version?
