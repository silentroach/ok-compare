# LLM dataset contract полного регламента

Рабочие входы этой задачи: извлеченные артефакты `020` - `060`.

PDF: `full`.

## Назначение

Этот документ задает стабильный contract будущего JSON/Markdown dataset для LLM. Dataset должен собираться из уже проверенных курируемых артефактов, а не через runtime-парсинг `full.pdf`.

## Общие правила

- Имена полей: `snake_case`.
- `id`: стабильный `lower-kebab-case`, без русских букв.
- Русские названия и цитаты из PDF сохраняются как текстовые значения.
- Все факты из PDF обязаны иметь `source_refs[]` минимум до `pdf`, `page`, `fragment`.
- В `source_refs[]` запрещены пути внутри репозитория; там должны быть только страницы, разделы, приложения, пункты и строки регламента.
- Если значение рассчитано из PDF, это нужно хранить явно через `derived_from_fact_ids[]` или `calculation_note`.
- Пустая ячейка PDF хранится как `null` + `status: "empty_cell"`; ее нельзя трактовать как подтвержденный ноль.
- OCR/визуальные сомнения хранятся в `verification_note` и, если это важно для публичного слоя, дублируются в `audit_notes[]`.

## Корневой объект

Имя будущего объекта: `full_reglament_dataset`.

| Поле                      | Тип                          | Обяз. | Описание                                                                                                            |
| ------------------------- | ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| `schema_version`          | string                       | да    | Версия контракта dataset, например `"1"`.                                                                           |
| `dataset_id`              | string                       | да    | Стабильный id dataset, например `"full-reglament-2026"`.                                                            |
| `title`                   | string                       | да    | Человекочитаемое название набора данных.                                                                            |
| `source_pdf`              | object                       | да    | `{ "pdf": "full", "title": "Полный регламент", "pages_total": 138 }`.                                               |
| `curation_sources`        | string[]                     | да    | Внутренний список задач-источников без путей в репозитории, например `"020-common-assets"`. Не является source ref. |
| `tariff_summary`          | object                       | да    | Контрольные итоговые значения сводной сметы.                                                                        |
| `villages`                | `Village[]`                  | да    | Характеристики поселков из Приложения №1.                                                                           |
| `common_assets`           | `CommonAsset[]`              | да    | Состав общего имущества из Приложения №2.                                                                           |
| `services`                | `Service[]`                  | да    | Каталог услуг и периодичности из Приложения №4.                                                                     |
| `service_to_estimate_map` | `ServiceToEstimateMapItem[]` | да    | Сопоставление услуг с текущей сметой.                                                                               |
| `calculation_assumptions` | `CalculationAssumption[]`    | да    | Расчетные допущения, влияющие на понимание тарифа.                                                                  |
| `audit_notes`             | `AuditNote[]`                | да    | Проверочные и спорные места.                                                                                        |

Пример:

```json
{
  "schema_version": "1",
  "dataset_id": "full-reglament-2026",
  "title": "Полный регламент содержания SHELKOVO, слой фактов для LLM",
  "source_pdf": {
    "pdf": "full",
    "title": "Полный регламент",
    "pages_total": 138
  },
  "curation_sources": [
    "020-common-assets",
    "030-service-catalog",
    "040-village-characteristics",
    "050-service-to-estimate-map",
    "060-calculation-assumptions"
  ],
  "tariff_summary": {
    "tariff_area_sotka": 20440.54,
    "total_annual_cost_rub": 221264198,
    "tariff_rub_per_sotka_month": 902.07,
    "source_refs": [
      {
        "pdf": "full",
        "page": 126,
        "fragment": "ИТОГО",
        "quote": "221 264 198 ... 902,07"
      }
    ]
  }
}
```

## `source_refs[]`

Общий тип: `SourceRef`.

