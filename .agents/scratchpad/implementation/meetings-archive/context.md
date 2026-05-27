# Meetings Archive Implementation Context

Source type: PDD directory.

Source directory: `docs/implementation/meetings-archive/`.

Original request: implement the meetings archive described by `docs/implementation/meetings-archive` for `apps/www`.

## Source Materials

- `docs/implementation/meetings-archive/context.md`
- `docs/implementation/meetings-archive/tasks/001-source-contract.md`
- `docs/implementation/meetings-archive/tasks/002-domain-loader-public-dto.md`
- `docs/implementation/meetings-archive/tasks/003-meeting-mentions.md`
- `docs/implementation/meetings-archive/tasks/004-html-pages.md`
- `docs/implementation/meetings-archive/tasks/005-markdown-companions.md`
- `docs/implementation/meetings-archive/tasks/006-json-feed.md`
- `docs/implementation/meetings-archive/tasks/007-llms-surfaces.md`
- `docs/implementation/meetings-archive/tasks/008-public-surface-and-nginx.md`
- `docs/implementation/meetings-archive/tasks/009-sitemap-and-navigation.md`
- `docs/implementation/meetings-archive/tasks/010-video-embed-csp.md`
- `docs/implementation/meetings-archive/tasks/011-final-integration-review.md`

## Repo Patterns

- `apps/www` is Astro 6 static output; read `apps/www/AGENTS.md` before implementation work there.
- Use `@/...` aliases inside `apps/www/src` except for neighboring files and imports outside `src`.
- Data boundaries follow ADR-013: raw Zod schema, handwritten readonly domain model, mapper, and public DTO are separate files.
- Public Markdown, `llms.txt`, and `llms-full.txt` must be generated through `@shelkovo/markdown` AST APIs or an app helper over them.
- Editorial Markdown body rendering must go through `@/lib/markdown/render` so app-level mentions and typograf behavior stay consistent.
- New mention-enabled editorial bodies must use the shared `SiteMentionRegistry`, not a separate people-only parser.
- Public surfaces must be reflected through the public surface registry where the task requires it.
- `/meetings/` is public but not a main-menu item and not a sitemap entry; meeting detail pages are sitemap entries.
- Do not add fake public meeting content for tests; use unit fixtures.
- Do not render arbitrary `video_embed_url` iframes; task `010` remains blocked until a real provider is selected.

## Integration Points

- Content collection and source validation: `apps/www/src/content.config.ts`.
- Meeting raw routes and helpers: new `apps/www/src/lib/meetings/routes.ts` and raw schema modules.
- Domain data: new `apps/www/src/lib/meetings/types.ts`, `mapper.ts`, `load.ts`, `public-dto.ts`.
- Mentions: `apps/www/src/lib/mentions/*`, `apps/www/src/lib/people/*`, existing news/status loaders.
- Human pages: `apps/www/src/pages/meetings/index.astro` and `apps/www/src/pages/meetings/[date]/[slug]/index.astro`.
- Agent surfaces: per-meeting Markdown route, JSON feed, meetings `llms*.txt`, root llms text, public surface registry, nginx expectations.
- Sitemap and navigation invariants: `apps/www/src/lib/sitemap*` and `apps/www/src/layouts/BaseLayout.astro`.

## Acceptance Criteria

- Source layout accepts `apps/www/src/data/meetings/YYYY-MM-DD/slug/index.md` and optional colocated `transcript.yaml`.
- Minimal meeting frontmatter is `title`, `date`, `summary`, `slug`; unsupported first-version fields are rejected.
- Domain/public data follows camelCase internally and in new public JSON, with raw snake_case isolated to source boundaries.
- HTML index and detail pages exist, hide absent optional sections, and keep `/meetings/` out of the main menu.
- Per-meeting Markdown, JSON feed, and `llms*.txt` surfaces use stable route helpers and public DTOs.
- Meeting mentions use `YYYY-MM-DD-slug` and integrate with the shared mention registry.
- Public surface registry, discovery, route cache coverage, nginx expectations, and sitemap rules stay synchronized.
- Final checks include focused tests, app typecheck, and root build as specified by the task files.

## Constraints

- Current runtime wave must contain only the current numbered step's task or tasks.
- Start with `001-source-contract`; it is not parallel-safe and gates the rest.
- Task `010-video-embed-csp` is intentionally blocked until a concrete iframe provider exists.
- Implementation agents must load the skills listed in their task file, then run `code-simplification` and `code-review-and-quality` before commit.
