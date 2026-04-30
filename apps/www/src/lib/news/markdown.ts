import { pluralizeRu } from '@shelkovo/format';

import { absoluteUrl } from '../site';
import {
  articlesDataUrl,
  feedUrl,
  llmsFullUrl,
  llmsUrl,
  newsUrl,
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

  return items.map((item) => item.label).join(', ');
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
  const meta = pick<string>([when(article.published_iso, article.time)]);
  const summary = inline(article.summary);

  return `- [${article.title}](${abs(article.markdown_url)})${
    meta.length > 0 ? ` — ${meta.join('; ')}` : ''
  }${summary ? `\n  ${summary}` : ''}`;
}

function articleBlock(input: {
  readonly items: readonly NewsListArticle[];
  readonly empty: string;
  readonly title?: string;
  readonly intro?: string;
  readonly headingLevel?: 2 | 3;
}): readonly string[] {
  const { items, empty, title, intro, headingLevel = 2 } = input;

  return [
    ...(title ? [`${'#'.repeat(headingLevel)} ${title}`] : []),
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
      row('Автор', formatNewsAuthor(article.author, { short: false })),
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
    '## Дополнения',
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
        row('Автор', formatNewsAuthor(item.author, { short: false })),
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
      `${item.count} ${pluralizeRu(item.count, ['публикация', 'публикации', 'публикаций'])}`,
    ],
  ).join('; ')}`;
}

function tagLine(item: NewsTagPage): string {
  return `- [${item.label}](${abs(item.markdown_url)}) — ${item.count} ${pluralizeRu(item.count, ['публикация', 'публикации', 'публикаций'])}`;
}

export function buildNewsHomeMarkdown(data: NewsDataset): string {
  const latest = [...data.home.pinned, ...data.home.latest];
  const normalCount = data.articles.length - data.home.pinned.length;

  return join([
    '# Новости Шелково',
    '',
    'Свежие новости поселков Шелково и сервисов ОК Комфорт в текстовом формате.',
    '',
    ...articleBlock({
      title: 'Новости',
      items: latest,
      empty: 'Первые публикации для раздела готовятся.',
      intro:
        normalCount > data.home.latest.length
          ? 'Закрепленные публикации показаны первыми. Для обычных новостей на главной companion-странице показываем только последние 10 материалов; более старые публикации остаются доступны в архивах.'
          : undefined,
    }),
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
      ...discoveryLinks(),
    ]),
    ...section('Сводка', [
      `- Год: ${archive.year}`,
      `- Месяцев с публикациями: ${archive.months.length} ${pluralizeRu(archive.months.length, ['месяц', 'месяца', 'месяцев'])}`,
      `- Всего публикаций: ${archive.count} ${pluralizeRu(archive.count, ['публикация', 'публикации', 'публикаций'])}`,
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
      ...articleBlock({
        title: formatNewsMonth(item.year, item.month, { capitalize: true }),
        headingLevel: 3,
        items: item.articles,
        empty: 'В этом месяце пока нет публикаций.',
      }),
    );
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
    ...articleBlock({
      title: 'Публикации месяца',
      items: archive.articles,
      empty: 'В этом месяце пока нет публикаций.',
    }),
  ]);
}

export function buildNewsArticleMarkdown(article: NewsArticle): string {
  return join([
    `# ${article.title}`,
    '',
    ...articleMeta(article),
    ...(article.body ? ['## Текст новости', '', article.body.trim(), ''] : []),
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
    `# Тег ${tag.label}`,
    '',
    ...articleBlock({
      title: 'Последние новости по тегу',
      items: tag.latest,
      empty: 'По этому тегу пока нет публикаций.',
      intro:
        tag.count > tag.latest.length
          ? 'В v1 страница тега честно показывает только последние 10 публикаций; более старые материалы остаются доступны через месячные и годовые архивы.'
          : undefined,
    }),
  ]);
}
