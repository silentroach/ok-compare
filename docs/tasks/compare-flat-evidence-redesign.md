# Compare Flat Evidence Redesign Task Index

Источник идеи: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Цель: привести `/815/compare/` к плоскому evidence-направлению дизайн-системы, сохранив текущие блоки, порядок, карту и данные. Это не table-first rewrite.

## Refined Direction

- Сохраняем текущую структуру: hero, KPI summary, фильтры, карта, счетчик/сортировка, карточки поселков.
- Не переносим карту и не делаем ее вторичным табом в этой пачке.
- Не добавляем search, presets, URL state или fast narrowing в этой пачке.
- Убираем островизатость: тени на обычных секциях, большие радиусы, nested cards, hover lift, glass/blur как декоративный default.
- Делаем блоки похожими на рабочий локальный реестр фактов, но без смены data model и без полной таблицы.

## Agent Workflow

1. Перед стартом прочитать `AGENTS.md`, `apps/www/AGENTS.md`, этот index, task-файл, `docs/tasks/compare-flat-evidence-redesign-handoff.md`, `docs/design/design-code-shelkovo.md` и source idea.
2. Взять первый `pending` task, у которого выполнены зависимости.
3. Перед правками отметить task как `in_progress` в task-файле, этом index и handoff.
4. Держать scope узким. Не брать соседние task-и без явной необходимости.
5. Подключить нужные skills: `frontend-ui-engineering`, `tailwind-design-system`; для `.astro` - `astro`; для `.svelte` - `svelte-code-writer`; для нового или измененного user-facing текста - `copy-editing`, а если меняется типографика отображаемого текста - `web-typography`.
6. После реализации выполнить verification из task-файла или записать в handoff, почему проверка недоступна.
7. Обновить handoff: что изменено, какие проверки прошли, какие риски остались.
8. Отметить task как `done` в task-файле, этом index и handoff.
9. Сделать отдельный git commit по завершенному task-у. В commit включать только изменения этого task-а и обновления task/handoff docs.

Commit message format: кратко и по смыслу, например `flatten compare surface primitives`.

## Cross-Cutting Rules

- Не запускать `pnpm dev` без явной просьбы пользователя.
- Не менять URL/base behavior `/815/compare/`.
- Не менять данные поселков, schema или правила рейтинга без отдельной задачи.
- Не добавлять fast narrowing, поиск, presets или shareable filter state в этой пачке.
- Не выносить стили в `packages/ui`, если паттерн нужен только compare. Если все же меняются shared стили или primitives, проверить все затронутые разделы `apps/www`.
- У новых/измененных compare-поверхностей сначала должны работать border, rhythm, background и typography. Тень только с функциональной причиной.
- Цветовые статусы должны оставаться понятными текстом, не только цветом.

## Task Status

| ID  | Task                                                                                                           | Status  | Dependencies |
| --- | -------------------------------------------------------------------------------------------------------------- | ------- | ------------ |
| T1  | [Flatten compare surface primitives](compare-flat-evidence-redesign/T1-flatten-surface-primitives.md)          | done    | None         |
| T2  | [Redesign hero and KPI summary as flat evidence intro](compare-flat-evidence-redesign/T2-redesign-hero-kpi.md) | done    | T1           |
| T3  | [Flatten explorer controls and map panel](compare-flat-evidence-redesign/T3-flatten-explorer-map.md)           | pending | T1           |
| T4  | [Flatten settlement result cards](compare-flat-evidence-redesign/T4-flatten-settlement-cards.md)               | pending | T1           |
| T5  | [Run integrated QA and close out redesign docs](compare-flat-evidence-redesign/T5-integrated-qa-closeout.md)   | pending | T2, T3, T4   |

## Checkpoints

After T1:

- [x] Compare-local surface contract is flat by default and covered by an architecture test.
- [x] No page structure or user-facing data changed.

After T4:

- [ ] Hero, KPI summary, explorer controls, map and settlement cards all use the same flat-first vocabulary.
- [ ] Component tests and `typecheck` pass or gaps are documented.

After T5:

- [ ] `pnpm --dir apps/www test`, `pnpm --dir apps/www typecheck` and `pnpm build` pass or gaps are documented.
- [ ] Every completed implementation task has its own commit.
- [ ] Handoff records residual risks and follow-up ideas.

## Open Questions

- Should `03-compare-fast-narrowing.md` become a separate task package after this visual cleanup?
- Should a future iteration still test table-first evidence register as an alternate desktop mode?
- Should map popups and status tooltips eventually share one overlay primitive?
