# Сетка, медиа и быстрый патч

См. точку входа: [`docs/design/design-code-shelkovo.md`](../design-code-shelkovo.md).

## 14. Сетка и отступы

Для информационного сервиса лучше чуть плотнее, чем для лендинга.

```css
:root {
  --container: 1180px;
  --page-padding: clamp(1rem, 3vw, 2rem);
  --space-section: clamp(2.5rem, 6vw, 4.5rem);
}

.container {
  width: min(100% - var(--page-padding) * 2, var(--container));
  margin-inline: auto;
}

.grid-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 760px) {
  .grid-stats {
    grid-template-columns: 1fr;
  }
}
```

## 15. Фотографии и иллюстрации

Фото должны давать свежесть, а не сепию. Не накладывать теплые фильтры на все изображения.

```css
.photo {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface-muted);
  box-shadow: var(--shadow-md);
}

.photo--cover {
  object-fit: cover;
}
```

Запрещено для фото:

- `sepia()`;
- сильный желтый overlay;
- прозрачная кремовая плашка поверх фото;
- blur как постоянный декоративный эффект.

## 17. Быстрый патч для текущего экрана

Минимальный набор правок, который сразу уберет пыльность:

```css
body {
  background: oklch(99.1% 0.002 125);
  color: oklch(24% 0.04 145);
}

.page,
.detail-page {
  background: oklch(99.1% 0.002 125);
}

.card,
.stat-card,
.table-shell,
.source-card {
  background: oklch(100% 0 0);
  border-color: oklch(89.2% 0.012 130);
  box-shadow: 0 0.25rem 0.75rem oklch(24% 0.04 145 / 0.055);
  backdrop-filter: none;
}

h1,
h2,
h3,
.title {
  color: oklch(24% 0.04 145);
}

.meta,
.caption,
.text-muted {
  color: oklch(46% 0.02 135);
}

.table th {
  background: oklch(96.8% 0.008 135);
  color: oklch(46% 0.02 135);
}

.table th,
.table td {
  border-bottom-color: oklch(89.2% 0.012 130);
}

.source-card:hover {
  background: oklch(98.2% 0.006 140);
}

.badge--unknown {
  color: oklch(48% 0.04 125);
  background: oklch(94% 0.012 125);
  border-color: oklch(83% 0.02 125);
}

.badge--success {
  color: oklch(53% 0.12 145);
  background: oklch(94.5% 0.04 145);
  border-color: oklch(78% 0.07 145);
}

.badge--warning {
  color: oklch(43% 0.09 68);
  background: oklch(95% 0.065 78);
  border-color: oklch(84% 0.11 76);
}

.badge--danger {
  color: oklch(54% 0.145 28);
  background: oklch(95.2% 0.045 25);
  border-color: oklch(81% 0.08 25);
}
```