| Поле       | Тип      | Обяз. | Описание                                                                                       |
| ---------- | -------- | ----- | ---------------------------------------------------------------------------------------------- |
| `pdf`      | `"full"` | да    | Идентификатор PDF-источника.                                                                   |
| `page`     | number   | да    | Страница PDF. Для диапазона нужно хранить несколько `SourceRef`, а не только строку диапазона. |
| `fragment` | string   | да    | Раздел, приложение, строка, пункт или таблица.                                                 |
| `quote`    | string   | нет   | Короткая цитата для проверки переноса.                                                         |
| `note`     | string   | нет   | Осторожное пояснение: OCR, визуальная сверка, расчетная природа значения.                      |

Примеры:

```json
[
  {
    "pdf": "full",
    "page": 127,
    "fragment": "Приложение №1 / строки 1.1-1.2 / SHELKOVO VILLAGE"
  },
  {
    "pdf": "full",
    "page": 135,
    "fragment": "Приложение №4 / Круглогодично / строка 1",
    "quote": "Организация контрольно-пропускного режима с привлечением ЧОП - Круглосуточно"
  }
]
```

## Общие value-типы

### `QuantityValue`

| Поле     | Тип            | Обяз. | Описание                                                                                                        |
| -------- | -------------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| `raw`    | string         | да    | Значение как в markdown/PDF, например `"13 160"` или `"-"`.                                                     |
| `value`  | number \| null | да    | Нормализованное число или `null`, если значения нет.                                                            |
| `status` | enum           | да    | `"present"`, `"empty_cell"`, `"sum_explicit_values"`, `"not_summed"`, `"group_row"`, `"requires_visual_check"`. |

### `RelatedFactId`

Связи между сущностями хранить строкой с namespace: `villages:shelkovo-village`, `services:summer-lawn-mowing`, `common_assets:roads-asphalt`, `estimate_rows:cleaning-winter-mechanized`, `audit_notes:sotka-vs-m2-unit`.

## `villages[]`

Тип: `Village`.

| Поле                      | Тип                     | Обяз. | Описание                                                   |
| ------------------------- | ----------------------- | ----- | ---------------------------------------------------------- |
| `id`                      | string                  | да    | Stable id поселка.                                         |
| `title`                   | string                  | да    | Название как в PDF.                                        |
| `households_count`        | number                  | да    | Количество домовладений.                                   |
| `land_area_sotka`         | number                  | да    | Площадь земельных участков в сотках.                       |
| `land_area_share_percent` | number                  | да    | Расчетная доля от `20 440,54` сотки.                       |
| `land_area_share_kind`    | `"calculated_from_pdf"` | да    | Явная пометка, что доля рассчитана, а не напечатана в PDF. |
| `source_refs`             | `SourceRef[]`           | да    | Ссылка на page 127.                                        |
| `verification_note`       | string \| null          | да    | Замечание по проверке.                                     |

Примеры:

```json
[
  {
    "id": "shelkovo-village",
    "title": "SHELKOVO VILLAGE",
    "households_count": 507,
    "land_area_sotka": 5031.42,
    "land_area_share_percent": 24.61,
    "land_area_share_kind": "calculated_from_pdf",
    "source_refs": [
      {
        "pdf": "full",
        "page": 127,
        "fragment": "Приложение №1 / строки 1.1-1.2 / SHELKOVO VILLAGE"
      }
    ],
    "verification_note": null
  },
  {
    "id": "shelkovo-park",
    "title": "SHELKOVO PARK",
    "households_count": 574,
    "land_area_sotka": 6015.9,
    "land_area_share_percent": 29.43,
    "land_area_share_kind": "calculated_from_pdf",
    "source_refs": [
      {
        "pdf": "full",
        "page": 127,
        "fragment": "Приложение №1 / строки 1.1-1.2 / SHELKOVO PARK"
      }
    ],
    "verification_note": null
  }
]
```

## `common_assets[]`

Тип: `CommonAsset`.

