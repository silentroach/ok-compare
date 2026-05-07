# Контекст реализации калькулятора тарифа

- Task 1 закрыта: `apps/www/src/lib/reglament/routes.ts` и `schema.ts` существуют.
- Task 2 закрыта: baseline-данные лежат в `apps/www/src/data/reglament/estimate-2026.ts`, тесты в `apps/www/src/data/reglament/estimate-2026.test.ts`.
- Task 3 закрыта: чистый расчетный движок лежит в `apps/www/src/lib/reglament/calculate.ts`, тесты в `apps/www/src/lib/reglament/calculate.test.ts`.
- Task 4 закрыта: discovery-слой лежит в `apps/www/src/lib/reglament/discovery.ts`, markdown/llms helpers в `markdown.ts` и `llms.ts`, public routes в `apps/www/src/pages/reglament/**`.
- `calculateEstimate(estimate, { rows })` возвращает totals, section totals, rows, deltas и breakdown без DOM/Astro; неизвестные row id в changes бросают ошибку.
- `/reglament/data/estimate-2026.json` отдает baseline, formulas, source refs с `pdf_path`, sections/rows и computed values; `/reglament/.well-known/api-catalog`, schema, OpenAPI, `llms.txt`, `llms-full.txt` и `index.md` уже есть.
- Root discovery и root llms/index.md уже знают про `/reglament/`.
- Task 5 закрыта: `apps/www/src/pages/reglament/index.astro` рендерит статический каркас `/reglament/` на `BaseLayout` с meta, baseline-итогами, ссылками на agent data и отдельными секционными таблицами; интерактивного JS еще нет.
- Официальный baseline хранит `221 264 198 ₽/год` и `902,07 ₽/сотка/мес`; расчет сохраняет эти значения через baseline + delta, потому что прямой расчет `221264198 / 20440.54 / 12` стандартным округлением дает `902,06`, а сумма тарифов секций из `final.pdf` дает `902,07`.
- В `improvement-road-surface-repair` оставлен source note: в `final.pdf` строка называется ремонтом покрытия дорог/площадок, а в детализации ближайшая крупная ремонтная строка - замена поврежденных элементов периметрального ограждения. Это стоит перепроверить при финальной сверке.
