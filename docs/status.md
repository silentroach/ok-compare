# Status Section Content Rules

Этот файл фиксирует стартовые редакционные и discovery-правила status-section в `apps/www`.

## Data Location

- incidents: `apps/www/src/data/status/incidents/**`

## Routing Model

- home: `/status/`
- service page: `/status/[service]/`
- incident page: `/status/incidents/YYYY/MM/[entry]/`
- main feed: `/status/data/status.json`

## Source File Rules

1. Один markdown-файл описывает одно конкретное событие.
   Новый outage, новое ограничение или новая maintenance window должны получать отдельный entry, а не переписывать старый incident под новый смысл.

2. `started_at` обязателен, `ended_at` опционален.
   Активность записи и derive-статусы сервисов считаются автоматически из этих timestamp-полей.

3. `kind` должен явно отличать аварийную и плановую природу записи.
   Используются только `incident` и `maintenance`.

4. `areas` опускается только когда запись относится ко всему поселку.
   Если массив не указан, feed нормализует событие как `applies_to_all_areas: true`.

5. `source_url` нужно добавлять всегда, когда есть стабильный первоисточник.
   Это может быть Telegram, официальный пост, объявление управляющей компании или другой публичный источник.

6. Текст body должен описывать одно событие и не смешивать разные инциденты.
   Если позже случилось новое отключение после восстановления, это уже новая запись, а не правка старой истории.
