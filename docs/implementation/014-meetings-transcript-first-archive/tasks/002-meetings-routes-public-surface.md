# Task 002 - Meeting route helpers and Public Surface Registry slice

## Goal

Register the MVP public route pattern `/meetings/[slug]/` as a section-owned Public Surface Registry slice without adding any section index, Markdown, JSON, `llms` or catalog surface.

## Dependencies

- Task 001 must be complete.

## Files Likely Touched

- `apps/www/src/lib/meetings/routes.ts`
- `apps/www/src/lib/meetings/public-surface.ts`
- `apps/www/src/lib/public-surface/index.ts`
- `apps/www/src/lib/public-surface/index.test.ts`
- `apps/www/src/lib/discovery.test.ts`

## Route Helper Contract

Add a new meetings route helper module.

Expected helpers:

- `meetingPath(slug: string): string` returns `/meetings/[slug]/`.
- `meetingPattern(): string` returns `/meetings/:slug/`.
- `meetingUrl(slug: string): string` returns base-aware URL through `withBase`.
- `meetingCanonical(slug: string): string` returns absolute canonical through `canon`.

Do not export `meetingsPath()` for `/meetings/` because there is no index route in MVP.

Use the existing `need(value, name)` route helper style from `news/routes.ts`, `status/routes.ts` and `people/routes.ts`.

## Public Surface Contract

Add `meetingsPublicSurfaceSlice`:

- owner id: `meetings`.
- owner label: `Архив встреч`.
- owner has no `entryPath` in MVP.
- surfaces contains only one surface.
- surface id: `meetings:detail`.
- surface label: `Страница транскрипции встречи` or similarly precise.
- surface routePattern: `meetingPattern()`.
- mediaType: `text/html`.
- cacheClass: `html`.
- discoveryRoles: `['detail-page']`.
- no `catalogRole`.
- no `linkRelations`.
- no `acceptsNegotiation` unless the type requires a deliberate value. Prefer omission.

## Registry Integration

- Import `meetingsPublicSurfaceSlice` in `apps/www/src/lib/public-surface/index.ts`.
- Add it to `createPublicSurfaceRegistry([...])` near the other root-site sections.
- Re-export it from the same module.

## Tests To Add Or Update

Update `apps/www/src/lib/public-surface/index.test.ts`:

- Assert `publicSurfaceRegistry.surfacesByOwner('meetings')` has exactly the detail surface.
- Assert `publicSurfaceRegistry.surfaceOwner('meetings:detail')` is the meetings owner.
- Assert no registered meetings surface has `path: '/meetings/'`.
- Assert meetings owner has no `entryPath`.
- Assert the detail surface routePattern equals `meetingPattern()` and has no `catalogRole`.

Update `apps/www/src/lib/discovery.test.ts` if needed:

- Assert root catalog output does not include `/meetings/:slug/`.
- Assert root catalog output has no empty linkset entry after adding meetings.

## Acceptance Criteria

- [ ] Registry contains the meetings detail route pattern.
- [ ] Registry does not contain `/meetings/` index.
- [ ] Meetings does not appear in root API catalog items.
- [ ] No pages are created in this task.
- [ ] No data collections are created in this task.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/public-surface/index.test.ts src/lib/discovery.test.ts`.

## Memory Updates

Record the final route helper names in `memory.md` if they differ from this task.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
