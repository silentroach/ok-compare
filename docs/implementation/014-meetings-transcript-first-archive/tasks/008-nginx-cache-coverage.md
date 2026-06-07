# Task 008 - Nginx cache coverage for meetings HTML

## Goal

Add explicit nginx HTML cache coverage for `/meetings/[slug]/` and update route cache tests.

The route is HTML-only and must not negotiate Markdown by `Accept`.

## Dependencies

- Task 006 must be complete because `route-cache-coverage.test.ts` discovers Astro page files.

## Skills

Load before implementation:

- `nginx-expert`

Also read `ops/nginx/AGENTS.md` before editing nginx files.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `apps/www/src/lib/route-cache-coverage.test.ts`

## Nginx Behavior

Add coverage for paths like `/meetings/2026-06-13-ok-comfort/`:

- Serve `${uri}index.html`.
- Add `Cache-Control $html_cache_control always;`.
- Do not set `$md`.
- Do not add `error_page 418 = @markdown`.
- Do not add `Vary: Accept`.
- Do not add `Link rel="alternate"` for Markdown.
- Do not add CSP changes.

Preferred minimal change:

- Extend the existing HTML-only location that covers people/reglament if the regex stays clear and does not match `/meetings/`.
- Or add a separate `location ~ "^/meetings/[^/]+/$"` block if that is easier to reason about.

If extending the existing block, ensure `/meetings/` without slug does not match.

## Route Cache Test

Update `apps/www/src/lib/route-cache-coverage.test.ts` snapshot:

- Add `"/meetings/[slug]/"` to `htmlRoutes`.
- Confirm it is checked for ADR-002 HTML `Cache-Control`.
- Confirm it does not appear in the Accept-negotiated HTML routes snapshot.

No endpoint route classification should change because meetings has no endpoints in MVP.

## Acceptance Criteria

- [ ] `/meetings/[slug]/` matches an nginx location with `$html_cache_control`.
- [ ] `/meetings/[slug]/` does not negotiate Markdown by `Accept`.
- [ ] `/meetings/[slug]/` does not emit `Vary: Accept`.
- [ ] `/meetings/` index is not introduced or matched as a valid page.
- [ ] No CSP directives change.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/route-cache-coverage.test.ts`.
- [ ] If an nginx runtime is available later in deploy environment, run `nginx -t` before reload. Do not fabricate local success if nginx is unavailable.

## Memory Updates

Record the final nginx location pattern in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
