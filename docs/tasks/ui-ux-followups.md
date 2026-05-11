# UI/UX Follow-Ups

Выбранные пункты из аудита страниц на `localhost:4321` для последующего разбора.

## 8. Event-карточки грузят тяжелые iframe-карты без `title`

- Страница: `/news/2026/05/victory-day-greenwood/`
- Наблюдение: на странице найдено 3 iframe Яндекс.Карт без `title`.
- Риск: iframe используются как визуальный фон карточек, но остаются в DOM как фреймы без доступного имени; это ухудшает accessibility tree и может быть лишней нагрузкой для страницы.
- Код: `apps/www/src/components/news/NewsEventCard.astro`
- Первичный вариант решения: добавить `title` для iframe или заменить фоновые iframe на статическую/схематичную карту с явной ссылкой `Открыть на Яндекс Картах`.

## 9. Глобальный smooth scroll не уважает reduced motion

- Наблюдение: `scroll-behavior: smooth` задан глобально без override для `prefers-reduced-motion: reduce`.
- Риск: пользователи с отключенной анимацией все равно получают плавную прокрутку.
- Код: `packages/ui/styles.css`
- Первичный вариант решения: добавить `@media (prefers-reduced-motion: reduce)` и сбрасывать `scroll-behavior: auto`.

## 15. Две meta-строки выходят за локальные лимиты

- Страница: `/news/2026/05/truck-entry-open/`
- Наблюдение: `title` около 79 символов, `description` около 181 символа.
- Данные: `apps/www/src/data/news/articles/2026/05/truck-entry-open.md`
- Страница: `/news/2026/05/victory-day-greenwood/`
- Наблюдение: `description` около 172 символов.
- Данные: `apps/www/src/data/news/articles/2026/05/victory-day-greenwood.md`
- Правила: `docs/page-meta.md`
- Первичный вариант решения: добавить/уточнить `seo.title` и/или `seo.description`, не сокращая основной `summary`, если он нужен для карточек и feed/discovery.
