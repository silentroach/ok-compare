# ADR-007: COOP без COEP для opener isolation

## Статус

Принят

## Дата

2026-05-15

## Контекст

Lighthouse `origin-isolation` сообщает, что production-ответы не содержат `Cross-Origin-Opener-Policy`.

MDN описывает COOP как response header, который управляет тем, попадает ли новый top-level document в тот же browsing context group, и позволяет разорвать `window.opener`-связи между документами: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy.

MDN также указывает, что полноценный `crossOriginIsolated` требует одновременно `Cross-Origin-Opener-Policy: same-origin` и `Cross-Origin-Embedder-Policy: require-corp` или `credentialless`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy#features_that_depend_on_cross-origin_isolation.

web.dev предупреждает, что `COOP: same-origin` может ломать интеграции, которым нужны cross-origin window interactions, например OAuth или платежи, а COEP требует явного CORP/CORS opt-in для subresources и iframe: https://web.dev/articles/coop-coep.

Текущий сайт не использует `window.open`, внешнюю авторизацию, платежные popup-флоу или обмен данными через `window.opener`. Внешние ссылки открываются через `target="_blank"` с `noopener`/`noreferrer`. Yandex Metrika и Yandex Maps остаются принятыми production-интеграциями, но они подключаются как скрипты, сетевые запросы и iframe, а не как opener-dependent popup-флоу.

## Решение

Добавляем `Cross-Origin-Opener-Policy: same-origin` на основной HTTPS server block `kpshelkovo.online`.

Не добавляем `Cross-Origin-Embedder-Policy`: сайту сейчас не нужны `SharedArrayBuffer`, high-resolution timers или другие возможности, требующие `crossOriginIsolated`, а COEP может заблокировать сторонние ресурсы Yandex без полного аудита CORP/CORS на стороне поставщика.

Не добавляем отдельный COOP на HTTPS `www` redirect и legacy redirect-домен: эти ответы не рендерят HTML-документ, а итоговая навигация попадает на apex с COOP.

## Рассмотренные альтернативы

### Не добавлять COOP

Плюсы:

- нулевой риск изменения browser behavior;
- не требует post-deploy проверки заголовков.

Минусы:

- Lighthouse продолжает показывать `origin-isolation` finding;
- сайт не получает защиту от cross-origin opener interactions для top-level HTML-ответов.

Отклонено: в текущем коде нет opener-dependent сценариев, а `same-origin` дает понятный hardening-выигрыш без COEP.

### `same-origin-allow-popups`

Плюсы:

- мягче для будущих OAuth/payment-like popup-интеграций;
- сохраняет совместимость с cross-origin документами без COOP, которые открыты через `window.open`.

Минусы:

- сохраняет больше opener-связей, чем нужно текущему сайту;
- выбирает совместимость с несуществующим popup-флоу вместо минимизации XS-Leak поверхности.

Отклонено: если появится реальный popup-flow, нужно отдельное security review и точечное ослабление политики.

### Добавить COEP и включить полноценный `crossOriginIsolated`

Плюсы:

- открывает доступ к возможностям вроде `SharedArrayBuffer`;
- полностью соответствует stricter cross-origin isolation модели.

Минусы:

- требует CORP/CORS opt-in для всех cross-origin subresources и iframe;
- может сломать Yandex Maps, Metrika и будущие сторонние embeds;
- не дает практической пользы текущему статическому сайту.

Отклонено: COEP не нужен для цели Lighthouse follow-up и несет непропорциональный integration risk.

## Последствия

- `ops/nginx/kpshelkovo-online.conf` должен отдавать `Cross-Origin-Opener-Policy: same-origin` на apex HTTPS-ответах.
- Новые OAuth, payment или другие popup/window-opener интеграции должны проходить отдельную проверку COOP-совместимости до запуска.
- Если сайту понадобятся `crossOriginIsolated` возможности, нужно отдельное решение по COEP, CORP/CORS для сторонних ресурсов и staged rollout с browser verification.
