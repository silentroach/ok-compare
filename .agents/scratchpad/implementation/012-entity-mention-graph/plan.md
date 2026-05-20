# Plan

1. Step 1 - Neutral mention layer
   - Demo: `apps/www/src/lib/mentions` owns neutral entity mention types, registry creation, parser/normalizer behavior, and the existing people adapter still exposes current call-site compatibility.
   - Expected wave: `task-01-neutral-mentions.md`.
2. Step 2 - Markdown pipeline integration
   - Demo: app Markdown rendering accepts the generic mention registry and rejects self-links during body normalization.
   - Expected wave: `task-02-markdown-pipeline.md`.
3. Step 3 - Source ref adapters
   - Demo: news, status, and people publish neutral `EntityMentionSourceRef[]` from their own domain data.
   - Expected wave: `task-03-source-ref-adapters.md`.
4. Step 4 - Generic graph and people backlinks migration
   - Demo: generic graph groups, dedupes, sorts source refs and people backlinks keep their public shape without source-section coupling in `people/load.ts`.
   - Expected wave: `task-04-generic-graph.md`.
5. Step 5 - Boundary cleanup and docs
   - Demo: stale people-only imports and temporary bridges are removed, and agent-facing docs describe the generic app-level mention layer.
   - Expected wave: `task-05-cleanup-docs.md`.
6. Step 6 - Final regression and hardening
   - Demo: ADR-012 implementation is verified end-to-end with full workspace checks or documented blockers.
   - Expected wave: `task-06-final-regression.md`.
7. Step 7 - Labelled mention URL boundary hardening
   - Demo: labelled mention replacement handles URL-encoded destinations without corrupting adjacent Markdown.
   - Expected wave: `task-07-label-mention-url-encoding.md`.
8. Step 8 - Encoded URL boundary regression test
   - Demo: a focused test locks the encoded-destination boundary behavior for labelled mentions.
   - Expected wave: `task-08-test-encoded-url-boundaries.md`.
9. Step 9 - Shared content helper
   - Demo: news, status and people loaders use one app-level Markdown content helper.
   - Expected wave: `task-09-extract-content-helper.md`.
10. Step 10 - Empty mention registry hardening
    - Demo: loader fallback registries cannot leak accidental mutation across dataset builds.
    - Expected wave: `task-10-harden-empty-registry.md`.
11. Step 11 - Empty registry defensive test
    - Demo: a focused regression test proves fallback registry mutation does not affect later builds.
    - Expected wave: `task-11-test-empty-registry-mutation.md`.
12. Step 12 - Russian text sort helper
    - Demo: Russian `localeCompare` sorting lives behind one shared helper with unchanged ordering.
    - Expected wave: `task-12-extract-ru-sort-helper.md`.
13. Step 13 - Loader circular dependency boundary
    - Demo: loader cycles are either broken by a smaller people registry module or explicitly documented at the dynamic imports.
    - Expected wave: `task-13-circular-loader-deps.md`.
