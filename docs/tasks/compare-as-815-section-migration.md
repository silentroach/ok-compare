# Compare as `/815/compare` Migration Task Index

Источник идеи: `docs/ideas/compare-as-815-section-migration.md`.

Цель: перенести compare из `/compare/` в `/815/compare/`, оставить compare отдельным section build, убрать standalone legacy-сборку и заменить старые публичные page URL редиректами.

## Agent Workflow

1. Перед стартом прочитать `AGENTS.md`, локальные `AGENTS.md` для всех затронутых зон, task-файл и `docs/tasks/compare-as-815-section-handoff.md`.
2. Взять первый незавершенный task, у которого выполнены зависимости.
3. Перед правками отметить task как `in_progress` в task-файле, в этом индексе и в handoff-файле.
4. Держать scope task-а узким. Не брать соседние task-и без необходимости.
5. После реализации выполнить verification из task-файла или записать в handoff, почему проверка недоступна.
6. Обновить `docs/tasks/compare-as-815-section-handoff.md`: что изменено, какие факты важны следующим task-ам, какие проверки прошли, какие риски остались.
7. Отметить task как `done` в task-файле, в этом индексе и в handoff-файле.
8. Сделать отдельный git commit по завершенному task-у. В commit включать только изменения этого task-а и обновления task/handoff docs.

Commit message format: кратко и по смыслу, например `move compare section base to 815 path`.

## Cross-Cutting Rules

- Не копировать compare-страницы в `apps/www`; compare остается section build из `apps/compare`.
- Не оставлять `/compare/` вечным alias. New-domain redirects временные на 3 месяца с явным TODO removal date.
- Старый домен `сравни.шелково.рф` после миграции не должен обслуживать standalone HTML.
- Public page URL scope для редиректов: `/`, `/rating/`, `/settlements/:slug/` на старом домене и `/compare/`, `/compare/rating/`, `/compare/settlements/:slug/` на новом домене.
- Не расширять редиректы на `.md`, JSON, OpenAPI, schemas, `llms.txt`, assets и sitemap без отдельного решения.
- При изменении frontend UI использовать `frontend-ui-engineering` и `tailwind-design-system`; при `.astro` использовать `astro`; при `.svelte` использовать `svelte-code-writer`.
- При изменении nginx в `ops/nginx` использовать `nginx-expert`.
- Не запускать `pnpm dev` из root без явной просьбы.

## Task Status

| ID  | Task                                                                                                                                         | Status | Dependencies   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- |
| T1  | [Audit URL surface and migration assumptions](compare-as-815-section-migration/T1-audit-url-surface.md)                                      | done   | None           |
| T2  | [Move compare section base and canonical to `/815/compare`](compare-as-815-section-migration/T2-move-compare-base.md)                        | done   | T1             |
| T3  | [Compose compare into `dist/www/815/compare` and update root dev/sitemap wiring](compare-as-815-section-migration/T3-compose-www-section.md) | done   | T2             |
| T4  | [Update root-site links and agent discovery references](compare-as-815-section-migration/T4-update-root-links-discovery.md)                  | todo   | T3             |
| T5  | [Add compare breadcrumbs and breadcrumb JSON-LD](compare-as-815-section-migration/T5-add-compare-breadcrumbs.md)                             | todo   | T2             |
| T6  | [Replace nginx compare page handling with old-path redirects](compare-as-815-section-migration/T6-nginx-redirects.md)                        | todo   | T2, T3, T4     |
| T7  | [Remove standalone legacy build and deploy path](compare-as-815-section-migration/T7-remove-legacy-build.md)                                 | todo   | T6             |
| T8  | [Final migration verification and documentation cleanup](compare-as-815-section-migration/T8-final-verification.md)                          | todo   | T4, T5, T6, T7 |

## Checkpoints

After T3:

- [x] `pnpm build:main` succeeds.
- [x] Compare section exists at `dist/www/815/compare`.
- [x] Root sitemap points to `/815/compare/sitemap.xml`.

After T6:

- [ ] Redirect scope matches idea exactly.
- [ ] New `/815/compare` serving rules are not shadowed by old redirects.
- [ ] Old domain is redirect-only for public page URLs.

After T8:

- [ ] Full `pnpm build`, `pnpm typecheck`, `pnpm test` pass or gaps are documented.
- [ ] Every completed task has its own commit.

## Open Questions

- External validation still needed before removing machine URL compatibility: nginx logs and/or Search Console access.
- Target-host `nginx -t` must be run during deploy or by an agent with host access.
