# Plan

1. Step 1 - Inventory current data boundaries
   - Demo: `docs/migrations/raw-to-domain-data/inventory.md` maps raw sources, internal `snake_case` hotspots, public surfaces, and enum/string values before runtime changes begin.
   - Expected wave: `docs/migrations/raw-to-domain-data/tasks/01-boundary-inventory.md`.
2. Step 2 - Clean shared mention contracts
   - Demo: mention graph/source contracts use camelCase internal names while editorial mention syntax stays unchanged.
   - Expected wave: `docs/migrations/raw-to-domain-data/tasks/02-mention-contracts.md`.
3. Step 3 - Migrate compare data path
   - Demo: compare loaders/core/UI/public adapters use explicit raw/domain/public boundaries without public contract drift.
   - Expected wave: tasks 03, 04, and 05.
4. Step 4 - Migrate news data path
   - Demo: news schemas/loaders/articles use raw DTOs, domain interfaces, mapper tests, and stable public surfaces.
   - Expected wave: tasks 06 and 07.
5. Step 5 - Migrate status data path
   - Demo: status incidents and UI/public adapters use the new boundary with explicit enum mapping and tests.
   - Expected wave: tasks 08 and 09.
6. Step 6 - Migrate people data path
   - Demo: people profiles, backlinks, and people public surfaces use domain/public DTO boundaries without breaking mentions.
   - Expected wave: tasks 10 and 11.
7. Step 7 - Lock public DTO contracts
   - Demo: cross-section public JSON/discovery/llms/Markdown contracts are explicit, tested, and documented.
   - Expected wave: task 12.
8. Step 8 - Final guardrails and cleanup
   - Demo: final grep/tests/typecheck prove `snake_case` only remains in allowed raw/public/documentation zones.
   - Expected wave: task 13.
