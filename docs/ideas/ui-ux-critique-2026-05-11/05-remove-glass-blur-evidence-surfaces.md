# Remove Glass And Blur From Evidence Surfaces

## Status

Idea for discussion.

## Source

Impeccable critique, 2026-05-11.

## Problem

Blurred or translucent panels appear around status tooltips, map popups and settlement hero details.

## Why It Matters

The product’s design system says evidence surfaces should be flat, readable and calm. Decorative blur can feel less precise and may reduce legibility.

## Change Idea

Replace glass-like treatments with opaque surfaces:

- `surface` or `surface-raised` backgrounds;
- normal borders;
- restrained shadows only where a layer truly floats above the page;
- no decorative backdrop blur by default.

Map overlays may keep a practical contrast treatment if the map underneath makes text hard to read, but the reason should be legibility, not style.

## Likely Scope

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/compare/components/SettlementMap.svelte`
- `apps/www/src/pages/815/compare/settlements/[slug]/index.astro`
- related compare styles if blur is centralized.

## Suggested Impeccable Command

`impeccable quieter apps/www/src`

## Open Questions

- Which translucent layers are functional enough to keep?
- Should this become a lint/design-system rule after cleanup?
- Should map popups use the same panel vocabulary as status tooltips?
