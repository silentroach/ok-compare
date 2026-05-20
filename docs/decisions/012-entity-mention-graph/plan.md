# Plan

1. Step 1 - Neutral mention contracts
   - Demo: app-level mention registry and normalizer handle current people mention syntax without domain coupling.
   - Wave: `task-01-neutral-mentions.md`.
2. Step 2 - Markdown pipeline migration
   - Demo: news, status and people Markdown body preprocessing uses the neutral mention layer and rejects self-links during normalization.
   - Wave: `task-02-markdown-pipeline.md`.
3. Step 3 - Source ref adapters
   - Demo: news, status and people publish neutral source refs without switching public backlinks yet.
   - Wave: `task-03-source-ref-adapters.md`.
4. Step 4 - Generic graph migration
   - Demo: people backlinks are built through a generic entity mention graph while preserving the public `PersonBacklinks` shape.
   - Wave: `task-04-generic-graph.md`.
5. Step 5 - Boundary cleanup and docs
   - Demo: leftover people-only coupling is removed and agent-facing docs match the final architecture.
   - Wave: `task-05-cleanup-docs.md`.
6. Step 6 - Final regression
   - Demo: ADR-012 is verified end-to-end with full workspace checks.
   - Wave: `task-06-final-regression.md`.
7. Step 7 - Labelled mention URL boundary hardening
   - Demo: labelled mention replacement handles URL-encoded destinations without corrupting adjacent Markdown.
   - Wave: `task-07-label-mention-url-encoding.md`.
8. Step 8 - Encoded URL boundary regression test
   - Demo: a focused test locks the encoded-destination boundary behavior for labelled mentions.
   - Wave: `task-08-test-encoded-url-boundaries.md`.
9. Step 9 - Shared content helper
   - Demo: news, status and people loaders use one app-level Markdown content helper.
   - Wave: `task-09-extract-content-helper.md`.
10. Step 10 - Empty mention registry hardening
    - Demo: loader fallback registries cannot leak accidental mutation across dataset builds.
    - Wave: `task-10-harden-empty-registry.md`.
11. Step 11 - Empty registry defensive test
    - Demo: a focused regression test proves fallback registry mutation does not affect later builds.
    - Wave: `task-11-test-empty-registry-mutation.md`.
12. Step 12 - Russian text sort helper
    - Demo: Russian `localeCompare` sorting lives behind one shared helper with unchanged ordering.
    - Wave: `task-12-extract-ru-sort-helper.md`.
13. Step 13 - Loader circular dependency boundary
    - Demo: loader cycles are either broken by a smaller people registry module or explicitly documented at the dynamic imports.
    - Wave: `task-13-circular-loader-deps.md`.
