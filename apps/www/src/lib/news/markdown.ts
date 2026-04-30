import { absoluteUrl } from '../site';
import {
  agentsMarkdownUrl,
  agentsUrl,
  apiCatalogUrl,
  articlesDataUrl,
  articlesOpenApiUrl,
  articlesSchemaUrl,
  feedUrl,
  llmsFullUrl,
  llmsUrl,
  newsMarkdownUrl,
  newsUrl,
  tagsMarkdownUrl,
  tagsUrl,
  yearUrl,
} from './routes';
import type {
  NewsAddendum,
  NewsArticle,
  NewsAttachment,
  NewsDataset,
  NewsListArticle,
  NewsMonthArchive,
  NewsPhoto,
  NewsTagPage,
  NewsYearArchive,
} from './schema';
import {
  formatNewsArea,
  formatNewsAuthor,
  formatNewsDate,
  formatNewsMonth,
} from './view';

export const NEWS_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

interface MarkdownLink {
  readonly label: string;
  readonly href: string;
  readonly note?: string;
  readonly status?: string;
}

function abs(value: string): string {
  return absoluteUrl(value);
}

function join(lines: readonly string[]): string {
  return `${lines.join('\n')}\n`;
}

function pick<T>(items: readonly (T | undefined)[]): readonly T[] {
  return items.filter((item): item is T => item !== undefined);
}

function row(label: string, value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return `- ${label}: ${value}`;
}

function ref(item: MarkdownLink): string {
  return `- ${item.label}: ${pick([
    item.href,
    item.note,
    item.status ? `статус: ${item.status}` : undefined,
  ]).join(' — ')}`;
}

function section(title: string, rows: readonly string[]): readonly string[] {
  return [`## ${title}`, ...(rows.length > 0 ? rows : ['- Нет данных.']), ''];
}

function text(title: string, body: readonly string[]): readonly string[] {
  return [`## ${title}`, ...body, ''];
}

