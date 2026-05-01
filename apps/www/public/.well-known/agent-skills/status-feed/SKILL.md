---
name: status-feed
description: Используй для чтения status-section через status.json и перехода к service pages или к опубликованным incident pages.
---

# status-feed

## Когда использовать

- Когда нужно текущее состояние электричества, воды или дамбы.
- Когда нужно прочитать историю инцидентов и плановых работ в structured виде.
- Когда нужен derive-статус сервиса и ссылки на одну конкретную incident page, если она опубликована.

## Что открыть

- Основной JSON feed: `/status/data/status.json`.
- Короткий обзор: `/status/llms.txt`.
- Расширенный обзор: `/status/llms-full.txt`.
- API catalog: `/status/.well-known/api-catalog`.

## Практический паттерн

- Сначала читай `/status/data/status.json`.
- Для одной линии переходи на `/status/[service]/` или `/status/[service]/index.md`.
- Для одной записи переходи на `/status/incidents/YYYY/MM/[entry]/` или `/status/incidents/YYYY/MM/[entry]/index.md`, только если в feed есть `html_url` или `markdown_url`.

## Что важно в feed

- У incident-записей `html_url` и `markdown_url` опциональны: они есть только если для записи сгенерирована detail page.

## Что важно помнить

- `service_status` derive-ится из активных записей, а не задается вручную.
- Если `areas` не указаны в source file, feed трактует запись как относящуюся ко всем частям поселка.

## Ограничения

- Feed read-only и отражает состояние на момент сборки сайта.
- Для ссылок на первоисточник и редакционный контекст по одному событию лучше переходить на detail page записи.
