# Контекст реализации калькулятора тарифа

- Task 1 закрыта: `apps/www/src/lib/reglament/routes.ts` и `schema.ts` существуют.
- Task 2 закрыта: baseline-данные лежат в `apps/www/src/data/reglament/estimate-2026.ts`, тесты в `apps/www/src/data/reglament/estimate-2026.test.ts`.
- Task 3 закрыта: чистый расчетный движок лежит в `apps/www/src/lib/reglament/calculate.ts`, тесты в `apps/www/src/lib/reglament/calculate.test.ts`.
- `calculateEstimate(estimate, { rows })` возвращает totals, section totals, rows, deltas и breakdown без DOM/Astro; неизвестные row id в changes бросают ошибку.
- Официальный baseline хранит `221 264 198 ₽/год` и `902,07 ₽/сотка/мес`; расчет сохраняет эти значения через baseline + delta, потому что прямой расчет `221264198 / 20440.54 / 12` стандартным округлением дает `902,06`, а сумма тарифов секций из `final.pdf` дает `902,07`.
- В `improvement-road-surface-repair` оставлен source note: в `final.pdf` строка называется ремонтом покрытия дорог/площадок, а в детализации ближайшая крупная ремонтная строка - замена поврежденных элементов периметрального ограждения. Это стоит перепроверить при финальной сверке.
