# Task 002: Row Dossier Builder

Status: [ ] Pending

## Description

Build a transformation layer that reads `estimateDetails2026` and produces row dossiers grouped by `estimate_row_id`.

## Acceptance Criteria

- [ ] Builder groups work items, resources and control totals into one dossier per `estimate_row_id`.
- [ ] Each dossier includes title, linked `service_ids`, source PDFs, total/gross controls and concise status information.
- [ ] Dossiers preserve enough provenance to trace every major fact back to existing `source_refs`.
- [ ] Builder output is deterministic and stable for snapshot tests.

## Verification

- [ ] Unit tests cover at least one cleaning row and one non-cleaning row.
- [ ] Snapshot clearly shows the row dossier shape without requiring PDF context.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`

## Dependencies

- Task 001.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent.ts`
- `apps/www/src/lib/reglament/detail-agent.test.ts`

## Estimated Scope

Medium: 2-4 files.
