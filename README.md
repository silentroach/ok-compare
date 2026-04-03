# Shelkovo Compare

Статический микролендинг для сравнения тарифов на обслуживание коттеджного посёлка Шелково с другими посёлками в округе.

## Описание

Проект для сравнения тарифов на обслуживание между коттеджными посёлками в округе. Визуальное представление данных для объективной оценки.

## Технологический стек

- **Фреймворк**: Astro (static output)
- **UI-компоненты**: Svelte 5
- **Стили**: Tailwind CSS
- **Данные**: YAML + Astro Content Collections
- **Валидация**: Zod (встроенный в Astro)
- **Карта**: Яндекс JS API v3
- **Язык**: Русский

## Структура данных Settlement

Каждый поселок описывается в отдельном YAML-файле в директории `src/data/settlements/`.

### Полная схема данных

```yaml
# Основная информация
name: "Коттеджный поселок Шелково"     # Полное название
short_name: "Шелково"                   # Короткое название
slug: "shelkovo"                        # URL-friendly идентификатор
website: "https://shelkovo.ru"          # Официальный сайт
management_company: "УК Шелково"        # Управляющая компания
is_baseline: true                       # true для базового поселка (Шелково)

# Локация
location:
  address_text: "Московская область, Мытищинский район, д. Шелково"
  lat: 56.0500                          # Широта
  lng: 37.6000                          # Долгота
  district: "Мытищинский район"         # Район
  area: "Мытищинский округ"             # Округ

# Расстояние от Шелково
distance_from_shelkovo_km: 0            # км от базового поселка

# Тариф
tariff:
  value: 4500                           # Стоимость
  unit: "rub_per_sotka"                 # Единица: rub_per_sotka | rub_per_lot | rub_fixed
  period: "month"                       # Период: month | quarter | year
  normalized_per_sotka_month: 4500      # Нормализовано к руб/сотка/месяц
  note: "Тариф за сотку в месяц"        # Примечание

# Статус поселка
settlement_status: "complete"           # under_construction | partially_complete | mostly_complete | complete

# Инфраструктура (yes | no | partial - не указано = неизвестно)
infrastructure:
  # Тип дорог (asphalt > partial_asphalt > gravel > dirt)
  roads: "partial_asphalt"
  sidewalks: "no"
  lighting: "yes"
  gas: "yes"
  water: "yes"                      # Центральное водоснабжение
  sewage: "no"                      # Центральная канализация
  # Ливневка (closed > open > none)
  drainage: "open"
  checkpoints: "yes"
  security: "yes"
  fencing: "yes"                    # Закрытая территория
  # Видеонаблюдение (full > checkpoint_only > none)
  video_surveillance: "checkpoint_only"
  # Подземная электросеть (full > partial > none)
  underground_electricity: "partial"
  playgrounds: "yes"
  sports: "yes"
  public_spaces: "yes"
  beach_or_water_access: "yes"
  admin_building: "no"
  retail_or_services: "no"          # Магазины

# Сервисная модель (yes | no | partial - не указано = неизвестно)
service_model:
  garbage_collection: "yes"
  snow_removal: "yes"
  road_cleaning: "yes"
  landscaping: "yes"
  emergency_service: "yes"
  dispatcher: "yes"

# Обещания vs Факт
promises_vs_fact:
  promised: ["Круглосуточная охрана", "Видеонаблюдение"]
  actual: ["Охрана до 22:00", "Видеонаблюдение частичное"]
  notes: "Часть обещаний не выполнена полностью"

# Прозрачность
transparency:
  has_public_tariff: true
  has_website: true
  has_phone: true
  has_management_info: true
  notes: ""

# Источники данных
sources:
  - title: "Официальный сайт Шелково"
    url: "https://shelkovo.ru"
    type: "official"                    # official | community | media | personal
    date_checked: "2026-04-03"
    comment: "Текущий тариф"

# Заметки для сравнения
comparison_notes: ["Наш поселок для сравнения"]
```

### Enum значения

**AvailabilityStatus** (для инфраструктуры и сервисов):
- `yes` — есть
- `no` — нет
- `partial` — частично
- Не указано — неизвестно

**RoadType** (тип дорог, упорядочен от лучшего к худшему):
- `asphalt` — асфальт
- `partial_asphalt` — частично асфальт
- `gravel` — асфальтная крошка/гравий
- `dirt` — грунтовка

**DrainageType** (ливневая канализация, упорядочена от лучшей к худшей):
- `closed` — закрытая
- `open` — открытая
- `none` — отсутствует

**VideoSurveillance** (видеонаблюдение, упорядочено от лучшего к худшему):
- `full` — есть по всему периметру
- `checkpoint_only` — только на КПП
- `none` — отсутствует

**UndergroundElectricity** (подземная электросеть, упорядочено от лучшего к худшему):
- `full` — полностью подземная
- `partial` — частично подземная
- `none` — только по столбам

**SettlementStatus** (статус поселка):
- `under_construction` — строится
- `partially_complete` — частично построен
- `mostly_complete` — в основном построен
- `complete` — полностью построен
- Не указано — неизвестно

**TariffUnit** (единица тарифа):
- `rub_per_sotka` — рубли за сотку
- `rub_per_lot` — рубли за участок
- `rub_fixed` — фиксированная сумма

**TariffPeriod** (период тарифа):
- `month` — в месяц
- `quarter` — в квартал
- `year` — в год

**SourceType** (тип источника):
- `official` — официальный (сайт УК, документы)
- `community` — сообщество (чаты, форумы)
- `media` — СМИ
- `personal` — личные наблюдения

## Команды

```bash
# Запуск dev-сервера
npm run dev

# Сборка
npm run build

# Превью сборки
npm run preview

# Проверка типов
npm run typecheck

# Запуск тестов
npm run test

# Тесты в watch-режиме
npm run test:watch
```

## Добавление нового поселка

1. Скопируйте `src/data/settlements/_template.yaml`
2. Переименуйте файл в `{slug}.yaml`
3. Заполните все поля
4. Убедитесь, что `slug` уникален
5. Запустите `npm run typecheck` для проверки

## Деплой

Сборка производится командой `npm run build`. Результат находится в директории `dist/`. Для данного проекта используется base path `/compare`, поэтому файлы нужно разместить в соответствующей директории на хостинге.

## Лицензия

Приватный проект.
