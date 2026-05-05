# SEO Baseline 2026-05-05

Baseline снят перед SEO-правками с production build основного сайта.

## Build

Команда: `pnpm build:main`

Результат: успешно.

Проверенные артефакты:

| Поверхность                    | Статус |
| ------------------------------ | ------ |
| `dist/www`                     | есть   |
| `dist/www/index.html`          | есть   |
| `dist/www/robots.txt`          | есть   |
| `dist/www/sitemap-index.xml`   | есть   |
| `dist/www/sitemap-0.xml`       | есть   |
| `dist/www/compare/sitemap.xml` | есть   |

## Counts

| Метрика                                   | Значение |
| ----------------------------------------- | -------: |
| HTML-страницы в `dist/www`                |       69 |
| URL в `dist/www/sitemap-0.xml`            |       27 |
| URL в `dist/www/compare/sitemap.xml`      |       39 |
| URL в `dist/www/sitemap-index.xml`        |        2 |
| Страницы без canonical                    |        2 |
| Страницы с `robots=noindex`               |        1 |
| Страницы с количеством `h1` не равным `1` |       39 |
| Duplicate `title` группы                  |        1 |
| Duplicate `description` группы            |        0 |
| Нерезолвящиеся внутренние ссылки          |        0 |
| HTML-страницы вне sitemap                 |        2 |
| Orphan pages по внутренним ссылкам        |        4 |

## Robots And Sitemaps

`dist/www/robots.txt` содержит sitemap index:

```txt
User-agent: *
Allow: /
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Sitemap: https://kpshelkovo.online/sitemap-index.xml
```

`dist/www/sitemap-index.xml` содержит основной sitemap и compare sitemap:

```xml
<loc>https://kpshelkovo.online/compare/sitemap.xml</loc>
<loc>https://kpshelkovo.online/sitemap-0.xml</loc>
```

## Known Issues

| Проблема                           | Baseline                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `www` host                         | `https://www.kpshelkovo.online/` не открывается из-за TLS certificate mismatch |
| Два `h1` у поселков                | 37 settlement pages имеют по два одинаковых `h1`                               |
| Verification HTML без `h1`         | 2 Yandex verification pages имеют `h1Count=0`                                  |
| Duplicate title у status incidents | 1 группа, 2 страницы                                                           |
| Orphan pages                       | 4 страницы по внутренним ссылкам                                               |
| HTML вне sitemap                   | 2 Yandex verification pages                                                    |

## Pages Without Canonical

| Route                                   |
| --------------------------------------- |
| `/compare/yandex_bc149371217bfd36.html` |
| `/yandex_f6b2b7a6076fe997.html`         |

## Pages With Noindex

| Route               | Robots              |
| ------------------- | ------------------- |
| `/compare/404.html` | `noindex, nofollow` |

## H1 Count Not Equal To 1

| Route                                       | H1 count | H1 values                                                    |
| ------------------------------------------- | -------: | ------------------------------------------------------------ |
| `/compare/settlements/arneevo-park/`        |        2 | `КП Арнеево Парк`; `КП Арнеево Парк`                         |
| `/compare/settlements/beketovo-park/`       |        2 | `КП Beketovo Park`; `КП Beketovo Park`                       |
| `/compare/settlements/chulkovo-club/`       |        2 | `КП Чулково Club`; `КП Чулково Club`                         |
| `/compare/settlements/garmoniya/`           |        2 | `КП Гармония`; `КП Гармония`                                 |
| `/compare/settlements/green-forest/`        |        2 | `КП Green Forest`; `КП Green Forest`                         |
| `/compare/settlements/green-park/`          |        2 | `КП Green Park 1-2`; `КП Green Park 1-2`                     |
| `/compare/settlements/green-river/`         |        2 | `КП Green River`; `КП Green River`                           |
| `/compare/settlements/greenwood/`           |        2 | `КП Greenwood`; `КП Greenwood`                               |
| `/compare/settlements/ivushkino/`           |        2 | `КП Ивушкино`; `КП Ивушкино`                                 |
| `/compare/settlements/kapitanskaya-buhta/`  |        2 | `КП Капитанская Бухта`; `КП Капитанская Бухта`               |
| `/compare/settlements/kapitanskaya-dochka/` |        2 | `КП Капитанская Дочка`; `КП Капитанская Дочка`               |
| `/compare/settlements/kapitansky-mys/`      |        2 | `КП Капитанский Мыс`; `КП Капитанский Мыс`                   |
| `/compare/settlements/kapitansky-ostrov/`   |        2 | `КП Капитанский Остров`; `КП Капитанский Остров`             |
| `/compare/settlements/lesnoy-peyzazh-2/`    |        2 | `КП Лесной пейзаж 2`; `КП Лесной пейзаж 2`                   |
| `/compare/settlements/lucky-place/`         |        2 | `КП Lucky Place`; `КП Lucky Place`                           |
| `/compare/settlements/melikhovo-park/`      |        2 | `КП Резиденции Мелихово Парк`; `КП Резиденции Мелихово Парк` |
| `/compare/settlements/monacovo/`            |        2 | `КП Монаково`; `КП Монаково`                                 |
| `/compare/settlements/nordic-forest/`       |        2 | `КП Нордик Форест`; `КП Нордик Форест`                       |
| `/compare/settlements/nordic-hills/`        |        2 | `КП Нордик Хиллс`; `КП Нордик Хиллс`                         |
| `/compare/settlements/nordic-lake/`         |        2 | `КП Нордик Лэйк`; `КП Нордик Лэйк`                           |
| `/compare/settlements/nordic/`              |        2 | `КП Нордик`; `КП Нордик`                                     |
| `/compare/settlements/novikovo/`            |        2 | `КП Новиково`; `КП Новиково`                                 |
| `/compare/settlements/olimp-1/`             |        2 | `КП Олимп 1`; `КП Олимп 1`                                   |
| `/compare/settlements/olimp-2/`             |        2 | `КП Олимп 2`; `КП Олимп 2`                                   |
| `/compare/settlements/olvil/`               |        2 | `КП ОлВиль`; `КП ОлВиль`                                     |
| `/compare/settlements/ozeretskoe-lend/`     |        2 | `КП Озерецкое Ленд`; `КП Озерецкое Ленд`                     |
| `/compare/settlements/panorama-river/`      |        2 | `КП Panorama River`; `КП Panorama River`                     |
| `/compare/settlements/river/`               |        2 | `КП River`; `КП River`                                       |
| `/compare/settlements/rozhdestveno/`        |        2 | `КП Рождествено`; `КП Рождествено`                           |
| `/compare/settlements/shelkovo/`            |        2 | `КП Шелково`; `КП Шелково`                                   |
| `/compare/settlements/sokolinaya-gora/`     |        2 | `КП Соколиная Гора`; `КП Соколиная Гора`                     |
| `/compare/settlements/sosny-village/`       |        2 | `КП Сосны Village`; `КП Сосны Village`                       |
| `/compare/settlements/velikie-ozera/`       |        2 | `КП Великие озёра`; `КП Великие озёра`                       |
| `/compare/settlements/vyazemskie-sady/`     |        2 | `КП Вяземские сады`; `КП Вяземские сады`                     |
| `/compare/settlements/white-park/`          |        2 | `КП White Park`; `КП White Park`                             |
| `/compare/settlements/yusupovo-village/`    |        2 | `КП Юсупово Village`; `КП Юсупово Village`                   |
| `/compare/settlements/zaharkino-park/`      |        2 | `КП Захаркино Парк`; `КП Захаркино Парк`                     |
| `/compare/yandex_bc149371217bfd36.html`     |        0 |                                                              |
| `/yandex_f6b2b7a6076fe997.html`             |        0 |                                                              |

