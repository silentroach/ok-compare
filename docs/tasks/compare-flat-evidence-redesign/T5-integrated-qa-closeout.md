# T5 - Run Integrated QA And Close Out Redesign Docs

Status: done.

Dependencies: T2, T3, T4.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`
- `code-review-and-quality`
- `browser-testing-with-devtools` only if a dev/preview server is explicitly approved or already running

## Goal

Verify the redesigned compare page as one integrated flow, close task docs and capture follow-up risks for the next agent or human reviewer.

## Scope

In:

- Review the combined page after T2-T4 for inconsistent surface vocabulary, accidental nested cards, leftover decorative blur and broken responsive hierarchy.
- Make only small integration fixes needed to align completed tasks.
- Run final tests/build checks.
- Update index and handoff to `done` for all completed tasks and record final validation gaps.

Out:

- Do not start fast narrowing, search, presets or a table-first redesign.
- Do not introduce new shared UI primitives unless a blocking inconsistency cannot be fixed locally.
- Do not run `pnpm dev` without explicit user approval.

## Likely Files

- `docs/tasks/compare-flat-evidence-redesign.md`
- `docs/tasks/compare-flat-evidence-redesign-handoff.md`
- Small integration fixes in `apps/www/src/pages/815/compare/index.astro` or `apps/www/src/compare/components/*` only if needed.

## Acceptance Criteria

- [x] Compare page keeps current block order and map placement.
- [x] Normal compare surfaces are flat-first: no default raised shells, no hover-lift result cards, no decorative glass popup.
- [x] User-facing data and behavior from before the redesign remain available.
- [x] Handoff records final verification, residual risks and recommended follow-up for `03-compare-fast-narrowing.md`.
- [x] Task registry and task files are in sync.

## Verification

- [x] Run `pnpm --dir apps/www test`.
- [x] Run `pnpm --dir apps/www typecheck`.
- [x] Run `pnpm build`.
- [x] Run `git diff --check`.
- [x] If browser verification is approved, check `/815/compare/` at mobile and desktop widths and record results. If not approved, document the gap.

Completed notes:

- Integrated static QA confirmed the `/815/compare/` flow keeps the current order: breadcrumbs, hero with embedded KPI summary, filters, map, count/sort row and settlement results.
- `impeccable` product polish pass found no required UI fixes before closeout: the page remains a restrained, flat evidence tool rather than a SaaS hero-metric surface.
- Post-closeout browser verification later ran against the user-started dev server on `localhost:4321`; desktop and mobile review found list readability and selected-filter visibility issues, which were corrected.
- Settlement detail hero glass remains intentional because it acts as a readable layer over the map, not as decorative default glass on evidence rows.
- Recommended next package: refine `docs/ideas/ui-ux-critique-2026-05-11/03-compare-fast-narrowing.md` into tasks for search, presets, visible reset and optional URL state decisions.

## Handoff Notes

- Record final command output summary, any intentional leftovers and whether fast narrowing should become the next task package.

## Commit Message Suggestion

`finalize compare flat redesign qa`
