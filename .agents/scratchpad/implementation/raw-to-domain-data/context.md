# Context

Source type: PDD directory.

Source path: `docs/migrations/raw-to-domain-data/`.

Original request: implement the Raw DTO -> Domain model -> Public DTO migration described by `docs/migrations/raw-to-domain-data/`.

Primary architecture source: `docs/decisions/013-raw-domain-public-data-boundary.md`.

Repo patterns and constraints:

- Work is mostly in `apps/www`; agents touching that app must read `apps/www/AGENTS.md`.
- Domain interfaces are handwritten, readonly, camelCase, and do not import Zod.
- Raw DTO schemas may keep external `snake_case` and may use `z.output` for raw types.
- Raw-to-domain mapping belongs in explicit mapper functions close to loaders.
- Public JSON, discovery, `llms.txt`, `llms-full.txt`, Markdown companions, and backlinks are separate public DTO surfaces and must not accidentally mirror domain internals.
- Existing public contracts must only change in explicit public-surface tasks with tests and documentation updates.
- Do not run `pnpm dev` without explicit user request.

Acceptance criteria for the overall migration:

- Internal app code no longer treats raw `snake_case` data as domain data.
- YAML/frontmatter schemas remain raw external DTO schemas.
- Loaders return domain interfaces.
- Domain objects use readonly nested contracts where practical.
- Public/agent-facing outputs are built through explicit public adapters.
- Enum and string literal mappings are explicit and covered where values change.
- `z.infer` or `z.output` are not used as shortcuts for domain interfaces.