function inline(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function areas(
  item: Pick<NewsArticle, 'applies_to_all_areas' | 'areas'>,
): string {
  if (item.applies_to_all_areas) {
    return 'все части поселка';
  }

  return item.areas.map((area) => formatNewsArea(area)).join(', ');
}

function tags(
  items:
    | Pick<NewsListArticle, 'tags'>['tags']
    | Pick<NewsArticle, 'tags'>['tags'],
): string {
  if (items.length === 0) {
    return 'нет';
  }

  return items.map((item) => `${item.label} (${abs(item.url)})`).join('; ');
}

function when(iso: string, time?: string): string {
  return time ? `${formatNewsDate(iso)}, ${time}` : formatNewsDate(iso);
}

function photoLine(label: string, photo: NewsPhoto): string {
  return `- ${label}: ${pick([
    abs(photo.url),
    `alt: ${inline(photo.alt)}`,
    photo.caption ? `подпись: ${inline(photo.caption)}` : undefined,
  ]).join(' — ')}`;
}

function photoSection(article: NewsArticle): readonly string[] {
  const rows = pick<string>([
    article.cover_url
      ? `- Обложка: ${pick([
          abs(article.cover_url),
          `alt: ${inline(article.cover_alt ?? article.title)}`,
        ]).join(' — ')}`
      : undefined,
    ...article.photos.map((photo, index) =>
      photoLine(`Фото ${index + 1}`, photo),
    ),
  ]);

  return rows.length > 0 ? section('Фото', rows) : [];
}

function addendumPhotoSection(items: readonly NewsPhoto[]): readonly string[] {
  if (items.length === 0) {
    return [];
  }

  return [
    '#### Фото',
    ...items.map((photo, index) => photoLine(`Фото ${index + 1}`, photo)),
    '',
  ];
}

function attachmentLine(item: NewsAttachment): string {
  return `- ${item.title}: ${pick([abs(item.url), item.type, item.size]).join(
    ' — ',
  )}`;
}

function attachmentSection(
  items: readonly NewsAttachment[],
): readonly string[] {
  return items.length > 0 ? section('Вложения', items.map(attachmentLine)) : [];
}

function addendumAttachmentSection(
  items: readonly NewsAttachment[],
): readonly string[] {
  if (items.length === 0) {
    return [];
  }

  return ['#### Вложения', ...items.map(attachmentLine), ''];
}

function articleLine(article: NewsListArticle): string {
  return `- ${article.title} — ${pick([
    `HTML: ${abs(article.url)}`,
    `Markdown: ${abs(article.markdown_url)}`,
    `дата: ${when(article.published_iso, article.time)}`,
    `summary: ${inline(article.summary)}`,
    article.is_official ? 'официально: да' : undefined,
    article.updated_iso ? `обновлено: ${when(article.updated_iso)}` : undefined,
  ]).join('; ')}`;
}

function articleSection(
  title: string,
  items: readonly NewsListArticle[],
  empty: string,
  intro?: string,
): readonly string[] {
  return [
    `## ${title}`,
    ...(intro ? [intro, ''] : []),
    ...(items.length > 0 ? items.map(articleLine) : [`- ${empty}`]),
    '',
  ];
}

function keyLinks(items: readonly MarkdownLink[]): readonly string[] {
  return section('Ключевые ссылки', items.map(ref));
}

function discoveryLinks(): readonly MarkdownLink[] {
  return [
    {
      label: 'JSON feed раздела',
      href: abs(articlesDataUrl()),
      note: 'основной structured feed news-section с full body_markdown и addenda',
    },
    {
      label: 'RSS раздела',
      href: abs(feedUrl()),
      note: 'summary-first RSS без раскрытия полного body и текста addenda',
    },
    {
      label: 'llms.txt',
      href: abs(llmsUrl()),
      note: 'короткий агентный обзор по маршрутам и правилам чтения раздела',
    },
    {
      label: 'llms-full.txt',
      href: abs(llmsFullUrl()),
      note: 'расширенное описание feed, archives, tags и addenda',
    },
  ];
}

function articleMeta(article: NewsArticle): readonly string[] {
  return section(
    'Метаданные',
    pick([
      row('Дата', formatNewsDate(article.published_iso)),
      row('Время', article.time),
      row('Автор', formatNewsAuthor(article.author)),
      row(
        'Официальность',
        article.is_official
          ? 'официальная новость'
          : 'неофициальная публикация',
      ),
      row('Areas', areas(article)),
      row('Теги', tags(article.tags)),
      row('Источник', article.source_url ? abs(article.source_url) : undefined),
      row(
        'Обновлено',
        article.updated_iso
          ? when(article.updated_iso, article.addenda.at(-1)?.time)
          : undefined,
      ),
    ]),
  );
}

function addendaSection(items: readonly NewsAddendum[]): readonly string[] {
  if (items.length === 0) {
    return [];
  }

  const lines: string[] = [
    '## Дополнено',
    'Исходный текст новости не переписывается: поздние уточнения остаются отдельными блоками.',
    '',
  ];

  for (const [index, item] of items.entries()) {
    lines.push(
      `### ${item.title ?? `Дополнение ${index + 1} от ${formatNewsDate(item.published_iso)}`}`,
    );
    lines.push(
      ...pick([
        row('Дата', formatNewsDate(item.published_iso)),
        row('Время', item.time),
        row('Автор', formatNewsAuthor(item.author)),
        row(
          'Официальность',
          item.author.is_official
            ? 'официальное дополнение'
            : 'community/editorial дополнение',
        ),
        row('Источник', item.source_url ? abs(item.source_url) : undefined),
      ]),
    );
    lines.push('');

    if (item.body) {
      lines.push(item.body.trim(), '');
    }

    lines.push(...addendumPhotoSection(item.photos));
    lines.push(...addendumAttachmentSection(item.attachments));
  }

  return [...lines, ''];
}

function monthLine(item: NewsMonthArchive): string {
  return `- ${formatNewsMonth(item.year, item.month, { capitalize: true })}: ${pick(
    [
      `HTML: ${abs(item.url)}`,
      `Markdown: ${abs(item.markdown_url)}`,
      `${item.count} публикаций`,
    ],
  ).join('; ')}`;
}

function tagLine(item: NewsTagPage): string {
  return `- ${item.label} — ${pick([
    `HTML: ${abs(item.url)}`,
    `Markdown: ${abs(item.markdown_url)}`,
    `${item.count} публикаций`,
  ]).join('; ')}`;
}

export function buildNewsHomeMarkdown(data: NewsDataset): string {
  const normalCount = data.articles.length - data.home.pinned.length;
  const recentMonths = data.archives.years
    .flatMap((item) => item.months)
    .slice(0, 6);
  const topTags = data.tags.slice(0, 12);

  return join([
    '# Новости Шелково',
    '',
    'Новости поселков Шелково и сервисов ОК Комфорт: краткие сводки, pinned-публикации, архивы по годам и месяцам и навигация по редакционным тегам.',
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(newsUrl()) },
      { label: 'Markdown', href: abs(newsMarkdownUrl()) },
      { label: 'Для агентов', href: abs(agentsUrl()) },
      { label: 'Markdown for agents', href: abs(agentsMarkdownUrl()) },
      { label: 'Теги', href: abs(tagsUrl()) },
      ...discoveryLinks(),
    ]),
    ...section('Сводка', [
      `- Всего новостей: ${data.articles.length}`,
      `- Закреплено: ${data.home.pinned.length}`,
      `- Тегов: ${data.tags.length}`,
      `- Лет в архиве: ${data.archives.years.length}`,
    ]),
    ...articleSection(
      'Закреплено',
      data.home.pinned,
      'Сейчас закрепленных публикаций нет.',
    ),
    ...articleSection(
      'Последние новости',
      data.home.latest,
      'Первые публикации для раздела готовятся.',
      normalCount > data.home.latest.length
        ? 'На главной companion-странице показываем только последние 10 обычных новостей; более старые публикации остаются в архивах.'
        : undefined,
    ),
    ...section(
      'Архивы по годам',
      data.archives.years.length > 0
        ? data.archives.years.map(
            (item) =>
              `- ${item.year} — HTML: ${abs(item.url)}; Markdown: ${abs(item.markdown_url)}; ${item.count} публикаций`,
          )
        : ['- Архивы появятся вместе с первыми публикациями.'],
    ),
    ...section(
      'Последние месяцы',
      recentMonths.length > 0
        ? recentMonths.map(monthLine)
        : ['- Пока нет месячных архивов.'],
    ),
    ...section(
      'Теги',
      topTags.length > 0
        ? topTags.map(tagLine)
        : [
            '- Теги появятся автоматически после первых тематических публикаций.',
          ],
    ),
  ]);
}

