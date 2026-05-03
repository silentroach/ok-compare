# Breadcrumbs Visual Fixture

Локальный fixture для retina screenshot tests компонента `Breadcrumbs`.

## Команды

```bash
pnpm --dir packages/ui run test:visual:breadcrumbs
pnpm --dir packages/ui run test:visual:breadcrumbs:update
```

Если Chromium еще не установлен локально:

```bash
pnpm --dir packages/ui exec playwright install chromium
```

## Что здесь важно

- fixture живет вне production `src`
- тесты поднимают отдельный local-only Astro preview на `127.0.0.1:4325`
- Playwright снимает только fixture locator, а не всю страницу
- fixture фиксирует оба ключевых режима компонента: обычный current item и `linkLast`
