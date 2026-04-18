---
name: explorer-data
description: Используй для массового сравнения поселков через data/explorer.json, список и карту.
---

# explorer-data

## Когда использовать

- Когда нужен быстрый список поселков для массового анализа.
- Когда нужно сравнить рейтинг, тариф, координаты и базовые агрегаты без загрузки detail-страниц.
- Когда нужен discovery-слой перед переходом к конкретному поселку.

## Что открыть

- Основной URL: `/data/explorer.json`.
- Смотри прежде всего на `settlements[]`, `comparisons` и `stats`.
- Для перехода к detail-странице используй `settlements[].slug`.

## Поля, полезные для массового анализа

- `short_name`, `slug`, `rating`, `is_baseline`
- `location.lat`, `location.lng`, `location.district`
- `tariff.normalized_per_sotka_month`, `tariff.normalized_is_estimate`
- опциональные `rabstvo`, `management_company`
- `comparisons[slug]` для дельты тарифа относительно базового поселка Шелково

## Ограничения

- Это минимальный feed для списка и карты, а не полный слепок карточки поселка.
- В нем намеренно нет `sources`, `website`, `telegram`, полного `tariff`, полного `location`, `infrastructure`, `common_spaces`, `service_model`.
- Отсутствие поля обычно означает «неизвестно», а не «точно нет».

## Дальше

- Если нужен полный контекст по одному поселку, переходи на `/settlements/[slug]/`.
