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
