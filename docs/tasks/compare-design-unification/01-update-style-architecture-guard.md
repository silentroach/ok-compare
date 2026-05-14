# Task 01: Обновить архитектурный guard стилей

## Цель

Заменить тест, который защищает старую визуальную изоляцию compare, на guard для новой модели: compare наследует shared UI и не переопределяет `.ui-*` примитивы на уровне раздела.

## Контекст

Сейчас `apps/www/src/compare/lib/styles.architecture.test.ts` проверяет, что compare держит локальные overrides для `.ui-shell`, `.ui-shell-strong`, `.ui-chip`, `.ui-btn` и запрещает старый raised shell vocabulary. Это было полезно, когда compare считался отдельным визуальным продуктом. Теперь это неверный архитектурный сигнал.

## Что сделать

- Переписать `styles.architecture.test.ts` под новый инвариант.
- Проверять, что `apps/www/src/compare/styles/global.css` не импортирует `@shelkovo/ui/styles.css`.
- Проверять, что `global.css` не содержит selectors вида `.ui-root-compare .ui-shell`, `.ui-root-compare .ui-shell-strong`, `.ui-root-compare .ui-chip`, `.ui-root-compare .ui-btn`, `.ui-root-compare .ui-copy`, `.ui-root-compare .ui-link`.
- Разрешить локальные selectors только для compare-specific naming, например `.compare-*`, если такие классы останутся.
- Убрать assertions, которые требуют плоский shell, transparent chips или square buttons как compare-level override.

## Чего не делать

- Не удалять сами CSS overrides в этой задаче, если задача выполняется строго отдельно. Это задача 02.
- Не менять визуальный вид страниц.
- Не менять `packages/ui/styles.css`.

## Критерии приемки

- Тест больше не требует локальных overrides shared primitives.
- Тест падает, если в compare CSS снова появляются `.ui-root-compare .ui-*` overrides для shared primitives.
- Тест падает, если compare CSS снова импортирует `@shelkovo/ui/styles.css`.
- Название и тексты ошибок теста объясняют новую архитектурную причину.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts`.
- Если targeted запуск неудобен для текущего runner, запустить `pnpm --filter @shelkovo/www test`.

## Вероятно затронутые файлы

- `apps/www/src/compare/lib/styles.architecture.test.ts`

## Зависимости

Нет. Это первая задача.
