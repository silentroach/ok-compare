# Transcript-first архив встреч - implementation memory

This file is append-only implementation memory for agents working through `context.md` and `tasks/*.md`.

## Write Rules

- Add only durable facts that will help later agents.
- Keep entries short and dated or task-scoped.
- Do not paste noisy command output.
- Do not store speculation.
- Do not store secrets or private source material.
- If a fact changes, add a new correction entry instead of deleting history.

## Initial Durable Facts

- ADR-014 MVP is HTML-only detail pages at `/meetings/[slug]/`.
- No `/meetings/` index, no menu item, no Markdown companion, no JSON feed, no `llms.txt`, no `llms-full.txt`, no protocol fields and no iframe in MVP.
- Data shape selected for implementation planning: `apps/www/src/data/meetings/[slug]/index.yaml` plus companion `apps/www/src/data/meetings/[slug]/transcript.yaml`.
- Astro can load local YAML files with the `glob()` content loader, so the implementation should use two content collections instead of manually parsing YAML files.
- Planned collection names: `meetingEntries` for `*/index.yaml` and `meetingTranscripts` for `*/transcript.yaml`.
- Transcript text is plain text, not Markdown. Do not run entity mention normalization on transcript segment text.
- Known person speakers are resolved through the people mention registry by `person` slug; local speakers use only a local `name`.
- Speaker references in segments point to transcript-local speaker keys, not necessarily people slugs.
- Segment anchors are generated from `start`: `00:12:34` -> `t-00-12-34`; duplicate starts get suffixes `-2`, `-3` in input order.
- Root API catalog currently maps every public surface slice to a linkset entry. A meetings slice with no `catalogRole` needs catalog filtering to avoid an empty `{}` entry.
- Nginx needs an explicit HTML cache location for `/meetings/[^/]+/`; the generic fallback does not satisfy `route-cache-coverage.test.ts`.
- Adding source links to external sites does not require CSP changes. Embedding iframe/video would require separate CSP review, but iframe is outside MVP.
- Existing news article `apps/www/src/data/news/articles/2026/05/ok-meeting-june.md` announces a 13 June 2026 OК Комфорт meeting, but no transcript is available in this planning session.
- Do not fabricate the first public meeting transcript. Task 009 stays blocked until real transcript/source content is supplied.

## Implementation Entries

Add entries here as tasks are implemented.

## Completed Commits

Add commit hashes here after supervising agent commits completed task bundles.
