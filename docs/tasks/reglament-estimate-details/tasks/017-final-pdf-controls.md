# Task 017: Final PDF Controls

Status: [x] Done

## Description

Use `final.pdf` as the top-level control index for detail rows and section totals.

## Acceptance Criteria

- [x] Each detail estimate row maps to a row or section in `final.pdf` where applicable.
- [x] Top-level annual gross controls reconcile to `estimate-2026`.
- [x] Control totals distinguish final-PDF controls from section-PDF detail controls.
- [x] Any final/detail mismatch is listed in checks markdown.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `/815/regulation/details/checks.md` includes final controls.

## Dependencies

- Task 007.
- Task 008.
- Task 009.
- Task 010.
- Task 012.
- Task 013.
- Task 014.
- Task 015.
- Task 016.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`

## Estimated Scope

Medium: 2 files plus tests.
