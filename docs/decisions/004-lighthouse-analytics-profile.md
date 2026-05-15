# ADR-004: Lighthouse-профиль без аналитики

## Статус

Принят

## Дата

2026-05-15

## Контекст

`kpshelkovo.online` использует Yandex Metrika в production. Lighthouse Best Practices стабильно снижает оценку из-за сторонних cookies и inspector issues из `mc.yandex.ru` / `mc.yandex.com`. Это внешний сервисный эффект, а не first-party регрессия сайта.

Полностью убирать Метрику из production нельзя без отдельного продуктового решения: она нужна для рабочей аналитики. Одновременно scheduled Lighthouse CI должен оставаться полезным сигналом по качеству кода и страниц, а не регулярно шуметь из-за принятой сторонней интеграции.

## Решение

Production-сборка и production Lighthouse сохраняют Yandex Metrika включенной.

Scheduled/static Lighthouse CI строит сайт с `LIGHTHOUSE_DISABLE_ANALYTICS=true`. Этот build-time флаг отключает только вставку Metrika в статический Lighthouse-артефакт и не меняет production-поведение.

Для production target в Lighthouse CI порог `categories:best-practices` снижен до `0.75`, потому что реальная production-страница намеренно включает Metrika и получает принятый сторонний cookie findings. Static target сохраняет `0.9` как основной first-party guard.

Lighthouse summary должен явно показывать состояние аналитики и, если отчет все же содержит Yandex Metrika findings в `third-party-cookies` или `inspector-issues`, объяснять, что это принятое ограничение production-интеграции.

## Рассмотренные альтернативы

### Убрать Yandex Metrika из production

Плюсы:

- исчезает сторонний cookie finding;
- CSP можно сузить для Metrika origins.

Минусы:

- теряется production-аналитика;
- это продуктовое решение, а не техническая правка Lighthouse.

Отклонено: задача не должна менять production-аналитику.

### Оставить Метрику включенной во всех Lighthouse-прогонах

Плюсы:

- Lighthouse всегда измеряет ровно production HTML;
- не нужен отдельный build-time профиль.

Минусы:

- scheduled CI продолжит шуметь по принятому стороннему сервису;
- Best Practices warning будет плохо отличаться от настоящей first-party регрессии.

Отклонено для scheduled/static CI: основной автоматический guard должен проверять first-party качество.

### Полностью отключить Best Practices assertions

Плюсы:

- исчезают ложные предупреждения из-за Metrika.

Минусы:

- теряются полезные сигналы по другим Best Practices регрессиям;
- future regressions станут менее заметны.

Отклонено: static target должен продолжать держать высокий порог.

## Последствия

- `LIGHTHOUSE_DISABLE_ANALYTICS` должен быть учтен в `turbo.json` как env-зависимость build output.
- Scheduled Lighthouse CI проверяет статический сайт без Metrika.
- Manual production Lighthouse target остается способом увидеть реальное поведение production с Metrika.
- CSP для production остается с Metrika origins, пока production-аналитика включена.
