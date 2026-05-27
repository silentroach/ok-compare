# Plan

1. Step 1 - Source contract
   - Demo: route helpers, raw schemas, content collection, and editorial data rules define a stable meeting source contract without fake public meeting content.
   - Expected wave: `tasks/001-source-contract.md`.

2. Step 2 - Domain loader and public DTO
   - Demo: fixtures map from raw data to readonly domain objects, normalized transcript data, stable loaders, and camelCase public DTO output.
   - Expected wave: `tasks/002-domain-loader-public-dto.md`.

3. Step 3 - Core consumption surfaces
   - Demo: meeting mentions, human HTML pages, per-meeting Markdown companions, and JSON feed consume the domain layer with focused tests.
   - Expected wave: `tasks/003-meeting-mentions.md`, `tasks/004-html-pages.md`, `tasks/005-markdown-companions.md`, `tasks/006-json-feed.md` where file conflicts allow safe parallel work.

4. Step 4 - Agent and publication integration
   - Demo: meetings `llms*.txt`, root AI text, public surface registry, discovery, nginx expectations, sitemap detail inclusion, and main-menu exclusion are synchronized.
   - Expected wave: `tasks/007-llms-surfaces.md`, then `tasks/008-public-surface-and-nginx.md` and `tasks/009-sitemap-and-navigation.md` when dependencies close.

5. Step 5 - Video embed decision gate
   - Demo: if a real iframe provider is selected, embeds are allowlisted and CSP is updated narrowly; otherwise recording remains a normal link and the task stays blocked.
   - Expected wave: `tasks/010-video-embed-csp.md` only after provider selection.

6. Step 6 - Final integration review
   - Demo: all non-blocked MVP tasks are completed, typecheck/tests/build pass, public contracts are aligned, and docs statuses are consistent.
   - Expected wave: `tasks/011-final-integration-review.md`.
