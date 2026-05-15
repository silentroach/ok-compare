import { pluralizeRu } from '@shelkovo/format';
import {
  createMarkdownDocument,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

import { absoluteUrl } from '../site';
import { NEWS_LATEST_LIMIT } from './config';
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

const abs = (value: string): string => absoluteUrl(value);

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];
type MarkdownListItem = ReturnType<typeof md.listItem>;

const serialize = (children: readonly MarkdownNode[]): string =>
  serializeMarkdownDocument(createMarkdownDocument({ children }));

const pick = <T>(items: readonly (T | undefined)[]): readonly T[] =>
  items.filter((item): item is T => item !== undefined);

function row(label: string, value?: string): MarkdownListItem | undefined {
  if (!value) {
    return undefined;
  }

  return md.listItem(`${label}: ${value}`);
}

const section = (
  title: string,
  rows: readonly MarkdownListItem[],
): readonly MarkdownNode[] => [
  md.heading(2, title),
  md.list(rows.length > 0 ? rows : [md.listItem('Нет данных.')]),
];

const inline = (value: string): string => value.replace(/\s+/g, ' ').trim();

function areaLabels(
  item: Pick<NewsArticle, 'applies_to_all_areas' | 'areas'>,
): readonly string[] {
  if (item.applies_to_all_areas) {
    return [];
  }

  return item.areas.map((area) => formatNewsArea(area));
}

function tagLabels(
  items:
    | Pick<NewsListArticle, 'tags'>['tags']
    | Pick<NewsArticle, 'tags'>['tags'],
): readonly string[] {
  return items.map((item) => item.label);
}

const when = (iso: string, time?: string): string =>
  time ? `${formatNewsDate(iso)}, ${time}` : formatNewsDate(iso);

const machineDate = (iso: string, time?: string): string =>
  time ? iso : iso.slice(0, 10);

const photoLine = (label: string, photo: NewsPhoto): MarkdownListItem =>
  md.listItem(
    `${label}: ${pick([
      abs(photo.url),
      `alt: ${inline(photo.alt)}`,
      photo.caption ? `подпись: ${inline(photo.caption)}` : undefined,
    ]).join(' — ')}`,
  );

function photoSection(article: NewsArticle): readonly MarkdownNode[] {
  const rows = pick<MarkdownListItem>([
    article.cover_url
      ? md.listItem(
          `Обложка: ${pick([
            abs(article.cover_url),
            `alt: ${inline(article.cover_alt ?? article.title)}`,
          ]).join(' — ')}`,
        )
      : undefined,
    ...article.photos.map((photo, index) =>
      photoLine(`Фото ${index + 1}`, photo),
    ),
  ]);

  return rows.length > 0 ? section('Фото', rows) : [];
}

function addendumPhotoSection(
  items: readonly NewsPhoto[],
): readonly MarkdownNode[] {
  if (items.length === 0) {
    return [];
  }

  return [
    md.heading(4, 'Фото'),
    md.list(items.map((photo, index) => photoLine(`Фото ${index + 1}`, photo))),
  ];
}

const attachmentLine = (item: NewsAttachment): MarkdownListItem =>
  md.listItem(
    `${item.title}: ${pick([abs(item.url), item.type, item.size]).join(' — ')}`,
  );

function attachmentSection(
  items: readonly NewsAttachment[],
): readonly MarkdownNode[] {
  return items.length > 0 ? section('Вложения', items.map(attachmentLine)) : [];
}

function addendumAttachmentSection(
  items: readonly NewsAttachment[],
): readonly MarkdownNode[] {
  if (items.length === 0) {
    return [];
  }

  return [md.heading(4, 'Вложения'), md.list(items.map(attachmentLine))];
}

function articleLine(article: NewsListArticle): MarkdownListItem {
  const meta = pick<string>([when(article.published_iso, article.time)]);
  const summary = inline(article.summary);
  const titleLine = [
    md.link(abs(article.markdown_url), article.title),
    ...(meta.length > 0 ? [md.text(` — ${meta.join('; ')}`)] : []),
  ];

  return md.listItem([
    md.paragraph(titleLine),
    ...(summary ? [md.paragraph(summary)] : []),
  ]);
}

function articleBlock(input: {
  readonly items: readonly NewsListArticle[];
  readonly empty: string;
  readonly title?: string;
  readonly intro?: string;
  readonly headingLevel?: 2 | 3;
}): readonly MarkdownNode[] {
  const { items, empty, title, intro, headingLevel = 2 } = input;

  return [
    ...(title ? [md.heading(headingLevel, title)] : []),
    ...(intro ? [md.paragraph(intro)] : []),
    md.list(items.length > 0 ? items.map(articleLine) : [md.listItem(empty)]),
  ];
}

