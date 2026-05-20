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