## Duplicate Titles

| Title                                                                          | Routes                                                                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Инцидент: Отключение электричества в Шелково Ривер — Статус — Шелково Онлайн` | `/status/incidents/2026/04/electricity-river-10kv-line-damage/`; `/status/incidents/2026/05/electricity-river-outage/` |

## Duplicate Descriptions

Не найдено.

## Broken Internal Links

Не найдено.

## HTML Pages Not In Sitemap

| Route                                   |
| --------------------------------------- |
| `/compare/yandex_bc149371217bfd36.html` |
| `/yandex_f6b2b7a6076fe997.html`         |

## Orphan Pages By Internal Links

| Route                                   |
| --------------------------------------- |
| `/compare/yandex_bc149371217bfd36.html` |
| `/people/dkochergin/`                   |
| `/people/ykizilov/`                     |
| `/yandex_f6b2b7a6076fe997.html`         |

## Live Responses

| URL                                             | Status | Content-Type | Location / Error                                                                                                                                                                 | Duration |
| ----------------------------------------------- | -----: | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------: |
| `https://kpshelkovo.online/`                    |    200 | `text/html`  |                                                                                                                                                                                  |    345ms |
| `https://kpshelkovo.online/robots.txt`          |    200 | `text/plain` |                                                                                                                                                                                  |    331ms |
| `https://kpshelkovo.online/sitemap-index.xml`   |    200 | `text/xml`   |                                                                                                                                                                                  |    467ms |
| `https://kpshelkovo.online/compare/`            |    200 | `text/html`  |                                                                                                                                                                                  |    398ms |
| `https://kpshelkovo.online/compare/sitemap.xml` |    200 | `text/xml`   |                                                                                                                                                                                  |    239ms |
| `https://www.kpshelkovo.online/`                |    n/a | n/a          | `Hostname/IP does not match certificate's altnames: Host: www.kpshelkovo.online. is not in the cert's altnames: DNS:kpshelkovo.online, DNS:xn--80aestmf.xn--b1afpdqb8d.xn--p1ai` |    381ms |

Live `robots.txt` body sample:

```txt
User-agent: * Allow: / Content-Signal: ai-train=yes, search=yes, ai-input=yes Sitemap: https://kpshelkovo.online/sitemap-index.xml
```

Live `sitemap-index.xml` body sample:

```xml
<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://kpshelkovo.online/compare/sitemap.xml</loc></sitemap><sitemap><loc>https://kpshelkovo.online/sitemap-0.xml</loc></sitemap></sitemapindex>
```

## Verification

| Check                                                                    | Result |
| ------------------------------------------------------------------------ | ------ |
| `pnpm build:main` завершается без ошибок                                 | pass   |
| `dist/www/index.html` существует                                         | pass   |
| `dist/www/robots.txt` содержит sitemap index                             | pass   |
| `dist/www/sitemap-index.xml` содержит основной sitemap и compare sitemap | pass   |
| Текущие известные проблемы записаны явно                                 | pass   |
