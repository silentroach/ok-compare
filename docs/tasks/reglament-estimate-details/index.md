# Регламент: детализация маленьких PDF

## Цель

Сделать отдельный машиночитаемый слой `estimate-details-2026` для детальных смет из маленьких PDF: `cleaning`, `landscaping`, `improvement`, `lighting`, `security`, `waste`, `final`.

Этот слой нужен для LLM-ответов и контроля сумм: работы, материалы, машины, труд, подрядчики, связи с услугами полного регламента и сверка с агрегированной сметой.

## Контекст

- Используй скилл `context-engineering`
- Не использовать `full.pdf` для извлечения detail-данных.
- Маленькие PDF лежат в `apps/www/public/815/regulation/original/`, при доставании информации нужно быть предельно осторожными и аккуратными, стараться все перепроверять. В PDF нет изображений, никакой OCR не нужен.
- Текущая агрегированная смета: `apps/www/src/data/reglament/estimate-2026.ts`.
- Текущий слой полного регламента: `apps/www/src/data/reglament/full-2026.ts`.
- Текущие публичные поверхности: `apps/www/src/lib/reglament/routes.ts`, `discovery.ts`, `full-markdown.ts`, `llms.ts`.
- MVP: JSON + markdown для LLM, без HTML UI.
- Можешь подсматривать в /regulation/assets и связанные уже распаршенные данные для уточнения того, чего нет в твоих данных

## Структура Dataset-Файлов

- `apps/www/src/data/reglament/estimate-details-2026.ts` — только точка сборки `estimateDetails2026`.
- Общие helper-ы и metadata PDF держать в `apps/www/src/data/reglament/estimate-details-2026/shared.ts`.
- Секционные detail-данные держать в `apps/www/src/data/reglament/estimate-details-2026/{section}.ts`; новые задачи должны добавлять/расширять секционный модуль, а не наращивать сборочный файл.

## Правила Для Агентов

- Перед изменениями в `apps/www` прочитать `apps/www/AGENTS.md`.
- в тексте, который видит клиент не пиши на английском то, что можно написать на русском и для пользователя так было бы понятнее
- Не парсить PDF во время runtime или build страницы; извлекать вручную/скриптами и сохранять curated dataset.
- Все факты должны иметь `source_refs` с PDF, страницей и фрагментом.
- Если строка неоднозначна, не угадывать: помечать `needs_check` и писать причину.
- Если есть расхождения или неясности - по окончании выдай мне нумерованный список того, что и где нужно перепроверить - я глазами проверю в документе
- После выполнения задачи отметить чекбокс здесь и обновить `Status` в task-файле.
- Сделать коммит с номером таска и его кратким описанием
- Если в ходе выполнения задачи нашлась информация, которой нет здесь или в задаче - добавь информацию в `extra.md`, а при старте вычитывай ее.

## Целевые Публичные Поверхности

- `/815/regulation/data/estimate-details-2026.json`
- `/815/regulation/details.md`
- `/815/regulation/details/materials.md`
- `/815/regulation/details/machines.md`
- `/815/regulation/details/labor.md`
- `/815/regulation/details/checks.md`

## Чеклист Задач

- [x] [Task 001: Detail schema](tasks/001-detail-schema.md)
- [x] [Task 002: Dataset scaffold](tasks/002-dataset-scaffold.md)
- [x] [Task 003: JSON endpoint](tasks/003-json-endpoint.md)
- [x] [Task 004: Markdown companions](tasks/004-markdown-companions.md)
- [x] [Task 005: Discovery and LLM links](tasks/005-discovery-llm-links.md)
- [x] [Task 006: Dataset tests](tasks/006-dataset-tests.md)
- [x] [Task 007: Waste details](tasks/016-waste-details.md)
- [x] [Task 008: Security details](tasks/015-security-details.md)
- [x] [Task 009: Lighting details](tasks/014-lighting-details.md)
- [x] [Task 010: Landscaping details](tasks/012-landscaping-details.md)
- [x] [Task 011: Improvement details](tasks/013-improvement-details.md)
- [x] [Task 012: Cleaning winter mechanized](tasks/007-cleaning-winter-mechanized.md)
- [x] [Task 013: Cleaning winter manual](tasks/008-cleaning-winter-manual.md)
- [x] [Task 014: Cleaning summer mechanized](tasks/009-cleaning-summer-mechanized.md)
- [x] [Task 015: Cleaning summer manual](tasks/010-cleaning-summer-manual.md)
- [x] [Task 016: Cleaning resource statement](tasks/011-cleaning-resource-statement.md)
- [x] [Task 017: Final PDF controls](tasks/017-final-pdf-controls.md)
- [x] [Task 018: Final agent review](tasks/018-final-agent-review.md)
- [x] [Task 019: Structured source quote items](tasks/019-structured-source-quote-items.md)
- [x] [Task 020: Cleaning quote item table fields](tasks/020-cleaning-quote-item-table-fields.md)
- [x] [Task 021: Landscaping quote item table fields](tasks/021-landscaping-quote-item-table-fields.md)
- [x] [Task 022: Improvement quote item table fields](tasks/022-improvement-quote-item-table-fields.md)
- [x] [Task 023: Lighting quote item table fields](tasks/023-lighting-quote-item-table-fields.md)
- [ ] [Task 024: Security quote item table fields](tasks/024-security-quote-item-table-fields.md)
- [ ] [Task 025: Waste quote item table fields](tasks/025-waste-quote-item-table-fields.md)
- [ ] [Task 026: Quote item public contract cleanup](tasks/026-quote-item-public-contract-cleanup.md)

## Checkpoints

- [x] After Tasks 001-006: empty dataset, endpoints and tests exist.
- [x] After Tasks 007-011: `cleaning.pdf` is fully represented and reconciled.
- [x] After Tasks 012-016: all small section PDFs have detail resources.
- [x] After Tasks 017-018: final controls, LLM docs and review are complete.
- [ ] After Tasks 020-025: structured quote items include source table units, quantities, unit prices and totals where the PDF rows expose them.
- [ ] After Task 026: public quote item output excludes fields that are only useful for curation/debugging.

## Open Questions

- Should detail markdown be one big file plus topical slices, or only topical slices linked from `details.md`?
- Should resource IDs include PDF row numbers, or only semantic names?
- What tolerance is acceptable for source rounding: `0.01`, `1`, or row-specific?
