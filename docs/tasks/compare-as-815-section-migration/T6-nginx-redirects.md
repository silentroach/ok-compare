# T6: Replace Nginx Compare Page Handling With Old-Path Redirects

Status: done

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Заменить serving behavior для старых public page URLs на hardcoded permanent redirects to `/815/compare/...`, preserving only ACME handling needed for certificates.

## Acceptance Criteria

- [x] `ops/nginx/sravni-shelkovo.conf` no longer serves standalone compare HTML for `/`, `/rating/`, `/settlements/:slug/`; those URLs redirect to `https://kpshelkovo.online/815/compare/...`.
- [x] `ops/nginx/kpshelkovo-online.conf` has temporary 3-month redirects from `/compare/`, `/compare/rating/`, `/compare/settlements/:slug/` to `/815/compare/...`.
- [x] Temporary new-domain redirects include an explicit TODO removal date three months after implementation.
- [x] Redirect rules are hardcoded from current settlement slugs; any temporary generator/script used to produce them is not committed.
- [x] Existing nginx handling for new `/815/compare` static assets, data, markdown negotiation, API catalog and fallback serving is present.
- [x] No new-domain redirects are added for `.md`, JSON, OpenAPI, schemas, `llms.txt`, assets or sitemap URLs; old-domain unmatched URLs redirect to the new root by documented T6 decision.

## Verification

- [x] `nginx -t` command is documented for target host, or local syntax validation is run if nginx is available.
- [x] `rg "return 301|/compare|/815/compare" ops/nginx` reviewed for rule order and shadowing.
- [x] Handoff includes generated settlement slug count and exact source of slugs.

## Dependencies

- T2.
- T3.
- T4.

## Likely Touched Files

- `ops/nginx/kpshelkovo-online.conf`
- `ops/nginx/sravni-shelkovo.conf`
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T6-nginx-redirects.md`

## Estimated Scope

M.

## Completion

- [x] Mark this file `Status: done`.
- [x] Update task index status.
- [x] Update handoff task registry and task log.
- [x] Commit this task separately.
