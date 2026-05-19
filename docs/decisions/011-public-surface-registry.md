# ADR-011: Описательный Public Surface Registry

## Статус

Принят

## Дата

2026-05-19

## Контекст

`kpshelkovo.online` публикует не только HTML-страницы для людей, но и полноценные агентные поверхности (`agent-facing surfaces`): Markdown companions, JSON feeds, schemas, OpenAPI, API catalogs, `llms.txt`, `llms-full.txt` и public skill indexes. В продуктовой рамке уже закреплено, что человеческие и агентные поверхности должны описывать одну и ту же реальность продукта.

Сейчас знание о публичном контракте расползается по нескольким Implementation:

- route helpers разделов знают отдельные пути;
- корневой discovery вручную собирает API catalog сайта;
- корневые `llms.txt` и `llms-full.txt` повторяют карту разделов;
- public skill indexes живут отдельными списками;
- `nginx` вручную знает MIME, cache class, `Link` headers и `Accept` negotiation;
- route coverage tests заново классифицируют семейства routes через список и регулярные выражения.

Особенно заметный пример - Compare: корневой discovery и корневой `llms.txt` хранят строки вида `/815/compare/...`, хотя сам Compare уже имеет собственные helpers и discovery constants. При добавлении новой публичной поверхности ошибка синхронизации выглядит не как падение одного Module, а как рассинхронизация между каталогами, агентными текстами, headers и deploy-проверками.

## Решение

Вводим `Public Surface Registry` как описательный Module уровня app для публичного публикационного контракта `apps/www`.

Registry должен описывать не содержимое разделов, а то, что сайт публикует наружу:

- раздел и его каноническую публичную точку входа;
- HTML routes и важные route patterns;
- Markdown companions;
- JSON feeds и другие стабильные ресурсы данных и скачивания;
- schemas, OpenAPI и API catalogs;
- `llms.txt` и `llms-full.txt`;
- public skill indexes;
- ожидаемый media type, cache class, `Link` relations и признак `Accept` negotiation там, где это часть публичного поведения.

Registry не становится генератором domain payload. Он не должен знать, как строится body новости, payload статуса, данные регламента или Compare feed. Data loaders разделов, schema builders, Markdown generators и route helpers остаются владельцами своего содержимого и низкоуровневого построения путей.

Registry также не должен сразу генерировать `nginx`. На первом этапе `nginx` остается ручной deploy Implementation, а registry становится источником истины для ожидаемого поведения в тестах. Иными словами, registry описывает, какие `Link` relations, MIME, cache class и negotiation должны существовать, а тесты проверяют, что ручной `nginx` им соответствует.

Организационно registry должен складываться из slices, которыми владеют разделы, а не из одного центрального файла со всеми строками. Разделы держат свои slices рядом с route/discovery modules; корневой registry агрегирует их для корневого discovery, корневого `llms.txt`, public skill discovery и deploy coverage tests. Compare должен участвовать в этой же модели: корневой слой не должен вручную знать его `/815/compare/...` surfaces.

## Область действия

Решение относится к публичным поверхностям `apps/www`, которые являются контрактом для людей, агентов, поисковых роботов, терминальных клиентов и deploy-поведения.

В область входят стабильные ресурсы доказательств, данных и discovery вроде source PDFs регламента, RSS/ICS, catalogs, schemas и data feeds, если для них важны discovery, MIME или cache policy.

В область не входят build assets с хешем, обычные изображения новостей, favicons и другие вспомогательные файлы, пока они не становятся самостоятельным публичным контрактом. Redirects и ACME routes остаются deploy behavior и не обязаны жить в registry.

Решение не меняет ADR-002, ADR-008 и ADR-009:

- ADR-002 продолжает регулировать HTML navigation, prefetch и HTML cache policy;
- ADR-008 продолжает регулировать генерацию публичного Markdown через AST;
- ADR-009 продолжает регулировать Markdown через `Accept` negotiation и `Vary: Accept`.

## Рассмотренные альтернативы

### Оставить section route helpers и ручную синхронизацию

Плюсы:

- минимальная миграция;
- текущая структура уже работает;
- каждый раздел может развиваться локально.

Минусы:

- публичная карта сайта остается неявной;
- корневой discovery, корневой `llms.txt`, skills, tests и `nginx` могут расходиться;
- добавление новой agent-facing surface требует помнить несколько ручных списков;
- тестовая поверхность проверяет отдельные симптомы, а не единый public surface contract.

Отклонено: это сохраняет текущую рассинхронизацию и не дает нужной Locality для agent-facing surfaces.

### Сразу генерировать `nginx` из registry

Плюсы:

- меньше ручного дублирования в deploy-конфиге;
- проще гарантировать соответствие headers и cache policy;
- registry стал бы не только описанием, но и источником для генерации.

Минусы:

- резко растет радиус воздействия первого изменения;
- публикационный контракт уровня app начинает смешиваться с операционными деталями `nginx`;
- сложнее безопасно учитывать redirects, ACME, legacy paths, TLS/server blocks и ручные исключения;
- до стабилизации registry ошибки дизайна сразу попадут в deploy-артефакты.

Отклонено на первом этапе. `nginx` остается ручной Implementation, а тесты на основе registry становятся реальным Seam между app contract и deploy behavior. Генерацию отдельных snippets можно пересмотреть позже, если registry стабилизируется и ручная поддержка останется источником ошибок.

### Сделать один центральный mega-registry

Плюсы:

- вся карта видна в одном файле;
- проще быстро собрать root discovery;
- меньше импортов между разделами.

Минусы:

- разделы теряют владение своими public surfaces;
- центральный файл быстро станет свалкой путей, titles и исключений;
- Compare, news, status, people и reglament начнут менять один общий Module без реальной общей Implementation;
- Locality ухудшится при изменении конкретного раздела.

Отклонено: registry должен агрегироваться из slices разделов. Корневой слой должен собирать карту, а не владеть строками каждого раздела.

### Включить в registry содержимое `llms.txt` и catalog prose

Плюсы:

- можно сильнее унифицировать discovery и агентные тексты;
- меньше повторяющихся titles и descriptions.

Минусы:

- registry начнет хранить редакционный и доменный текст, а не только publication contract;
- `llms.txt` потеряет свободу объяснять сценарии чтения, ограничения данных и порядок действий;
- Module станет широким и shallow: callers все равно должны будут знать, какая prose где уместна.

Отклонено: registry может хранить короткие labels для машинного чтения в discovery, но не должен становиться владельцем подробной агентной документации.

## Последствия

- Новая публичная surface считается поддержанной только после регистрации в `Public Surface Registry` или явного решения оставить ее вне registry.
- Корневой discovery, корневой `llms.txt`, public skill discovery и deploy coverage tests должны постепенно перейти с ручных списков на registry.
- Тесты должны проверять контракт публичных поверхностей через registry: наличие surfaces в catalogs, важные ссылки в `llms.txt`, обнаруживаемость public skill indexes, MIME/cache/negotiation coverage в `nginx`.
- Источником истины для ожидаемых `Link` relations становится registry; фактические `Link` headers в `nginx` являются проверяемой Implementation.
- Route helpers разделов остаются низкоуровневыми path builders. Registry использует их как adapters, но не заменяет domain loaders и generators.
- Compare должен экспортировать свой registry slice, чтобы корневой код не держал строки `/815/compare/...` вручную.
- Registry schema должна оставаться про публикацию, а не про содержимое. Если в него начинает попадать domain payload или длинная prose, это признак нарушения Seam.
