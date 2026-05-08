# LLM-Friendly Estimate Details

## Goal

Сделать новый agent-facing слой `estimate-details-agent-2026` для детальной сметы 2026: не сырой dump внутреннего curated dataset, а готовые row dossiers, по которым LLM-агент может отвечать без открытия PDF.

## Context

- Идея: `docs/ideas/llm-friendly-estimate-details.md`.
- Текущий curated dataset: `apps/www/src/data/reglament/estimate-details-2026.ts` и секционные модули в `apps/www/src/data/reglament/estimate-details-2026/`.
- Текущая публичная JSON-поверхность: `/815/regulation/data/estimate-details-2026.json`.
- Текущие markdown-поверхности: `/815/regulation/details.md`, `/815/regulation/details/materials.md`, `/815/regulation/details/machines.md`, `/815/regulation/details/labor.md`, `/815/regulation/details/checks.md`.
- Новый слой должен собираться из уже curated данных. PDF не парсить во время runtime или build.

## Product Principle

Главная единица публичного слоя - строка сметы, а не ресурс, источник или контрольная сумма.

Агенту нужен ответ на вопрос: что входит в эту строку, сколько это стоит, почему так посчитано, что спорно и где первичный источник.

## Target Public Surfaces

- `/815/regulation/data/estimate-details-agent-2026.json`
- `/815/regulation/details/agent.md`
- `/815/regulation/details/rows.md`
- Опционально после проверки: `/815/regulation/details/rows/{estimate_row_id}.md`

## Target Public Shape

Ориентир, не финальный контракт:

```ts
type EstimateDetailAgentDataset = {
  readonly schema_version: string;
  readonly dataset_id: 'estimate-details-agent-2026';
  readonly year: 2026;
  readonly rows: readonly EstimateDetailRowDossier[];
  readonly issues: readonly EstimateDetailIssue[];
  readonly evidence: readonly EstimateDetailEvidence[];
};
```

`rows[]` должен быть главным entrypoint. `issues[]` и `evidence[]` могут дублировать или индексировать данные из row dossiers, если это помогает агентам.

## Rules For Agents

- Перед изменениями в `apps/www` прочитать `apps/www/AGENTS.md`.
- Не удалять и не упрощать текущий curated dataset, пока новый слой не прошел проверку агентскими вопросами.
- Не использовать `null` в новых TypeScript-типах; использовать `undefined` и optional-свойства.
- Не добавлять PDF parsing в runtime или build.
- Если меняются agent-facing routes, markdown companions, JSON feeds, `llms.txt` или discovery docs, пересмотреть связанные поверхности синхронно.
- Если находишь новые решения или оговорки, добавляй их в `extra.md` рядом с этим index-файлом.
- По завершении задачи отмечай ее завершенной и коммить изменения, в коммите пиши номер задачи

## Task List

- [ ] [Task 001: Public contract](tasks/001-public-contract.md)
- [ ] [Task 002: Row dossier builder](tasks/002-row-dossier-builder.md)
- [ ] [Task 003: Cost taxonomy](tasks/003-cost-taxonomy.md)
- [ ] [Task 004: Components and evidence](tasks/004-components-and-evidence.md)
- [ ] [Task 005: Pilot dossiers](tasks/005-pilot-dossiers.md)
- [ ] [Task 006: JSON endpoint](tasks/006-json-endpoint.md)
- [ ] [Task 007: Markdown surfaces](tasks/007-markdown-surfaces.md)
- [ ] [Task 008: Discovery and LLM links](tasks/008-discovery-and-llm-links.md)
- [ ] [Task 009: Agent evaluation](tasks/009-agent-evaluation.md)
- [ ] [Task 010: Legacy detail cleanup decision](tasks/010-legacy-detail-cleanup-decision.md)

## Checkpoints

- [ ] After Tasks 001-004: public types and builder exist, no public endpoint yet, tests cover representative rows.
- [ ] After Tasks 005-007: pilot rows are exposed through JSON and markdown.
- [ ] After Tasks 008-009: discovery surfaces point agents to the new layer and evaluation questions pass.
- [ ] After Task 010: old detail surfaces have a documented keep/replace/deprecate decision.

## Open Questions

- Final dataset id: keep `estimate-details-agent-2026` or rename before implementation?
- Should per-row markdown pages be generated for every row immediately or only after pilot validation?
- Should `components` include source-only facts without money values?
