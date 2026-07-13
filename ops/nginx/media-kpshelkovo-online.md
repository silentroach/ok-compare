# Media origin

`media.kpshelkovo.online` проксирует публичные объекты S3 и использует отдельный статический artifact только для локальной страницы 404.

Параметры бакета, структура ключей и порядок публикации через `s5cmd` описаны в [storage runbook](../storage/public-media.md). Архитектурные границы хранения файлов зафиксированы в [ADR-021](../../docs/decisions/021-public-section-files-in-s3.md).

## Каталоги

- `/var/www/media-kpshelkovo-online` - содержимое `dist/media`.
- `/var/cache/nginx/media-kpshelkovo-online` - proxy cache S3.
- `/var/www/kpshelkovo-online/.well-known/acme-challenge` - существующий ACME webroot.

`deploy-nginx-site` создает static root до первого `rsync` и назначает владельцем пользователя, который вызвал скрипт через `sudo`. Workflow затем проверяет, что каталог доступен для записи.

## Сертификат

Хост использует сертификат `/etc/letsencrypt/live/kpshelkovo.online`. Сертификат должен содержать SAN `media.kpshelkovo.online` вместе с остальными действующими именами.

## Деплой

1. `pnpm build` создает `dist/media/404.html` и `dist/media/_media/`.
2. `deploy-nginx-site` готовит static root, устанавливает site-файл, выполняет `nginx -t` и перезагружает nginx только после успешной проверки.
3. Workflow синхронизирует `dist/media` в `/var/www/media-kpshelkovo-online`.

Nginx отдает `404.html` только через internal error redirect. Прямые запросы к media-origin продолжают идти в фиксированный S3 upstream, кроме зарезервированного asset-префикса `/_media/`.
