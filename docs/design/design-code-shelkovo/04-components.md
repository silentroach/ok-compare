# Компонентные паттерны

См. точку входа: [`docs/design/design-code-shelkovo.md`](../design-code-shelkovo.md).

## 7. Карточки статистики

На текущем экране верхние карточки должны быть чище и контрастнее.

```css
.stat-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.125rem;
  box-shadow: var(--shadow-sm);
}

.stat-card__label {
  color: var(--color-text-muted);
  font-size: var(--text-caption);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stat-card__value {
  margin-top: 0.35rem;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 850;
}

.stat-card__note {
  margin-top: 0.35rem;
  color: var(--color-text-soft);
  font-size: var(--text-caption);
  font-weight: 650;
}
```

## 8. Таблицы

Таблица не должна выглядеть как бумажная ведомость. Шапка - легкая зеленая, строки - чистые, разделители - отчетливые.

```css
.table-shell {
  padding: 1.5rem;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: var(--text-caption);
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: left;
  text-transform: uppercase;
}

.table th,
.table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.table td {
  color: var(--color-text);
  font-weight: 650;
}

.table tr:hover td {
  background: var(--color-primary-soft-2);
}
```

## 9. Бейджи статусов

Статусы должны быть компактными, читаемыми и не грязно-бежевыми.

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.75rem;
  padding-inline: 0.7rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-size: var(--text-caption);
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.badge--success {
  color: var(--color-success);
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
}

.badge--warning {
  color: oklch(43% 0.09 68);
  background: var(--color-warning-soft);
  border-color: var(--color-warning-border);
}

.badge--danger {
  color: var(--color-danger);
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
}

.badge--water {
  color: var(--color-water);
  background: var(--color-water-soft);
  border-color: var(--color-water-border);
}

.badge--unknown {
  color: var(--color-unknown);
  background: var(--color-unknown-soft);
  border-color: var(--color-unknown-border);
}
```

## 10. Кнопки и ссылки

Основная кнопка - глубокий зеленый. Акцентная - только для одного главного действия.

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding-inline: 1.15rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-surface-raised);
  font-weight: 800;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
}

.button-primary:hover {
  background: var(--color-primary-hover);
}

.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding-inline: 1.15rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-primary);
  font-weight: 800;
  text-decoration: none;
}

.button-secondary:hover {
  background: var(--color-primary-soft-2);
  border-color: var(--color-primary);
}

.link {
  color: var(--color-primary);
  font-weight: 750;
  text-decoration-color: oklch(38.5% 0.105 143 / 0.35);
  text-underline-offset: 0.18em;
}

.link:hover {
  color: var(--color-primary-hover);
  text-decoration-color: currentColor;
}
```

## 11. Иконки

Иконки в текущем экране лучше сделать темнее и убрать мутные подложки.

```css
.icon {
  color: var(--color-primary);
}

.icon-button {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.icon-button:hover {
  background: var(--color-primary-soft-2);
  border-color: var(--color-border-strong);
}
```

## 12. Карта и пустые состояния

Серый или размытый блок карты усиливает ощущение грязи. Если API-ключ не настроен, нужен чистый placeholder.

```css
.map-placeholder {
  display: grid;
  place-items: center;
  min-height: 14rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(oklch(88% 0.012 135 / 0.35) 1px, transparent 1px),
    linear-gradient(90deg, oklch(88% 0.012 135 / 0.35) 1px, transparent 1px),
    oklch(98.8% 0.003 125);
  background-size: 32px 32px;
  color: var(--color-text-muted);
  text-align: center;
}

.map-placeholder__title {
  color: var(--color-text);
  font-weight: 850;
}

.map-placeholder__text {
  color: var(--color-text-muted);
  font-size: var(--text-small);
}
```

## 13. Шапка страницы поселка

Для страницы конкретного поселка использовать крупный заголовок и чистые метаданные.

```css
.place-header {
  padding-block: clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding-inline: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  color: var(--color-primary);
  font-weight: 800;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
}

.place-title {
  margin-top: 1.5rem;
  margin-bottom: 0.35rem;
  max-width: 48rem;
}

.place-subtitle {
  color: var(--color-text-muted);
  font-weight: 700;
}

.place-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
}
```
