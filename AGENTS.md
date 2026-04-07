# AGENTS.md

Руководство для AI агентов, работающих с этим репозиторием.

## Команды разработки

```bash
# Запуск dev-сервера
pnpm dev

# Сборка для продакшена
pnpm build

# Превью продакшен-сборки
pnpm preview

# Проверка типов
pnpm typecheck

# Запуск всех тестов
pnpm test

# Тесты в watch-режиме
pnpm test:watch

# Запуск конкретного теста
pnpm exec vitest run src/components/ComponentName.svelte.test.ts

# Тесты по паттерну
pnpm exec vitest run -t "описание теста"
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
- Всюду, где можно использовать `undefined` вместо `null` - стоит использовать именно `undefined` и опциональные свойства
- Если нужно вернуть `undefined`, писать `return;` (не `return undefined;`)
- Не передавать свойства со значением `undefined` в объектах/props: опускать ключ целиком

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Prefer single word variable names where possible
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream

### Именование

- Prefer single word names for variables and functions. Only use multiple words if necessary.
- **Компоненты**: PascalCase (`SettlementCard.svelte`)
- **Утилиты**: camelCase (`formatCurrency.ts`)
- **Типы/Интерфейсы**: PascalCase (`Settlement`, `ComparisonResult`)
- **Константы**: UPPER_SNAKE_CASE
- **Поля в YAML**: snake_case (`is_baseline`, `short_name`)
- **Переменные в коде**: camelCase (`isBaseline`, `shortName`)

### Naming Enforcement (Read This)

THIS RULE IS MANDATORY FOR AGENT WRITTEN CODE.

- Use single word names by default for new locals, params, and helper functions.
- Multi-word names are allowed only when a single word would be unclear or ambiguous.
- Write comments only in unclear cases.
- Do not introduce new camelCase compounds when a short single-word alternative is clear.
- Before finishing edits, review touched lines and shorten newly introduced identifiers where possible.
- Good short names to prefer: `pid`, `cfg`, `err`, `opts`, `dir`, `root`, `child`, `state`, `timeout`.
- Examples to avoid unless truly required: `inputPID`, `existingClient`, `connectTimeout`, `workerPath`.

### Svelte компоненты

- Использовать Runes: `$props()`, `$state()` и т.д.
- Добавлять `data-testid` атрибуты для тестирования
- Для id/for и aria-связей в повторяемых компонентах использовать `$props.id()` как префикс
- Для `label`/`input` и `label`/`select` использовать явную связку `for` + `id` (не только вложенность)
- Для toggle-кнопок синхронизировать `aria-pressed` и `aria-controls` с фактическим блоком

### Hydration directives (Astro)

- `client:load` — только для критичных интерактивных блоков above-the-fold
- `client:idle` — для интерактивных блоков среднего приоритета, где нужна ранняя, но не блокирующая гидрация
- `client:visible` — для тяжелых блоков и карт, которые можно гидрировать при появлении в viewport
- Для декоративных карт/виджетов без моментальной интерактивности предпочитать `client:visible`

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

### Правила данных (YAML)

- Если факт не подтвержден источником, значение считается **неизвестным**: поле нужно **опускать**, а не ставить `partial`.
- `partial` использовать только когда объект/услуга реально есть в ограниченном формате (а не при сомнениях).
- В `common_spaces` поле `club_infrastructure` — агрегированный признак доступа к клубной инфраструктуре (может включать много пунктов списка).
- Для отдельных пунктов (`restaurant`, `kids_club`, `beach_zones` и т.д.) ставить `yes` только при наличии именно в конкретном поселке.
- Если объект доступен только в соседнем поселке через клуб, ставить `yes` у `club_infrastructure`, а сам конкретный пункт — `no` или оставлять неизвестным (если нет подтверждения отсутствия).
- Для `location.address_text` использовать краткий формат: `<регион>, <округ/район>[, <населенный пункт>]`.
- Порядок в `location.address_text`: сначала регион, затем округ/район, затем (опционально) населенный пункт.
- Сокращения: `Московская область` → `МО`, `<регион> область` → `<регион> обл.`.
- В `location.address_text` формы `городской округ`, `муниципальный округ`, `м.о.` приводить к `округ <название>`.
- Населенный пункт добавлять только если это повышает понятность и **не** дублирует название поселка; использовать краткие формы `д.` и `с.`.
- Не включать в `location.address_text` название КП, улицу, дом, кадастровые/служебные формулировки.
- Примеры: `Московская область, городской округ Домодедово, деревня Матчино` → `МО, округ Домодедово, д. Матчино`; `Ступинский район, Московская область` → `МО, округ Ступино`.

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
- **Не запускать `pnpm dev` без явной просьбы** — команда запускает watch-режим и не завершается автоматически
