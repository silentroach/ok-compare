# Task 001 - Public catalog supports detail-only registry slices

## Goal

Prepare the Public Surface Registry and root API catalog for a section that has a registered HTML detail route but no catalog-discoverable surfaces.

This must happen before adding the meetings slice. Otherwise `catalog(root)` can emit an empty linkset object for a slice whose surfaces have no `catalogRole`.

## Dependencies

None.

## Files Likely Touched

- `apps/www/src/lib/discovery.ts`
- `apps/www/src/lib/discovery.test.ts`
- Maybe `apps/www/src/lib/root-discovery-routes.test.ts`

## Implementation Notes

- Keep `publicSurfaceRegistry.slices` unchanged. The registry should still know about every owner and every surface.
- Change only root API catalog generation behavior.
- Build linkset entries from slices as now, then drop entries that have no `anchor`, no `item` and no `service-desc`.
- Do not add meetings in this task.
- Do not add route-specific exceptions.
- Preserve existing linkset ordering for entries that remain.
- Preserve base-aware URL handling through `surfaceHref(root, surface)`.

## Suggested Shape

In `apps/www/src/lib/discovery.ts`, extract a small local helper if it makes the filter readable:

```ts
const hasCatalogLinks = (entry: CatalogLinkset): boolean =>
  Boolean(entry.anchor || entry.item?.length || entry['service-desc']?.length);
```

Only add a type if TypeScript readability needs it. Do not create a broad abstraction.

## Tests To Add Or Update

- Update `apps/www/src/lib/discovery.test.ts` so expected root linksets are computed from slices that have at least one catalog role.
- Add an assertion that every emitted root linkset entry has at least one of `anchor`, `item`, or `service-desc`.
- Keep current assertions for root, people, reglament and compare entries.

## Acceptance Criteria

- [ ] Root API catalog does not emit empty linkset entries.
- [ ] Existing catalog items and service descriptions are unchanged.
- [ ] `publicSurfaceRegistry` still exposes all slices and surfaces.
- [ ] No meetings files or routes are added in this task.
- [ ] No public URL changes except removal of impossible empty catalog entries.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/discovery.test.ts src/lib/root-discovery-routes.test.ts`.
- [ ] If tests outside those files fail because of this change, inspect before widening scope.

## Memory Updates

Add a short entry to `memory.md` if the final catalog filtering shape differs from the suggested shape.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