| Поле                | Тип             | Обяз. | Описание                                                                                                  |
| ------------------- | --------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `id`                | string          | да    | Stable id объекта.                                                                                        |
| `category`          | enum            | да    | `"roads"`, `"stormwater"`, `"greenery"`, `"forest"`, `"improvement"`, `"electricity"`, `"security"`.      |
| `title`             | string          | да    | Название объекта как в таблице PDF/markdown.                                                              |
| `unit`              | string \| null  | да    | Единица измерения как в PDF; `null`, если не указана.                                                     |
| `values_by_village` | object          | да    | Ключи `shelkovo-village`, `shelkovo-forest`, `shelkovo-park`, `shelkovo-river`, значения `QuantityValue`. |
| `total`             | `QuantityValue` | да    | Итог по явно заполненным значениям или `not_summed`.                                                      |
| `total_mode`        | enum            | да    | `"sum_explicit_values"`, `"not_summed"`, `"empty"`, `"group_row"`.                                        |
| `source_refs`       | `SourceRef[]`   | да    | Ссылка на Приложение №2, pages 128-130.                                                                   |
| `verification_note` | string \| null  | да    | Например `пустые ячейки в PDF` или `требует визуальной сверки`.                                           |

Примеры:

```json
[
  {
    "id": "roads-asphalt",
    "category": "roads",
    "title": "Дороги (асфальт)",
    "unit": "м²",
    "values_by_village": {
      "shelkovo-village": { "raw": "4785", "value": 4785, "status": "present" },
      "shelkovo-forest": { "raw": "2750", "value": 2750, "status": "present" },
      "shelkovo-park": { "raw": "5000", "value": 5000, "status": "present" },
      "shelkovo-river": { "raw": "625", "value": 625, "status": "present" }
    },
    "total": {
      "raw": "13 160",
      "value": 13160,
      "status": "sum_explicit_values"
    },
    "total_mode": "sum_explicit_values",
    "source_refs": [
      {
        "pdf": "full",
        "page": 128,
        "fragment": "Приложение №2 / Дороги и тротуары / строка 1"
      }
    ],
    "verification_note": null
  },
  {
    "id": "improvement-playground-rubber",
    "category": "improvement",
    "title": "Детская площадка на резиновом основании",
    "unit": "м²",
    "values_by_village": {
      "shelkovo-village": { "raw": "-", "value": null, "status": "empty_cell" },
      "shelkovo-forest": { "raw": "-", "value": null, "status": "empty_cell" },
      "shelkovo-park": { "raw": "-", "value": null, "status": "empty_cell" },
      "shelkovo-river": { "raw": "-", "value": null, "status": "empty_cell" }
    },
    "total": { "raw": "-", "value": null, "status": "empty_cell" },
    "total_mode": "empty",
    "source_refs": [
      {
        "pdf": "full",
        "page": 128,
        "fragment": "Приложение №2 / Объекты благоустройства / строка 1",
        "note": "Все значения пустые в PDF; требуется визуальная сверка."
      }
    ],
    "verification_note": "требует визуальной сверки: все значения пустые в PDF"
  }
]
```

## `services[]`

Тип: `Service`.

| Поле             | Тип            | Обяз. | Описание                                                                           |
| ---------------- | -------------- | ----- | ---------------------------------------------------------------------------------- |
| `id`             | string         | да    | Stable id услуги из `030-service-catalog.md`.                                      |
| `group`          | enum           | да    | `"year_round"`, `"winter_period"`, `"summer_period"`.                              |
| `title`          | string         | да    | Услуга как в Приложении №4.                                                        |
| `frequency_raw`  | string         | да    | Периодичность как в PDF.                                                           |
| `frequency_note` | string \| null | да    | Осторожное пояснение, если периодичность нельзя машинно сравнить с годовой сметой. |
| `source_refs`    | `SourceRef[]`  | да    | Ссылка на page 135.                                                                |
| `quote`          | string         | нет   | Строка источника.                                                                  |

Примеры:

