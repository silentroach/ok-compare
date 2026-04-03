# AGENTS.md

Руководство для AI агентов, работающих с этим репозиторием.

## Команды разработки

```bash
# Запуск dev-сервера
npm run dev

# Сборка для продакшена
npm run build

# Превью продакшен-сборки
npm run preview

# Проверка типов
npm run typecheck

# Запуск всех тестов
npm run test

# Тесты в watch-режиме
npm run test:watch

# Запуск конкретного теста
npx vitest run src/components/ComponentName.svelte.test.ts

# Тесты по паттерну
npx vitest run -t "описание теста"
```

## Стек технологий

- **Фреймворк**: Astro 5 (static output)
- **Компоненты**: Svelte 5 с Runes ($props, $state)
- **Стили**: Tailwind CSS v4
- **Язык**: TypeScript (strict mode)
- **Тестирование**: Vitest + @testing-library/svelte + happy-dom
- **Валидация**: Zod
- **Данные**: YAML файлы через Astro content collections

## Стиль кода

### TypeScript

- Strict mode
- Явные типы для параметров и возвращаемых значений
- `interface` для объектов, `type` для union/utility types

### Именование

- **Компоненты**: PascalCase (`SettlementCard.svelte`)
- **Утилиты**: camelCase (`formatCurrency.ts`)
- **Типы/Интерфейсы**: PascalCase (`Settlement`, `ComparisonResult`)
- **Константы**: UPPER_SNAKE_CASE
- **Поля в YAML**: snake_case (`is_baseline`, `short_name`)
- **Переменные в коде**: camelCase (`isBaseline`, `shortName`)

### Svelte компоненты

- Использовать Runes: `$props()`, `$state()` и т.д.
- Добавлять `data-testid` атрибуты для тестирования

### Порядок импортов

1. Внешние библиотеки (zod и т.д.)
2. Импорты типов (`import type { ... }`)
3. Внутренние утилиты (`from '../lib/...'`)
4. Компоненты-соседи (`from './Component.svelte'`)
5. Стили (если есть)

### Тестирование

- Co-locate: `Component.svelte.test.ts` рядом с компонентом
- Query по `data-testid`
- Мокать внешние зависимости
- Суффикс `.test.ts`

### Обработка ошибок

- Использовать Zod для runtime-валидации внешних данных
- Бросать описательные ошибки для невалидных состояний
- Явно обрабатывать nullable значения через type guards

### Комментарии и документация

- Добавлять JSDoc для экспортируемых функций-утилит
- Использовать inline-комментарии редко — предпочитать читаемый код
- Русский язык для UI текста и пользовательского контента

### Path Aliases

Доступны в tsconfig.json:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@lib/*` → `src/lib/*`
- `@data/*` → `src/data/*`
- `@layouts/*` → `src/layouts/*`
- `@styles/*` → `src/styles/*`

### Git

- Не коммитить секреты и credentials
- Не запускать git-команды без явной просьбы
- Коммиты должны быть сфокусированы на одной задаче

## Структура проекта

```
src/
├── components/    # Svelte компоненты (*.svelte + *.test.ts)
├── layouts/       # Astro layouts (*.astro)
├── pages/         # Astro страницы (роуты)
├── lib/           # Утилиты, схемы, бизнес-логика
├── data/          # YAML файлы с данными
└── styles/        # Глобальные CSS
```

## Важные замечания

- Svelte 5 runes mode включен (compilerOptions.runes: true)
- Тесты используют happy-dom окружение
- Русская локаль для форматирования валюты и чисел
- Static site output с base path `/compare`
- **Не запускать `npm run dev` без явной просьбы** — команда запускает watch-режим и не завершается автоматически