export function buildNewsYearMarkdown(archive: NewsYearArchive): string {
  const lines: string[] = [
    `# Новости Шелково за ${archive.year} год`,
    '',
    `Годовой архив новостей Шелково за ${archive.year} год: месяцы с количеством публикаций и краткая хронологическая лента без reshuffle pinned-материалов.`,
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(archive.url) },
      { label: 'Markdown', href: abs(archive.markdown_url) },
      { label: 'Главная news-section', href: abs(newsUrl()) },
      { label: 'Для агентов', href: abs(agentsUrl()) },
      ...discoveryLinks(),
    ]),
    ...section('Сводка', [
      `- Год: ${archive.year}`,
      `- Месяцев с публикациями: ${archive.months.length}`,
      `- Всего публикаций: ${archive.count}`,
    ]),
    ...section(
      'Месяцы года',
      archive.months.length > 0
        ? archive.months.map(monthLine)
        : ['- В этом году пока нет публикаций.'],
    ),
    '## Публикации по месяцам',
    '',
  ];

  if (archive.months.length === 0) {
    lines.push('- В этом году пока нет публикаций.', '');
    return join(lines);
  }

  for (const item of archive.months) {
    lines.push(
      `### ${formatNewsMonth(item.year, item.month, { capitalize: true })}`,
    );
    lines.push(...item.articles.map(articleLine), '');
  }

  return join(lines);
}

