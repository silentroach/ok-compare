# Plan

1. Step 1 - Boundary inventory
   - Demo: migration inventory documents raw sources, internal `snake_case` hotspots, public surfaces at risk and enum/string literals that need explicit mapping.
   - Wave: `tasks/01-boundary-inventory.md`.
2. Step 2 - Mention internal contracts
   - Demo: shared mention types and source-ref helpers use internal `camelCase` contracts while legacy public names stay behind explicit adapters.
   - Wave: `tasks/02-mention-contracts.md`.
3. Step 3 - Compare raw/domain foundation
   - Demo: compare data has explicit raw schemas, handwritten domain types and mapper tests.
   - Wave: `tasks/03-compare-raw-domain-foundation.md`.
4. Step 4 - Compare core domain migration
   - Demo: compare loaders and core calculations consume domain objects instead of raw YAML-shaped data.
   - Wave: `tasks/04-compare-core-domain-migration.md`.
5. Step 5 - Compare UI and public adapters
   - Demo: compare UI and public outputs use domain/public DTO boundaries without accidental contract changes.
   - Wave: `tasks/05-compare-public-ui-migration.md`.
6. Step 6 - News raw/domain foundation
   - Demo: news authors/articles have explicit raw schemas, domain types and mappers.
   - Wave: `tasks/06-news-raw-domain-foundation.md`.
7. Step 7 - News article domain migration
   - Demo: news article loaders and rendering paths consume domain article contracts.
   - Wave: `tasks/07-news-article-domain-migration.md`.
8. Step 8 - Status raw/domain foundation
   - Demo: status incidents have explicit raw schemas, domain types and mappers.
   - Wave: `tasks/08-status-raw-domain-foundation.md`.
9. Step 9 - Status UI and public adapters
   - Demo: status UI and public outputs use domain/public DTO boundaries.
   - Wave: `tasks/09-status-public-ui-migration.md`.
10. Step 10 - People raw/domain foundation
    - Demo: people profiles have explicit raw schemas, domain types and mappers.
    - Wave: `tasks/10-people-raw-domain-foundation.md`.
11. Step 11 - People public surfaces and backlinks
    - Demo: people public outputs and backlinks are built through explicit public DTO adapters.
    - Wave: `tasks/11-people-public-and-backlinks.md`.
12. Step 12 - Public DTO contracts across sections
    - Demo: public JSON/discovery/llms/Markdown contracts are explicit, tested and documented across migrated sections.
    - Wave: `tasks/12-public-dto-contracts.md`.
13. Step 13 - Final guardrails and cleanup
    - Demo: final checks prove internal code no longer uses raw `snake_case` contracts outside allowed boundaries.
    - Wave: `tasks/13-final-guardrails.md`.
