# Regulation Starts With Guidance Before Mechanics

## Status

Idea for discussion.

## Source

Impeccable critique, 2026-05-11.

## Problem

`/815/regulation/` opens into a dense calculator and table surface with many editable fields, repeated missing-rate notes and expandable calculation rows.

Residents first need a plain answer to the question: why does the tariff come out this way?

## Why It Matters

The regulation page is one of the highest-stakes pages in the product. If it starts with mechanics, many residents will leave before they understand what the numbers mean.

## Change Idea

Add a compact explanation layer before the table:

- top cost drivers;
- what changed when the user edits values;
- what is calculated from the document and what is a site-side assumption;
- jump links by section;
- a short note on how to read rows with missing rates.

Keep the full calculator, but make editing feel like an intentional mode rather than the first thing users must parse.

## Likely Scope

- `apps/www/src/pages/815/regulation/index.astro`
- possible extracted UI primitives in `packages/ui` if the pattern is reused later.

## Suggested Impeccable Command

`impeccable clarify /815/regulation/`

## Open Questions

- Should editing be always visible, or should the page start in read-only explanation mode?
- Which 3 to 4 cost drivers should be surfaced first?
- Should the summary compare the calculated total to `815 ₽` directly?
