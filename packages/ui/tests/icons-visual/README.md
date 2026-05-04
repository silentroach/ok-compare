# Icons Visual Fixture

Локальный fixture для одного screenshot-теста всех shared иконок.

## Команды

```bash
pnpm --dir packages/ui run test:visual:icons
pnpm --dir packages/ui run test:visual:icons:update
```

Если Chromium еще не установлен локально:

```bash
pnpm --dir packages/ui exec playwright install chromium
```

## Что здесь важно

- fixture живет вне production `src`
- тесты поднимают отдельный local-only Astro preview на `127.0.0.1:4328`
- Playwright снимает один locator со всей сеткой иконок
