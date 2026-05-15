# ADR-005: CSP без `unsafe-inline` для исполняемых скриптов

## Статус

Принят

## Дата

2026-05-15

## Контекст

Lighthouse `csp-xss` указывает на два класса риска в production CSP: `script-src 'unsafe-inline'` разрешает любые inline-скрипты и обработчики событий, а сторонние host allowlist для Yandex Metrika и Yandex Maps расширяют поверхность доверия.

Сайт статический, поэтому request nonce неудобен: nginx не генерирует уникальные nonce для каждого HTML-ответа, а build-time nonce для всех страниц не дает нужного свойства одноразовости. CSP hash для всего page-level inline-кода тоже хрупок: Astro, JSON-LD и page scripts меняют итоговый HTML при сборке.

MDN описывает отказ от inline scripts/styles как один из главных выигрышей CSP и рекомендует nonce или hash, если inline-код неизбежен: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src#unsafe_inline_script.

Astro поддерживает обработанные client scripts из `src/`, которые бандлятся как обычные browser modules: https://docs.astro.build/en/guides/client-side-scripts/#script-processing.

## Решение

Исполняемый inline-код сайта вынесен в `apps/www/src/scripts/site-runtime.ts` и подключается через обработанный Astro `<script src="../scripts/site-runtime.ts"></script>` из `BaseLayout.astro`.

В `apps/www/astro.config.ts` выставлен `vite.build.assetsInlineLimit: 0`, чтобы Astro не инлайнил маленькие processed scripts вроде общего runtime и page-level handlers. После этого в HTML остаются только Astro-generated island bootstrap snippets для Svelte islands; они разрешены через SHA-256 hashes в nginx `script-src`.

Этот runtime отвечает за:

- индикатор навигации Astro transitions;
- отложенную загрузку Yandex Metrika;
- отправку Metrika `hit` после client-side переходов;
- скрытие статического fallback-списка `/815/compare/` после готовности Svelte explorer.

Production CSP удаляет `script-src 'unsafe-inline'`, добавляет hashes для Astro island bootstrap snippets и задает `script-src-attr 'none'`, чтобы inline event handlers были явно запрещены. `style-src 'unsafe-inline'` остается, потому что Astro transitions и отдельные HTML-style атрибуты пока требуют inline styles; это не разрешает исполняемый JavaScript.

Host allowlist для `mc.yandex.ru`, `mc.yandex.com`, `api-maps.yandex.ru` и `yastatic.net` остается как документированное исключение: Metrika и Yandex Maps являются принятыми production-интеграциями. Их удаление требует отдельного продуктового решения.

Lighthouse при hash-based `script-src` предлагает добавить `'unsafe-inline'` для обратной совместимости со старыми браузерами, где hashes не поддерживаются. Мы не добавляем этот fallback: для поддерживаемых современных браузеров hashes работают, а возвращение `'unsafe-inline'` ухудшает читаемость политики и может снова попасть в security-аудиты как широкое разрешение.

## Рассмотренные альтернативы

### Nonce-based CSP

Плюсы:

- точечно разрешает inline scripts;
- совместимо с динамически сгенерированным HTML.

Минусы:

- для static output нужен слой, который генерирует уникальный nonce на каждый ответ и меняет HTML;
- усложняет nginx/deploy без практической необходимости после выноса inline-кода.

Отклонено: текущий сайт статический, а executable inline-код можно убрать проще.

### Hash-based CSP для всех inline-блоков

Плюсы:

- работает со статическим HTML;
- не требует runtime nonce.

Минусы:

- hash чувствителен к пробелам и итоговой минификации;
- JSON-LD и Astro-generated output усложняют поддержку;
- каждое изменение inline-кода требует синхронного обновления CSP.

Отклонено для site-authored/page-level кода: дешевле и надежнее держать исполняемый код во внешнем bundled asset. Принято только для небольших Astro-generated island bootstrap snippets, которые остаются в HTML после отключения processed-script inlining.

### Убрать Yandex Metrika и Yandex Maps allowlists

Плюсы:

- CSP стал бы строже;
- Lighthouse перестал бы жаловаться на host allowlists.

Минусы:

- ломает production-аналитику;
- ломает интерактивные карты в compare-разделе;
- это продуктовое решение, а не безопасная инфраструктурная правка.

Отклонено в этой задаче: внешние интеграции остаются принятым риском.

## Последствия

- Новые browser scripts в `BaseLayout.astro` и страницах не должны использовать `is:inline` для исполняемого кода.
- Если нужен новый inline executable script, сначала рассмотреть `src/scripts/*` или компонентный обработанный `<script>` без `is:inline`.
- Если Astro-generated inline script hashes меняются после обновления Astro/Svelte или client directives, нужно синхронно обновить nginx `script-src` и заново проверить production-like build.
- CSP `script-src` не должен возвращать `'unsafe-inline'` без новой ADR или явного security review.
- `style-src 'unsafe-inline'` остается отдельным будущим hardening-направлением.
