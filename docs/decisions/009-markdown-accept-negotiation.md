# ADR-009: Markdown через `Accept` negotiation

## Статус

Принят

## Дата

2026-05-17

## Контекст

Корневой сайт `kpshelkovo.online` собирается как статическое Astro-приложение и обслуживается nginx. Для ряда публичных HTML-страниц рядом генерируются Markdown companion-файлы: `index.md` у главной, разделов, архивов, статуса и Compare.

Эти Markdown-страницы нужны агентам, терминальным клиентам и другим машинным потребителям. У сайта уже есть два способа получить их:

- прямой URL companion-файла, например `/news/index.md`;
- canonical HTML URL с заголовком `Accept: text/markdown`, например `/news/`.

Второй способ является HTTP content negotiation: один и тот же URL может вернуть `text/html` или `text/markdown` в зависимости от request header `Accept`. Это удобно для агентов, потому что они могут запрашивать машинный вариант того же канонического адреса, который видит человек.

Но у content negotiation есть кешевый контракт. Если ответ зависит от `Accept`, все варианты этого negotiated URL должны явно сообщать кешам `Vary: Accept`. Иначе shared cache, CDN или промежуточный прокси может сохранить один вариант и отдать его клиенту с другим `Accept`.

Сжатие добавляет отдельную ось вариации через `Accept-Encoding`. `Vary: Accept-Encoding` не заменяет `Vary: Accept`: первый заголовок описывает gzip/brotli-варианты тела, второй - выбор media type.

## Решение

Сохраняем оба публичных способа доступа к Markdown:

- прямые `.md` companion URLs как стабильные, ссылочные, машинно-читаемые ресурсы;
- negotiated HTML URLs, которые отдают Markdown при `Accept: text/markdown`.

Любой route, который выбирает HTML или Markdown по request header `Accept`, обязан отдавать `Vary: Accept` на обеих ветках ответа:

- HTML-вариант negotiated URL;
- Markdown-вариант того же negotiated URL.

Если nginx или другой слой сжатия также добавляет `Vary: Accept-Encoding`, оба значения должны сохраняться. Допустимы несколько полей `Vary` или один общий список значений, если итоговый HTTP-ответ эквивалентно сообщает обе оси вариации.

Прямые `.md` URLs не являются content negotiation по пути: сам URL уже выбирает Markdown-ресурс. Для них обязательны корректный `Content-Type: text/markdown`, явная cache policy и стабильная генерация Markdown. `Vary: Accept` на прямых `.md` URLs не нужен для корректности, но может оставаться в nginx как совместимое операционное поведение.

## Область действия

Решение относится к публичным маршрутам `apps/www`, которые обслуживаются через `ops/nginx/kpshelkovo-online.conf` и используют `Accept: text/markdown` для выбора companion Markdown.

Решение не меняет правила генерации Markdown. Генерацию регулирует ADR-008, а Markdown-рендер в HTML - ADR-003.

Решение не требует добавлять content negotiation всем HTML-страницам. Если новый раздел не готов отдавать Markdown companion, его HTML URL не должен объявлять или имитировать поддержку `Accept: text/markdown`.

## Рассмотренные альтернативы

### Оставить только прямые `.md` URLs

Плюсы:

- проще кеширование: разные media type живут на разных URL;
- не нужен `Vary: Accept` на HTML routes;
- меньше nginx-логики.

Минусы:

- агенту нужно сначала найти companion URL через `Link`, discovery или HTML;
- canonical URL нельзя напрямую запросить как Markdown;
- уже существующий публичный контракт `Accept: text/markdown` пришлось бы ломать.

Отклонено: negotiated canonical URL полезен для агентов и уже является частью публичной поверхности сайта.

### Использовать query-параметр вместо `Accept`

Плюсы:

- кеши различают варианты по URL без `Vary: Accept`;
- проще отлаживать в браузере.

Минусы:

- появляется третий адрес того же содержания рядом с HTML URL и `.md` URL;
- query-параметр хуже выражает выбор представления ресурса, чем HTTP `Accept`;
- нужно заново документировать и поддерживать еще один публичный контракт.

Отклонено: прямые `.md` URLs уже покрывают сценарий отдельного адреса, а `Accept` лучше подходит для выбора представления canonical URL.

### Выбирать Markdown по User-Agent

Плюсы:

- агентам не нужно выставлять `Accept`;
- можно сохранить один видимый URL.

Минусы:

- User-Agent ненадежен и плохо нормализуется;
- кешевый ключ становится еще менее очевидным;
- клиенты теряют явный контроль над желаемым media type.

Отклонено: формат ответа должен выбираться явным `Accept`, а не эвристикой по клиенту.

### Отключить кеширование negotiated HTML routes

Плюсы:

- меньше риск долгоживущей ошибочной отдачи из shared cache;
- проще рассуждать о свежести.

Минусы:

- это не заменяет `Vary: Accept` для промежуточных кешей;
- ухудшает предзагрузку и краткий HTML-кеш, принятый в ADR-002;
- наказывает обычную HTML-навигацию из-за машинного варианта.

Отклонено: правильный заголовок `Vary` решает корректность, а короткий HTML-кеш остается полезным.

## Последствия

- Новые negotiated HTML routes должны добавлять `Vary: Accept` вместе с HTML cache policy.
- Регрессионный тест nginx coverage должен падать, если route с `Accept: text/markdown` не сообщает `Vary: Accept`.
- При подключении CDN нужно проверить, что он уважает `Vary: Accept` или явно нормализует cache key до нужных вариантов, например HTML и Markdown.
- Если маршрут перестает поддерживать Markdown по `Accept`, нужно убрать и саму ветку negotiation, и связанные discovery-обещания.
- `Vary: Accept-Encoding` от gzip/brotli должен сохраняться независимо от `Vary: Accept`.

## Источники

- HTTP Semantics, `Accept`: https://www.rfc-editor.org/rfc/rfc9110.html#field.accept
- HTTP Semantics, `Vary`: https://www.rfc-editor.org/rfc/rfc9110.html#field.vary
- HTTP Caching: https://www.rfc-editor.org/rfc/rfc9111.html