```json
[
  {
    "id": "year-round-access-control",
    "group": "year_round",
    "title": "Организация контрольно-пропускного режима с привлечением ЧОП",
    "frequency_raw": "Круглосуточно",
    "frequency_note": null,
    "source_refs": [
      {
        "pdf": "full",
        "page": 135,
        "fragment": "Приложение №4 / Круглогодично / строка 1",
        "quote": "Организация контрольно-пропускного режима с привлечением ЧОП - Круглосуточно"
      }
    ],
    "quote": "Организация контрольно-пропускного режима с привлечением ЧОП - Круглосуточно"
  },
  {
    "id": "summer-lawn-mowing",
    "group": "summer_period",
    "title": "Покос газонов в местах общего пользования",
    "frequency_raw": "15 раз в летний период",
    "frequency_note": "В смете периодичность может быть свернута в годовую кратность.",
    "source_refs": [
      {
        "pdf": "full",
        "page": 135,
        "fragment": "Приложение №4 / В летний период / строка 5",
        "quote": "Покос газонов в местах общего пользования - 15 раз в летний период"
      }
    ],
    "quote": "Покос газонов в местах общего пользования - 15 раз в летний период"
  }
]
```

## `service_to_estimate_map[]`

Тип: `ServiceToEstimateMapItem`.

Статусы из markdown нормализуются так:

| Markdown           | Machine enum     |
| ------------------ | ---------------- |
| `явно найдено`     | `explicit_found` |
| `частично`         | `partial`        |
| `не найдено`       | `not_found`      |
| `требует проверки` | `needs_check`    |

| Поле                   | Тип            | Обяз. | Описание                                                               |
| ---------------------- | -------------- | ----- | ---------------------------------------------------------------------- |
| `service_id`           | string         | да    | Ссылка на `services[].id`.                                             |
| `status`               | enum           | да    | `"explicit_found"`, `"partial"`, `"not_found"`, `"needs_check"`.       |
| `status_label_ru`      | string         | да    | Исходная русская формулировка статуса.                                 |
| `estimate_section_ids` | string[]       | да    | Id секций сметы из `estimate-2026.ts`; пустой массив, если не найдено. |
| `estimate_row_ids`     | string[]       | да    | Id строк сметы; пустой массив, если не найдено.                        |
| `source_refs`          | `SourceRef[]`  | да    | Ссылки на услугу и найденные строки сводной сметы в `full.pdf`.        |
| `estimate_source_refs` | `SourceRef[]`  | да    | Только ссылки на смету pages 125-126; пустой массив, если не найдено.  |
| `explanation`          | string         | да    | Осторожное пояснение сопоставления.                                    |
| `verification_note`    | string \| null | да    | Что нужно проверить отдельно.                                          |

Примеры:

```json
[
  {
    "service_id": "year-round-access-control",
    "status": "explicit_found",
    "status_label_ru": "явно найдено",
    "estimate_section_ids": ["security"],
    "estimate_row_ids": ["security-access-control"],
    "source_refs": [
      {
        "pdf": "full",
        "page": 135,
        "fragment": "Приложение №4 / Круглогодично / строка 1"
      },
      {
        "pdf": "full",
        "page": 126,
        "fragment": "Сводная смета / строка 5.1"
      }
    ],
    "estimate_source_refs": [
      {
        "pdf": "full",
        "page": 126,
        "fragment": "Сводная смета / строка 5.1"
      }
    ],
    "explanation": "В смете есть строка круглосуточного пропускного режима; смысл услуги совпадает с КПП/ЧОП.",
    "verification_note": null
  },
  {
    "service_id": "year-round-gas-pipeline-maintenance",
    "status": "not_found",
    "status_label_ru": "не найдено",
    "estimate_section_ids": [],
    "estimate_row_ids": [],
    "source_refs": [
      {
        "pdf": "full",
        "page": 135,
        "fragment": "Приложение №4 / Круглогодично / строка 8"
      }
    ],
    "estimate_source_refs": [],
    "explanation": "В текущей смете нет секции или строки по газопроводу.",
    "verification_note": "нужно сверить с первичными документами после ввода газопровода в эксплуатацию"
  }
]
```

## `calculation_assumptions[]`

Тип: `CalculationAssumption`.

