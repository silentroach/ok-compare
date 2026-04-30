# Базовые правила интерфейса

См. точку входа: [`docs/design/design-code-shelkovo.md`](../design-code-shelkovo.md).

## 5. Главные правила против "пыли"

### 5.1. Фон

Фон страницы должен быть почти белым и спокойным. Зеленый подтон допускается только на уровне ощущения, а не заметного градиента. Не использовать желтый, песочный и бумажный фон на всю страницу. Не заливать большие площади soft-зеленым.

```css
body {
  color: var(--color-text);
  background: var(--color-bg);
}

.page {
  background: var(--color-bg);
}
```

Если нужен декоративный световой акцент на лендинговом первом экране, он должен быть очень слабым и занимать малую площадь. Для информационных экранов, таблиц, карт и detail-страниц градиенты лучше отключить полностью:

```css
.page-data {
  background: var(--color-bg);
}
```

### 5.2. Поверхности

Карточки должны быть заметно белее фона. Нельзя делать их полупрозрачными. Большие панели, source-card, stat-card и table-shell должны оставаться белыми, без зеленой заливки.

```css
.card,
.panel,
.table-shell,
.source-card,
.stat-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.card:hover,
.panel:hover,
.source-card:hover {
  background: var(--color-primary-soft-2);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
}
```

Soft-зеленый использовать только локально:

- active filter;
- hover строки или source-card;
- success badge;
- table header;
- небольшие status/focus зоны.

Для основного сайта `kpshelkovo.online` базовый паттерн еще суше: по умолчанию не собирать страницу из стопки карточек со скруглением. Новости, архивы, текстовые секции и служебные блоки лучше держать как открытые панели с одним верхним разделителем, без радиуса и без тени. Более карточный язык допустим в `compare`, где он помогает читать плотные данные.

```css
.page-section {
  border-top: 1px solid var(--color-border);
  border-inline: 0;
  border-bottom: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.page-section--strong {
  border-top-width: 2px;
  border-top-color: var(--color-border-strong);
}
```

### 5.3. Прозрачность и blur

Blur допустим только в шапке и как осознанное исключение для overlay-элементов поверх карты. В обычном контенте он создает мутность.

```css
.site-header {
  background: oklch(100% 0 0 / 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

.card,
.panel,
.table-shell,
.stat-card {
  backdrop-filter: none;
}

.hero-glass {
  border: 1px solid oklch(100% 0 0 / 0.42);
  background: oklch(100% 0 0 / 0.5);
  backdrop-filter: blur(2px);
  box-shadow: 0 0.75rem 2rem oklch(24% 0.03 230 / 0.12);
}

.tooltip-glass,
.map-popup-glass {
  border: 1px solid oklch(100% 0 0 / 0.44);
  background: oklch(100% 0 0 / 0.9);
  backdrop-filter: blur(5px);
  box-shadow: 0 1.1rem 2.5rem oklch(24% 0.03 230 / 0.18);
}
```

Разрешенные glass-исключения:

- кнопка назад поверх hero-карты;
- маленькие плашки над картой;
- tooltip динамически рассчитанного тарифа;
- popup у маркера карты.

Важно: стекло должно быть холодным белым, а не желто-кремовым. У hero-стекла допустима очень мягкая светлая граница, если она читается как блик, а не как рамка.

Для плашек поверх карты лучше держать blur очень слабым, около `2px`. Для tooltip и popup у маркеров допустим более заметный blur, около `5px`.

Tooltip должен быть плотнее hero-плашек, чтобы текст и контент под ним не просвечивали. Hero-стекло при этом может быть более молочным и менее насыщенным, ближе к мягкому frosted-glass из старой версии.

Danger-pill поверх hero лучше делать почти плотным красным, а не стеклянным.

### 5.4. Текст

Основной текст должен быть темным зеленым, но не оливково-серым.

```css
h1,
h2,
h3,
.title {
  color: var(--color-text);
  letter-spacing: -0.035em;
}

.meta,
.caption,
.text-muted {
  color: var(--color-text-muted);
}
```

## 6. Типографика

Для экранов с данными лучше использовать один сильный sans-serif. Засечки можно оставить только для лендинговой главной или декоративных цитат.

```css
:root {
  --font-body:
    'Manrope', 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
  --font-display: 'Manrope', 'Inter', system-ui, sans-serif;

  --text-h1: clamp(2.25rem, 4vw, 3.75rem);
  --text-h2: clamp(1.5rem, 2.4vw, 2.25rem);
  --text-h3: 1.25rem;
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-caption: 0.75rem;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: 1.55;
}

h1 {
  font-size: var(--text-h1);
  line-height: 1.05;
  font-weight: 800;
}

h2 {
  font-size: var(--text-h2);
  line-height: 1.14;
  font-weight: 800;
}
```

## 16. Do / Don't

### Делать

- Использовать почти белый фон `oklch(99.1% 0.002 125)`.
- Делать карточки чистыми и непрозрачными.
- Держать зеленый глубже и холоднее, чем в логотипе.
- Солнечный цвет использовать только для акцентов, статусов и небольших деталей.
- Давать таблицам четкие границы и читаемые строки.
- Убирать декоративные blur-слои в контенте.

### Не делать

- Не использовать кремовый фон из логотипа на всю страницу.
- Не смешивать зеленый с бежевым в каждом компоненте.
- Не делать карточки полупрозрачными.
- Не делать таблицы "бумажными".
- Не использовать мутные тени и большие желтые градиенты.
- Не снижать opacity у основного текста.