export function buildNewsMonthMarkdown(input: {
  readonly archive: NewsMonthArchive;
  readonly newer?: NewsMonthArchive;
  readonly older?: NewsMonthArchive;
}): string {
  const { archive, newer, older } = input;
  const monthName = formatNewsMonth(archive.year, archive.month, {
    capitalize: true,
  });

  return join([
    `# ${monthName}`,
    '',
    `Месячный архив новостей Шелково за ${formatNewsMonth(archive.year, archive.month)}: все публикации месяца в кратком формате без раскрытия полного body и текста addenda.`,
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(archive.url) },
      { label: 'Markdown', href: abs(archive.markdown_url) },
      {
        label: `Годовой архив ${archive.year}`,
        href: abs(yearUrl(archive.year)),
      },
      { label: 'Для агентов', href: abs(agentsUrl()) },
      ...discoveryLinks(),
    ]),
    ...section(
      'Навигация',
      pick([
        `- Годовой архив: ${abs(yearUrl(archive.year))}`,
        newer
          ? `- Более новый месяц: ${abs(newer.url)} (${formatNewsMonth(newer.year, newer.month, { capitalize: true })})`
          : undefined,
        older
          ? `- Более ранний месяц: ${abs(older.url)} (${formatNewsMonth(older.year, older.month, { capitalize: true })})`
          : undefined,
      ]),
    ),
    ...articleSection(
      'Публикации месяца',
      archive.articles,
      'В этом месяце пока нет публикаций.',
    ),
  ]);
}

export function buildNewsArticleMarkdown(article: NewsArticle): string {
  return join([
    `# ${article.title}`,
    '',
    ...keyLinks([
      { label: 'HTML', href: article.canonical },
      { label: 'Markdown', href: abs(article.markdown_url) },
      {
        label: 'JSON feed раздела',
        href: abs(articlesDataUrl()),
        note: 'полный machine-readable feed с body_markdown и addenda',
      },
      {
        label: 'RSS раздела',
        href: abs(feedUrl()),
        note: 'summary-first RSS для подписки и машинного обхода',
      },
    ]),
    ...articleMeta(article),
    ...text('Кратко', [article.summary]),
    ...(article.body ? ['## Основной текст', '', article.body.trim(), ''] : []),
    ...photoSection(article),
    ...attachmentSection(article.attachments),
    ...addendaSection(article.addenda),
  ]);
}

export function buildNewsTagsMarkdown(
  tagsPage: readonly NewsTagPage[],
): string {
  return join([
    '# Теги новостей Шелково',
    '',
    'Навигация по редакционным тегам news-section: темы, события и локальные сюжеты. Внутри каждого тега в v1 показываем только последние 10 новостей без пагинации.',
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(tagsUrl()) },
      { label: 'Markdown', href: abs(tagsMarkdownUrl()) },
      { label: 'Главная news-section', href: abs(newsUrl()) },
      { label: 'Для агентов', href: abs(agentsUrl()) },
      ...discoveryLinks(),
    ]),
    ...section('Сводка', [`- Всего тегов: ${tagsPage.length}`]),
    ...section(
      'Теги',
      tagsPage.length > 0
        ? tagsPage.map(tagLine)
        : ['- Индекс появится автоматически после первых новостей с тегами.'],
    ),
  ]);
}

