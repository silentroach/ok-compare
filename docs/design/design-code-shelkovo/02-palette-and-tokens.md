# Палитра и CSS-токены

См. точку входа: [`docs/design/design-code-shelkovo.md`](../design-code-shelkovo.md).

## 3. Палитра

Все цвета задаются только через `oklch()`.

### 3.1. Цвета, снятые с логотипа

Эти цвета полезны как ориентир, но не все нужно переносить напрямую в интерфейс.

| Назначение                      |                       Цвет |
| ------------------------------- | -------------------------: |
| Глубокий зеленый забора         | `oklch(46.2% 0.068 123.5)` |
| Средний зеленый забора          | `oklch(59.7% 0.084 116.8)` |
| Солнце из логотипа              |  `oklch(83.1% 0.133 77.8)` |
| Кремовая бумажная база логотипа | `oklch(91.9% 0.020 103.5)` |

Важно: кремовый цвет из логотипа не использовать как главный фон сайта. На больших площадях он дает пыльность.

### 3.2. Интерфейсная палитра v2

| Токен                    |                 Значение | Роль                                                     |
| ------------------------ | -----------------------: | -------------------------------------------------------- |
| `--color-bg`             | `oklch(99.1% 0.002 125)` | Основной фон страницы                                    |
| `--color-bg-soft`        | `oklch(98.8% 0.003 125)` | Нейтральная подложка секций                              |
| `--color-surface`        |        `oklch(100% 0 0)` | Карточки, панели, таблицы                                |
| `--color-surface-raised` |        `oklch(100% 0 0)` | Верхние карточки, модалки                                |
| `--color-surface-muted`  | `oklch(96.8% 0.008 135)` | Шапки таблиц, очень легкие служебные подложки            |
| `--color-border`         | `oklch(89.2% 0.012 130)` | Обычные границы                                          |
| `--color-border-strong`  | `oklch(82.0% 0.018 130)` | Важные границы, hover                                    |
| `--color-text`           | `oklch(24.0% 0.040 145)` | Основной текст                                           |
| `--color-text-muted`     | `oklch(46.0% 0.020 135)` | Вторичный текст                                          |
| `--color-text-soft`      | `oklch(56.0% 0.015 132)` | Подписи, метаданные                                      |
| `--color-primary`        | `oklch(36.0% 0.115 143)` | Главный зеленый                                          |
| `--color-primary-hover`  | `oklch(30.0% 0.105 143)` | Hover главного зеленого                                  |
| `--color-primary-soft`   | `oklch(96.5% 0.014 140)` | Подложка активного фильтра и локальных зеленых состояний |
| `--color-primary-soft-2` | `oklch(98.2% 0.006 140)` | Очень легкий hover/focus фон                             |
| `--color-accent`         |  `oklch(83.0% 0.155 78)` | Солнечный акцент                                         |
| `--color-accent-hover`   |  `oklch(76.0% 0.165 72)` | Hover акцента                                            |
| `--color-accent-soft`    |  `oklch(94.8% 0.060 82)` | Мягкая солнечная подложка                                |
| `--color-earth`          |  `oklch(45.0% 0.060 72)` | Земляной вторичный акцент                                |

### 3.3. Статусные цвета

| Токен                    |                 Значение | Роль                         |
| ------------------------ | -----------------------: | ---------------------------- |
| `--color-success`        | `oklch(53.0% 0.120 145)` | "Есть", успех                |
| `--color-success-soft`   | `oklch(94.5% 0.040 145)` | Фон успеха                   |
| `--color-success-border` | `oklch(78.0% 0.070 145)` | Граница успеха               |
| `--color-warning`        |  `oklch(73.0% 0.150 73)` | Частично, предупреждение     |
| `--color-warning-soft`   |  `oklch(95.0% 0.065 78)` | Фон предупреждения           |
| `--color-warning-border` |  `oklch(84.0% 0.110 76)` | Граница предупреждения       |
| `--color-danger`         |  `oklch(54.0% 0.145 28)` | "Нет", ошибка                |
| `--color-danger-soft`    |  `oklch(95.2% 0.045 25)` | Фон ошибки                   |
| `--color-danger-border`  |  `oklch(81.0% 0.080 25)` | Граница ошибки               |
| `--color-water`          | `oklch(46.0% 0.090 235)` | Плашка "вода в тарифе"       |
| `--color-water-soft`     | `oklch(95.6% 0.022 230)` | Фон водяной плашки           |
| `--color-water-border`   | `oklch(84.0% 0.050 228)` | Граница водяной плашки       |
| `--color-unknown`        | `oklch(48.0% 0.040 125)` | Неизвестно                   |
| `--color-unknown-soft`   | `oklch(96.8% 0.004 125)` | Фон неизвестного статуса     |
| `--color-unknown-border` | `oklch(88.5% 0.008 130)` | Граница неизвестного статуса |

## 4. CSS-токены

```css
:root {
  color-scheme: light;

  --color-bg: oklch(99.1% 0.002 125);
  --color-bg-soft: oklch(98.8% 0.003 125);
  --color-surface: oklch(100% 0 0);
  --color-surface-raised: oklch(100% 0 0);
  --color-surface-muted: oklch(96.8% 0.008 135);
  --color-border: oklch(89.2% 0.012 130);
  --color-border-strong: oklch(82% 0.018 130);

  --color-text: oklch(24% 0.04 145);
  --color-text-muted: oklch(46% 0.02 135);
  --color-text-soft: oklch(56% 0.015 132);

  --color-primary: oklch(36% 0.115 143);
  --color-primary-hover: oklch(30% 0.105 143);
  --color-primary-soft: oklch(96.5% 0.014 140);
  --color-primary-soft-2: oklch(98.2% 0.006 140);

  --color-accent: oklch(83% 0.155 78);
  --color-accent-hover: oklch(76% 0.165 72);
  --color-accent-soft: oklch(94.8% 0.06 82);

  --color-earth: oklch(45% 0.06 72);

  --color-success: oklch(53% 0.12 145);
  --color-success-soft: oklch(94.5% 0.04 145);
  --color-success-border: oklch(78% 0.07 145);

  --color-warning: oklch(73% 0.15 73);
  --color-warning-soft: oklch(95% 0.065 78);
  --color-warning-border: oklch(84% 0.11 76);

  --color-danger: oklch(54% 0.145 28);
  --color-danger-soft: oklch(95.2% 0.045 25);
  --color-danger-border: oklch(81% 0.08 25);

  --color-water: oklch(46% 0.09 235);
  --color-water-soft: oklch(95.6% 0.022 230);
  --color-water-border: oklch(84% 0.05 228);

  --color-unknown: oklch(48% 0.04 125);
  --color-unknown-soft: oklch(96.8% 0.004 125);
  --color-unknown-border: oklch(88.5% 0.008 130);

  --shadow-sm: 0 0.25rem 0.75rem oklch(27% 0.05 142 / 0.055);
  --shadow-md: 0 0.75rem 2rem oklch(27% 0.05 142 / 0.085);
  --shadow-lg: 0 1.25rem 3.5rem oklch(27% 0.05 142 / 0.11);

  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-pill: 999px;
}
```
