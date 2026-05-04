# News Event Card Visual Fixture

Локальный fixture для screenshot tests компонента `NewsEventCard`.

## Команды

```bash
pnpm --dir apps/www run test:visual:news-event
pnpm --dir apps/www run test:visual:news-event:update
```

Если Chromium еще не установлен локально:

```bash
pnpm --dir apps/www exec playwright install chromium
```

## Что здесь важно

- fixture живет вне production `src/pages`
- тесты запускают отдельный local-only Astro preview на `127.0.0.1:4327`
- карточка использует production CSS-only map layer, без live map tiles
- Playwright снимает только fixture locator, а не всю страницу
