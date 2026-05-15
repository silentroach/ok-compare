# ADR-006: HSTS без `includeSubDomains` и `preload`

## Статус

Принят

## Дата

2026-05-15

## Контекст

Lighthouse `has-hsts` считает текущий заголовок `Strict-Transport-Security: max-age=31536000` неполным, потому что в нем нет `includeSubDomains` и `preload`.

MDN описывает `includeSubDomains` как директиву, которая распространяет HSTS на все поддомены хоста, а `preload` требует как минимум `max-age=31536000` и `includeSubDomains`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security.

`hstspreload.org` требует HTTPS для всех поддоменов, включая внутренние, рекомендует сначала поэтапно раскатывать `includeSubDomains`, отдельно предупреждает, что HSTS preloading не рекомендуется, и описывает удаление из preload list как медленный процесс на месяцы: https://hstspreload.org/.

В репозитории и текущих live-проверках видны только `kpshelkovo.online` и `www.kpshelkovo.online`; оба указывают на один адрес, а `www` по HTTPS редиректит на apex. При этом в репозитории нет авторитетного DNS-zone inventory и списка планируемых поддоменов, поэтому нельзя доказать, что все текущие, внутренние и будущие поддомены готовы к принудительному HTTPS.

## Решение

Оставляем HSTS host-only: `max-age=31536000` без `includeSubDomains` и без `preload`.

Lighthouse warning про отсутствующие `includeSubDomains` и `preload` считаем документированным non-actionable item, пока нет авторитетного инвентаря поддоменов и явного долгосрочного обязательства поддерживать HTTPS на всем дереве `*.kpshelkovo.online`.

Для известного HTTPS-хоста `www.kpshelkovo.online` добавляем такой же host-only HSTS на ответ-редирект. Это защищает прямые заходы на `https://www.kpshelkovo.online/`, но не заставляет браузеры применять HSTS ко всем поддоменам.

## Рассмотренные альтернативы

### Включить `includeSubDomains` сейчас

Плюсы:

- закрывает Lighthouse note по одной из недостающих директив;
- защищает будущие HTTP-переходы на поддомены после первого успешного HSTS-контакта с apex.

Минусы:

- ломает любой существующий или будущий поддомен без корректного HTTPS;
- распространяется на внутренние поддомены, которые не видны из репозитория;
- откат требует доставить `max-age=0` по HTTPS и дождаться, пока клиенты его увидят.

Отклонено: нет надежного инвентаря всех поддоменов и planned DNS usage.

### Включить `preload`

Плюсы:

- убирает первый небезопасный HTTP-hop для новых пользователей;
- закрывает Lighthouse note по `preload`.

Минусы:

- требует `includeSubDomains`, а он сейчас отклонен;
- требует постоянного соответствия всем preload requirements;
- удаление из preload list занимает месяцы и не гарантирует синхронное поведение во всех браузерах;
- сам preload-сервис рекомендует не включать preload по умолчанию.

Отклонено: риск и стоимость отката непропорциональны для текущего сайта.

### Оставить `www` без собственного HSTS

Плюсы:

- не меняет nginx-поведение.

Минусы:

- прямой HTTPS-заход на `www` не запоминает HSTS для самого `www` перед редиректом;
- проверка заголовков `https://www.kpshelkovo.online/` остается менее понятной.

Отклонено: `www` уже известен, имеет валидный HTTPS и безопасно может получить host-only HSTS.

## Последствия

- `ops/nginx/kpshelkovo-online.conf` должен отдавать host-only HSTS на apex и HTTPS `www` redirect.
- Lighthouse `has-hsts` может продолжить показывать informative warning про `includeSubDomains` и `preload`; это принятое ограничение, а не регрессия.
- Перед будущим включением `includeSubDomains` нужно получить полный DNS/subdomain inventory, проверить HTTPS на всех поддоменах и пройти staged rollout с коротких `max-age`.
- Перед будущим `preload` нужна отдельная ADR или явное security review с подтверждением долгосрочных rollback implications.