export function buildNewsTagMarkdown(tag: NewsTagPage): string {
  return join([
    `# Тег «${tag.label}»`,
    '',
    `Последние новости Шелково по тегу «${tag.label}». В v1 страница тега показывает до 10 последних публикаций без пагинации.`,
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(tag.url) },
      { label: 'Markdown', href: abs(tag.markdown_url) },
      { label: 'Индекс тегов', href: abs(tagsUrl()) },
      { label: 'Markdown-индекс тегов', href: abs(tagsMarkdownUrl()) },
      { label: 'Для агентов', href: abs(agentsUrl()) },
      ...discoveryLinks(),
    ]),
    ...section('Сводка', [
      `- Тег: ${tag.label}`,
      `- Всего публикаций по тегу: ${tag.count}`,
      `- В companion-странице показано: ${tag.latest.length}`,
    ]),
    ...articleSection(
      'Последние новости',
      tag.latest,
      'По этому тегу пока нет публикаций.',
      tag.count > tag.latest.length
        ? 'В v1 страница тега честно показывает только последние 10 публикаций; более старые материалы остаются доступны через месячные и годовые архивы.'
        : undefined,
    ),
  ]);
}

export function buildNewsAgentsMarkdown(data: NewsDataset): string {
  const exampleArticle = data.articles[0];
  const exampleYear = data.archives.years[0];
  const exampleMonth = exampleYear?.months[0];
  const exampleTag = data.tags[0];

  return join([
    '# Для агентов: news-section',
    '',
    'Text-first обзор HTML-страниц, markdown companions и discovery-роутов news-section. HTML detail pages остаются каноническими, markdown companions дают прямой текстовый слой, а JSON/RSS/schema/openapi routes собираются из того же derive-слоя без SSR.',
    '',
    ...keyLinks([
      { label: 'HTML', href: abs(agentsUrl()) },
      { label: 'Markdown', href: abs(agentsMarkdownUrl()) },
      { label: 'Главная news-section', href: abs(newsUrl()) },
      { label: 'Markdown news home', href: abs(newsMarkdownUrl()) },
    ]),
    ...section('Сводка', [
      `- Статей: ${data.articles.length}`,
      `- Тегов: ${data.tags.length}`,
      `- Лет в архиве: ${data.archives.years.length}`,
    ]),
    ...section('HTML pages', [
      ref({
        label: '/news/',
        href: abs(newsUrl()),
        note: 'главная лента с pinned-блоком, последними обычными новостями, архивами и тегами',
      }),
      ref({
        label: exampleYear?.url ?? '/news/YYYY/',
        href: exampleYear ? abs(exampleYear.url) : '/news/YYYY/',
        note: 'годовой архив: месяцы с количеством новостей и лента по месяцам',
      }),
      ref({
        label: exampleMonth?.url ?? '/news/YYYY/MM/',
        href: exampleMonth ? abs(exampleMonth.url) : '/news/YYYY/MM/',
        note: 'месячный архив: все новости конкретного месяца в кратком формате',
      }),
      ref({
        label: exampleArticle?.url ?? '/news/YYYY/MM/[entry]/',
        href: exampleArticle
          ? exampleArticle.canonical
          : '/news/YYYY/MM/[entry]/',
        note: 'каноническая detail-страница новости с body, фото, вложениями и addenda',
      }),
      ref({
        label: '/news/tags/',
        href: abs(tagsUrl()),
        note: 'индекс всех тегов news-section',
      }),
      ref({
        label: exampleTag?.url ?? '/news/tags/[tag]/',
        href: exampleTag ? abs(exampleTag.url) : '/news/tags/[tag]/',
        note: 'последние 10 новостей по тегу без пагинации в v1',
      }),
      ref({
        label: '/news/for-agents/',
        href: abs(agentsUrl()),
        note: 'человекочитаемая документация по surface и discovery маршрутам',
      }),
    ]),
    ...section('Markdown companions', [
      ref({
        label: '/news/index.md',
        href: abs(newsMarkdownUrl()),
        note: 'text-first companion для главной news-страницы',
      }),
      ref({
        label: exampleYear?.markdown_url ?? '/news/YYYY/index.md',
        href: exampleYear
          ? abs(exampleYear.markdown_url)
          : '/news/YYYY/index.md',
        note: 'markdown-версия годового архива',
      }),
      ref({
        label: exampleMonth?.markdown_url ?? '/news/YYYY/MM/index.md',
        href: exampleMonth
          ? abs(exampleMonth.markdown_url)
          : '/news/YYYY/MM/index.md',
        note: 'markdown-версия месячного архива',
      }),
      ref({
        label: exampleArticle?.markdown_url ?? '/news/YYYY/MM/[entry]/index.md',
        href: exampleArticle
          ? abs(exampleArticle.markdown_url)
          : '/news/YYYY/MM/[entry]/index.md',
        note: 'markdown detail page с метаданными, summary, full body и addenda',
      }),
      ref({
        label: '/news/tags/index.md',
        href: abs(tagsMarkdownUrl()),
        note: 'markdown-индекс всех тегов',
      }),
      ref({
        label: exampleTag?.markdown_url ?? '/news/tags/[tag]/index.md',
        href: exampleTag
          ? abs(exampleTag.markdown_url)
          : '/news/tags/[tag]/index.md',
        note: 'markdown-версия страницы тега с последними 10 новостями',
      }),
      ref({
        label: '/news/for-agents/index.md',
        href: abs(agentsMarkdownUrl()),
        note: 'text-first overview discovery surface для агентов',
      }),
    ]),
    ...section('Feed и discovery', [
      ref({
        label: '/news/data/articles.json',
        href: abs(articlesDataUrl()),
        note: 'основной structured feed для агентов и машинного обхода',
      }),
      ref({
        label: '/news/feed.xml',
        href: abs(feedUrl()),
        note: 'RSS с summary-based описаниями без разворачивания full body',
      }),
      ref({
        label: '/news/llms.txt',
        href: abs(llmsUrl()),
        note: 'короткая текстовая сводка по маршрутам и правилам чтения раздела',
      }),
      ref({
        label: '/news/llms-full.txt',
        href: abs(llmsFullUrl()),
        note: 'расширенная версия llms.txt с описанием payload, tags, archives и addenda',
      }),
      ref({
        label: '/news/.well-known/api-catalog',
        href: abs(apiCatalogUrl()),
        note: 'linkset JSON для автоматического discovery feed/schema/docs',
      }),
      ref({
        label: '/news/schemas/articles.schema.json',
        href: abs(articlesSchemaUrl()),
        note: 'JSON Schema для полного news feed',
      }),
      ref({
        label: '/news/openapi/articles.openapi.json',
        href: abs(articlesOpenApiUrl()),
        note: 'read-only OpenAPI 3.1-обертка вокруг основного feed route',
      }),
    ]),
    ...section('Что значит addenda', [
      '- `addenda` — это поздние уточнения, редакторские комментарии или новые подтвержденные факты, которые не переписывают исходный текст новости.',
      '- `addenda` хранятся внутри того же article source file, что и исходная новость, а не в отдельной collection.',
      '- На list/archive/tag pages показывается только summary новости и, при необходимости, пометка `обновлено`; текст addenda там не раскрывается.',
      '- На detail HTML/Markdown page addenda идут отдельным блоком `Дополнено` и сортируются по возрастанию даты.',
    ]),
    ...section('Official news vs community addenda', [
      '- Официальность определяется author entry, а не отдельным boolean в статье.',
      '- Официальная новость может получить community/editorial addenda без переписывания исходного body.',
      '- Поздние addenda не поднимают новость вверх в списках; меняется только `updated_at` и пометка `Обновлено ...`.',
    ]),
    ...section('Media caveat', [
      '- Для machine-readable media полагайтесь на `cover`, `photos` и `attachments`: в companion-страницах они отдаются абсолютными URL.',
      '- Inline markdown images с локальными относительными путями внутри raw body companion route автоматически не переписывает.',
    ]),
  ]);
}