В этот массив попадают методические допущения, которые описывают принцип расчета. Проверочные расхождения лучше хранить в `audit_notes[]`.

| Поле               | Тип           | Обяз. | Описание                                                  |
| ------------------ | ------------- | ----- | --------------------------------------------------------- |
| `id`               | string        | да    | Stable id допущения.                                      |
| `title`            | string        | да    | Короткое название.                                        |
| `summary`          | string        | да    | Что именно предполагает расчет.                           |
| `status_label_ru`  | string        | да    | Осторожный публичный статус, например `требует проверки`. |
| `why_important`    | string        | да    | Почему это влияет на понимание тарифа.                    |
| `how_to_verify`    | string        | да    | Какие первичные данные нужны для проверки.                |
| `related_fact_ids` | string[]      | да    | Связанные сущности dataset.                               |
| `source_refs`      | `SourceRef[]` | да    | Страницы и пункты PDF.                                    |
| `quotes`           | string[]      | да    | Короткие цитаты источника.                                |

Минимальный набор по `060`: `single-tariff-four-villages`, `area-based-allocation`, `normative-and-expert-method`, `overhead-70-percent-fot`, `profit-40-percent-fot`.

Примеры:

```json
[
  {
    "id": "area-based-allocation",
    "title": "Распределение платы по площади участка",
    "summary": "Стоимость содержания общего имущества распределяется пропорционально площади участка; калькуляционная единица - 1 сотка.",
    "status_label_ru": "важно явно объяснять",
    "why_important": "От знаменателя 20 440,54 сотки зависит сумма за 1 сотку в месяц.",
    "how_to_verify": "Сверить реестр участков, площадь каждого участка и агрегаты Приложения №1 с первичными земельными данными.",
    "related_fact_ids": [
      "villages:shelkovo-village",
      "villages:shelkovo-forest",
      "villages:shelkovo-park",
      "villages:shelkovo-river"
    ],
    "source_refs": [
      {
        "pdf": "full",
        "page": 5,
        "fragment": "пп. 3.1-3.2",
        "quote": "пропорционально доле площади земельного участка собственника"
      },
      {
        "pdf": "full",
        "page": 127,
        "fragment": "Приложение №1 / строки 1.1-1.2"
      }
    ],
    "quotes": [
      "пропорционально доле площади земельного участка собственника в общей площади земельных участков всех собственников",
      "Калькуляционной единицей платы за Услуги является 1 сотка"
    ]
  },
  {
    "id": "overhead-70-percent-fot",
    "title": "ОЭР 70% от ФОТ",
    "summary": "Общеэксплуатационные расходы начисляются как 70% от ФОТ основных рабочих и машинистов.",
    "status_label_ru": "требует проверки применения по строкам",
    "why_important": "Для трудоемких услуг это крупный множитель поверх прямых затрат.",
    "how_to_verify": "По каждой строке с трудом пересчитывать 0,70 × (ФОТ основных рабочих + ФОТ машинистов).",
    "related_fact_ids": ["estimate_rows:cleaning"],
    "source_refs": [
      {
        "pdf": "full",
        "page": 9,
        "fragment": "п. 4.12"
      },
      {
        "pdf": "full",
        "page": 123,
        "fragment": "общая калькуляция / строка 0260"
      }
    ],
    "quotes": [
      "установлено значение норматива на уровне 70% от планируемых расходов на оплату труда"
    ]
  }
]
```

## `audit_notes[]`

Тип: `AuditNote`.

В этот массив попадают проверки качества данных, конфликтующие сопоставления и спорные расчетные места. Это не юридические выводы.

