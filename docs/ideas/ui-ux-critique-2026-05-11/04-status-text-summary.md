# Status Timeline Needs Text Summary

## Status

Idea for discussion.

## Source

Impeccable critique, 2026-05-11.

## Problem

The 90-day status timeline is useful, but tiny segments and hover/focus tooltips carry too much of the meaning.

## Why It Matters

Residents scanning service reliability need a quick written answer. Mobile users, keyboard users and screen-reader users should not have to inspect every segment to understand the pattern.

## Change Idea

Add a short text summary per service, for example:

> 8 отключений за 90 дней, последнее 5 мая, 13 мин.

The timeline remains visual proof. The summary becomes the primary resident-facing answer.

## Likely Scope

- `apps/www/src/components/status/StatusServiceCard.astro`
- `apps/www/src/components/status/StatusServiceTimeline.astro`
- status aggregation helpers if the summary needs derived counts or durations.

## Suggested Impeccable Command

`impeccable clarify /status/`

## Open Questions

- Which summary format is clearest: count, last incident, total duration or worst day?
- Should planned work and incidents be counted separately?
- Should the same summary appear on service detail pages?
