# Контекст реализации калькулятора тарифа

- Task 1 закрыта: `apps/www/src/lib/reglament/routes.ts` и `schema.ts` существуют.
- Task 2 закрыта: baseline-данные лежат в `apps/www/src/data/reglament/estimate-2026.ts`, тесты в `apps/www/src/data/reglament/estimate-2026.test.ts`.
- Task 3 закрыта: чистый расчетный движок лежит в `apps/www/src/lib/reglament/calculate.ts`, тесты в `apps/www/src/lib/reglament/calculate.test.ts`.
- Task 4 закрыта: discovery-слой лежит в `apps/www/src/lib/reglament/discovery.ts`, markdown/llms helpers в `markdown.ts` и `llms.ts`, public routes в `apps/www/src/pages/reglament/**`.
- `calculateEstimate(estimate, { rows })` возвращает totals, section totals, rows, deltas и breakdown без DOM/Astro; неизвестные row id в changes бросают ошибку.
- `/reglament/data/estimate-2026.json` отдает baseline, formulas, source refs с `pdf_path`, sections/rows и computed values; `/reglament/.well-known/api-catalog`, schema, OpenAPI, `llms.txt`, `llms-full.txt` и `index.md` уже есть.
- Root discovery и root llms/index.md уже знают про `/reglament/`.
- Task 5 закрыта: `apps/www/src/pages/reglament/index.astro` рендерит статический каркас `/reglament/` на `BaseLayout` с meta, baseline-итогами, ссылками на agent data и отдельными секционными таблицами.
- Task 6 закрыта: интерактивность реализована одним vanilla TypeScript controller в `apps/www/src/lib/reglament/calculator-controller.ts`; `/reglament/` рендерит basic controls через `data-reglament-*`, без framework islands, baseline остается читаемым без JS.
- Task 7 закрыта: каждая строка `/reglament/` получила native `details/summary` с годовой суммой, breakdown, source refs и expert inputs; controller обновляет `data-reglament-row-annual` и `data-reglament-row-breakdown` при пересчете.
- Basic editable fields формируются по наличию baseline `base`/`frequency`/`price`: volume, frequency, rate, fixed annual price и enabled; expert поля выводятся только внутри раскрытия строки, не в основных колонках таблицы.
- Future UI note: заменить пользовательскую единицу `₽/сотка/мес` на короткую `₽/сотка`; подразумевается месячный тариф.
- Future source note: не показывать пользователю пути/названия PDF как основной источник; лучше убирать их из UI или заменять на понятные секции регламента.
- Future table note: колонка или инпут `Годовая стоимость` в основном виде, вероятно, не нужны; если годовую стоимость оставить, не делать ее редактируемой.
- Browser check Task 6: на `astro preview` изменение `lighting-electricity.fixed_price` с `1 473 084` до `1 573 084` дало общий тариф `902,48 ₽/сотка/мес`, delta строки `+0,41 ₽`, reset вернул `902,07 ₽/сотка/мес`.
- Browser check Task 7: на `astro preview` фокус на `summary` + Enter открывает раскрытие; изменение `waste-transfer-from-homes.primary_salary` до `3 000 000` обновило годовую сумму строки до `11 769 172,11 ₽/год` и breakdown `primary_salary` до `3 000 000 ₽`.
- Официальный baseline хранит `221 264 198 ₽/год` и `902,07 ₽/сотка/мес`; расчет сохраняет эти значения через baseline + delta, потому что прямой расчет `221264198 / 20440.54 / 12` стандартным округлением дает `902,06`, а сумма тарифов секций из `final.pdf` дает `902,07`.
- В `improvement-road-surface-repair` оставлен source note: в `final.pdf` строка называется ремонтом покрытия дорог/площадок, а в детализации ближайшая крупная ремонтная строка - замена поврежденных элементов периметрального ограждения. Это стоит перепроверить при финальной сверке.