| Поле               | Тип           | Обяз. | Описание                                                                                |
| ------------------ | ------------- | ----- | --------------------------------------------------------------------------------------- |
| `id`               | string        | да    | Stable id заметки.                                                                      |
| `category`         | enum          | да    | `"data_quality"`, `"estimate_mapping"`, `"calculation_check"`, `"source_verification"`. |
| `title`            | string        | да    | Короткое название проверки.                                                             |
| `summary`          | string        | да    | Что требует внимания.                                                                   |
| `public_wording`   | string        | да    | Осторожная формулировка для будущего публичного слоя.                                   |
| `severity`         | enum          | да    | `"info"`, `"watch"`, `"needs_check"`.                                                   |
| `related_fact_ids` | string[]      | да    | Сущности, которых касается заметка.                                                     |
| `source_refs`      | `SourceRef[]` | да    | Страницы PDF.                                                                           |
| `next_step`        | string        | да    | Что делать при проверке.                                                                |

Минимальный набор по `020-060`: `empty-cells-not-zero`, `sotka-vs-m2-unit`, `waste-temporary-residence-0-5`, `perimeter-fence-estimate-conflict`, `service-frequency-vs-estimate-annualization`, `office-reception-not-found`, `gas-pipeline-not-found`, `common-bins-cleaning-not-found`, `snow-removal-outside-not-found`.

Примеры:

```json
[
  {
    "id": "sotka-vs-m2-unit",
    "category": "calculation_check",
    "title": "Единицы формулы: м² против соток",
    "summary": "Формула описывает общую площадь как м², но сводная смета считает тариф за 1 сотку.",
    "public_wording": "требует проверки единиц",
    "severity": "needs_check",
    "related_fact_ids": [
      "villages:shelkovo-village",
      "audit_notes:tariff-summary"
    ],
    "source_refs": [
      {
        "pdf": "full",
        "page": 6,
        "fragment": "п. 4.5",
        "quote": "Sобщ. уч ... м²"
      },
      {
        "pdf": "full",
        "page": 125,
        "fragment": "раздел 10 / тарифицируемая площадь",
        "quote": "20440,54 соток"
      }
    ],
    "next_step": "Сверить рабочий расчет и понять, является ли м² технической ошибкой в описании единиц."
  },
  {
    "id": "perimeter-fence-estimate-conflict",
    "category": "estimate_mapping",
    "title": "Ремонт периметрального ограждения конфликтует с названием строки сметы",
    "summary": "Приложение №4 выделяет ремонт ограждения как отдельную услугу; в estimate source refs якорь указывает на ограждение, но строка названа ремонтом дорог/площадок.",
    "public_wording": "требует проверки",
    "severity": "needs_check",
    "related_fact_ids": [
      "services:year-round-perimeter-fence-repair",
      "estimate_rows:improvement-road-surface-repair"
    ],
    "source_refs": [
      {
        "pdf": "full",
        "page": 135,
        "fragment": "Приложение №4 / Круглогодично / строка 4"
      },
      {
        "pdf": "full",
        "page": 126,
        "fragment": "Сводная смета / строка 4.2"
      }
    ],
    "next_step": "Сверить детализацию строки 4.2 и первичные документы по ремонту ограждения."
  }
]
```

## Markdown companion

Если рядом с JSON нужен markdown feed для LLM, он должен повторять те же `id` и source refs:

- один раздел на каждый массив корневого объекта;
- таблица с ключевыми полями;
- короткие цитаты только из `source_refs[].quote`;
- без новых фактов, которых нет в JSON;
- без пересказа методических оснований, карт и нормативной литературы.

## Coverage checklist

- `040-village-characteristics.md` покрывается через `villages[]` и `tariff_summary.tariff_area_sotka`.
- `020-common-assets.md` покрывается через `common_assets[]`; пустые PDF-ячейки не превращаются в нули.
- `030-service-catalog.md` покрывается через `services[]`.
- `050-service-to-estimate-map.md` покрывается через `service_to_estimate_map[]` и связанные `audit_notes[]`.
- `060-calculation-assumptions.md` покрывается через `calculation_assumptions[]`, `audit_notes[]` и `tariff_summary`.
- `sotka-vs-m2-unit` и `waste-temporary-residence-0-5` рекомендуется хранить как `audit_notes[]`, потому что это проверочные места, а не только нейтральные методические принципы.
- Контракт не требует runtime-парсинга PDF: будущий JSON должен собираться из курируемых markdown/TS данных.
