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

## Где хранится мета-контекст проекта

- Базовый контекст и предметная область задаются в данных поселков: `src/data/settlements/*.yaml`.
- SEO-метаданные страниц задаются в `src/layouts/BaseLayout.astro` и в пропсах страниц (`src/pages/**/*.astro`).

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

# Тариф
tariff:
  value: 4500                           # Стоимость
  unit: "rub_per_sotka"                 # Единица: rub_per_sotka | rub_per_lot | rub_fixed
  period: "month"                       # Период: month | quarter | year
  normalized_per_sotka_month: 4500      # Нормализовано к руб/сотка/месяц
  note: "Тариф за сотку в месяц"        # Примечание

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
pnpm dev

# Сборка
pnpm build

# Превью сборки
pnpm preview

# Проверка типов
pnpm typecheck

# Запуск тестов
pnpm test

# Тесты в watch-режиме
pnpm test:watch
```

## Добавление нового поселка

1. Скопируйте `src/data/settlements/_template.yaml`
2. Переименуйте файл в `{slug}.yaml`
3. Заполните все поля
4. Убедитесь, что `slug` уникален
5. Запустите `pnpm typecheck` для проверки

## Деплой

Сборка производится командой `pnpm build`. Результат находится в директории `dist/`. Для данного проекта используется base path `/ok-compare`, поэтому файлы нужно разместить в соответствующей директории на хостинге.

## Правила развития дизайн-системы

### Как добавлять новый цвет или state

1. Добавляйте токен в `src/styles/global.css` в `@theme` с семантическим именем (`--color-*`).
2. Для status-состояний добавляйте полный набор: `--color-<state>`, `--color-<state>-soft`, `--color-<state>-border`, `--color-<state>-text`.
3. Используйте semantic utility-классы (`text-foreground`, `bg-muted-soft`, `border-border`) или готовые `ui-*` примитивы.
4. Не добавляйте raw palette-классы (`text-slate-*`, `bg-gray-*`, `text-sky-*`) в `src/pages/**` и `src/components/**`.

### Когда использовать `ui-*` примитивы

- Используйте `ui-*`, если паттерн повторяется минимум в двух местах (кнопки, бэйджи, таблицы, карточки, пиллы, икон-кнопки).
- Используйте локальный Tailwind-класс, если стиль уникален для конкретного блока и не является reusable компонентом.
- Если локальный стиль начал повторяться, переносите его в `src/styles/global.css` как новый `ui-*` примитив.

### Когда допустимы arbitrary values

Arbitrary values допустимы только в одном из случаев:

1. Декоративные эффекты, которые нельзя выразить стандартными semantic utility (`mask-image`, сложные `radial/linear-gradient`, точечные `text-shadow`).
2. Точное позиционирование для визуального слоя (например, hero bleed/overlay).
3. Интеграционные ограничения внешних виджетов (например, map overlay).

Во всех остальных случаях используйте токены и semantic utility-классы.

### Зафиксированные исключения

- `src/pages/settlements/[slug].astro`: hero overlays/gradients, `text-shadow`, backdrop blur и декоративный подъем секции.
- `src/components/KPIStats.svelte`: точечные glass-эффекты и тени для embed-режима карточек.
- `src/components/SettlementMap.svelte`: слой-перехватчик поверх неинтерактивной карты (`z-[5]`).
- `src/components/SettlementCard.svelte`: фиксированный spacer `h-[24px]` для выравнивания карточек baseline/не-baseline.

### QA-чеклист перед merge

1. `pnpm typecheck` — без ошибок.
2. `pnpm test` — все тесты green.
3. Ручной smoke по брейкпоинтам: `<=767`, `768-1023`, `>=1024` на страницах главная, карточки, фильтры/карта, страница посёлка, 404.

## Лицензия

Приватный проект.
