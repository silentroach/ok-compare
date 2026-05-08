---
name: explorer-data
description: Используй для чтения полного feed поселков через data/settlements.json; explorer.json нужен только для облегченного списка и карты.
---

# explorer-data

## Когда использовать

- Когда нужен один структурированный источник со всеми подтвержденными данными по поселкам.
- Когда нужно сравнить рейтинг, тариф, инфраструктуру, сервисы и расстояния без загрузки detail-страниц.
- Когда нужен discovery-слой перед переходом к конкретному поселку.

## Что открыть

- Основной URL: `/data/settlements.json`.
- Смотри прежде всего на `settlements[]`, `comparisons` и `stats`.
- Для минимального payload и повторения логики главной есть `/data/explorer.json`.
- Для перехода к detail-странице используй `settlements[].slug`.

## Поля, полезные для массового анализа

- `short_name`, `slug`, `website`, `telegram`, `management_company`, `rating`, `is_baseline`
- полный `location` и полный `tariff`
- `infrastructure`, `common_spaces`, `service_model`, `distance.moscow_km`, `distance.mkad_km`, `distance.shelkovo_km`
- `stats` для общих тарифных агрегатов и peer-медианы внутри рейтинговой группы Шелково
- `comparisons[slug]` для дельты тарифа относительно базового поселка Шелково

## Ограничения

- Это полный structured feed, но не замена HTML- или Markdown-странице как человекочитаемому представлению.
- `data/explorer.json` остается отдельным минимальным feed для списка и карты.
- Список `sources` не входит в общий feed и остается на detail-странице поселка.
- Отсутствие поля обычно означает «неизвестно», а не «точно нет».

## Дальше

- Если нужен page URL или человекочитаемый контекст по одному поселку, переходи на `/settlements/[slug]/`.