function articleFrontmatter(
  article: NewsArticle,
): Readonly<Record<string, unknown>> {
  const areas = areaLabels(article);
  const tags = tagLabels(article.tags);

  return {
    title: article.title,
    summary: article.summary,
    published_at: machineDate(article.published_iso, article.time),
    ...(article.updated_iso
      ? {
          updated_at: machineDate(
            article.updated_iso,
            article.addenda.at(-1)?.time,
          ),
        }
      : {}),
    author: {
      id: article.author.id,
      name: formatNewsAuthor(article.author, { short: false }),
      kind: article.author.kind,
    },
    ...(areas.length > 0 ? { areas } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(article.source_url ? { source_url: abs(article.source_url) } : {}),
  };
}

function addendaSection(
  items: readonly NewsAddendum[],
): readonly MarkdownNode[] {
  if (items.length === 0) {
    return [];
  }

  const children: MarkdownNode[] = [
    md.heading(2, 'Дополнения'),
    md.paragraph(
      'Исходный текст новости не переписывается: поздние уточнения остаются отдельными блоками.',
    ),
  ];

  for (const [index, item] of items.entries()) {
    children.push(
      md.heading(
        3,
        item.title ??
          `Дополнение ${index + 1} от ${when(item.published_iso, item.time)}`,
      ),
    );
    children.push(
      md.list(
        pick([
          row('Дата', when(item.published_iso, item.time)),
          row('Автор', formatNewsAuthor(item.author, { short: false })),
          row('Источник', item.source_url ? abs(item.source_url) : undefined),
        ]),
      ),
    );

    if (item.body) {
      children.push(...parseMarkdownFragment(item.body.trim()));
    }

    children.push(...addendumPhotoSection(item.photos));
    children.push(...addendumAttachmentSection(item.attachments));
  }

  return children;
}

const monthLine = (item: NewsMonthArchive): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(
        abs(item.markdown_url),
        formatNewsMonth(item.year, item.month, { capitalize: true }),
      ),
      md.text(
        ` — ${item.count} ${pluralizeRu(item.count, ['публикация', 'публикации', 'публикаций'])}`,
      ),
    ]),
  ]);

const tagLine = (item: NewsTagPage): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(abs(item.markdown_url), item.label),
      md.text(
        ` — ${item.count} ${pluralizeRu(item.count, ['публикация', 'публикации', 'публикаций'])}`,
      ),
    ]),
  ]);

export function buildNewsHomeMarkdown(data: NewsDataset): string {
  const latest = [...data.home.pinned, ...data.home.latest];
  const normalCount = data.articles.length - data.home.pinned.length;

  return serialize([
    md.heading(1, 'Новости Шелково'),
    md.paragraph(
      'Свежие новости поселков Шелково и сервисов ОК Комфорт в текстовом формате.',
    ),
    ...articleBlock({
      title: 'Новости',
      items: latest,
      empty: 'Первые публикации для раздела готовятся.',
      intro:
        normalCount > data.home.latest.length
          ? `Закрепленные публикации показаны первыми. Для обычных новостей на главной Markdown-странице показываем не больше ${NEWS_LATEST_LIMIT}; более старые публикации остаются доступны в архивах.`
          : undefined,
    }),
  ]);
}

export function buildNewsYearMarkdown(archive: NewsYearArchive): string {
  const children: MarkdownNode[] = [
    md.heading(1, `Новости Шелково за ${archive.year} год`),
    ...section(
      'Месяцы года',
      archive.months.length > 0
        ? archive.months.map(monthLine)
        : [md.listItem('В этом году пока нет публикаций.')],
    ),
    md.heading(2, 'Публикации по месяцам'),
  ];

  if (archive.months.length === 0) {
    children.push(md.list([md.listItem('В этом году пока нет публикаций.')]));
    return serialize(children);
  }

  for (const item of archive.months) {
    children.push(
      ...articleBlock({
        title: formatNewsMonth(item.year, item.month, { capitalize: true }),
        headingLevel: 3,
        items: item.articles,
        empty: 'В этом месяце пока нет публикаций.',
      }),
    );
  }

  return serialize(children);
}

export function buildNewsMonthMarkdown(input: {
  readonly archive: NewsMonthArchive;
}): string {
  const { archive } = input;
  const monthLabel = formatNewsMonth(archive.year, archive.month);

  return serialize([
    md.heading(1, `Новости Шелково за ${monthLabel}`),
    ...articleBlock({
      items: archive.articles,
      empty: 'В этом месяце пока нет публикаций.',
    }),
  ]);
}

export function buildNewsArticleMarkdown(article: NewsArticle): string {
  return serializeMarkdownDocument(
    createMarkdownDocument({
      frontmatter: articleFrontmatter(article),
      children: [
        md.heading(1, article.title),
        ...(article.body ? parseMarkdownFragment(article.body.trim()) : []),
        ...photoSection(article),
        ...attachmentSection(article.attachments),
        ...addendaSection(article.addenda),
      ],
    }),
  );
}

export function buildNewsTagsMarkdown(
  tagsPage: readonly NewsTagPage[],
): string {
  return serialize([
    md.heading(1, 'Теги новостей Шелково'),
    ...section(
      'Теги',
      tagsPage.length > 0
        ? tagsPage.map(tagLine)
        : [
            md.listItem(
              'Индекс появится автоматически после первых новостей с тегами.',
            ),
          ],
    ),
  ]);
}

export function buildNewsTagMarkdown(tag: NewsTagPage): string {
  const latestPublicationsLabel = `${NEWS_LATEST_LIMIT} ${pluralizeRu(NEWS_LATEST_LIMIT, ['публикация', 'публикации', 'публикаций'])}`;

  return serialize([
    md.heading(1, `Тег ${tag.label}`),
    ...articleBlock({
      title: 'Последние новости по тегу',
      items: tag.latest,
      empty: 'По этому тегу пока нет публикаций.',
      intro:
        tag.count > tag.latest.length
          ? `На странице показаны последние ${latestPublicationsLabel} по тегу; более ранние материалы доступны через месячные и годовые архивы.`
          : undefined,
    }),
  ]);
}
