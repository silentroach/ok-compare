import { pluralizeRu } from '@shelkovo/format';
import {
  createMarkdownDocument,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

import { absoluteUrl } from '../site';
import { loadNewsData } from './load';
import {
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
} from './routes';

const SECTION_TITLES = new Set([
  'Описание',
  'Главные URL',
  'Как читать раздел',
  'Проект',
  'Канонические URL',
  'Описание articles.json',
  'События и календарь',
  'HTML и Markdown',
  'RSS',
  'Addenda и источники',
  'Ограничения',
]);

const serializeLlmsDocument = (lines: readonly string[]): string =>
  serializeMarkdownDocument(
    createMarkdownDocument({
      children: parseMarkdownFragment(
        lines
          .map((line, index) => {
            if (index === 0) return `# ${line}`;
            if (SECTION_TITLES.has(line)) return `## ${line}`;

            return line;
          })
          .join('\n'),
      ),
    }),
  );

export async function build(kind: 'short' | 'full'): Promise<string> {
  const data = await loadNewsData();
  const article = data.articles[0];
  const year = data.archives.years[0];
  const month = year?.months[0];
  const tag = data.tags[0];
  const counts = `${data.articles.length} ${pluralizeRu(data.articles.length, ['статья', 'статьи', 'статей'])}, ${data.tags.length} ${pluralizeRu(data.tags.length, ['тег', 'тега', 'тегов'])} и ${data.archives.years.length} ${pluralizeRu(data.archives.years.length, ['архивный год', 'архивных года', 'архивных лет'])}`;

  const home = absoluteUrl(newsUrl());
  const homeMarkdown = absoluteUrl(newsMarkdownUrl());
  const feed = absoluteUrl(articlesDataUrl());
  const rss = absoluteUrl(feedUrl());
  const short = absoluteUrl(llmsUrl());
  const full = absoluteUrl(llmsFullUrl());
  const catalog = absoluteUrl(apiCatalogUrl());
  const schema = absoluteUrl(articlesSchemaUrl());
  const openapi = absoluteUrl(articlesOpenApiUrl());
  const tags = absoluteUrl(tagsUrl());
  const tagsMarkdown = absoluteUrl(tagsMarkdownUrl());
  const articleHtml = article?.canonical ?? '/news/YYYY/MM/[entry]/';
  const articleMarkdown = article
    ? absoluteUrl(article.markdown_url)
    : '/news/YYYY/MM/[entry]/index.md';
  const yearUrl = year ? absoluteUrl(year.url) : '/news/YYYY/';
  const monthUrl = month ? absoluteUrl(month.url) : '/news/YYYY/MM/';
  const tagUrl = tag ? absoluteUrl(tag.url) : '/news/tags/[tag]/';

  const body =
    kind === 'short'
      ? [
          'Новости Шелково',
          'Файл: llms.txt',
          'Язык: русский',
          '',
          'Описание',
          '- Раздел `/news/` публикует новости, объявления и поздние уточнения по КП Шелково.',
          `- Сейчас в разделе ${counts}.`,
          '- HTML detail pages остаются каноническим представлением для людей, а articles.json служит основным structured feed.',
          '- Если новость объявляет календарные события, в `articles[].events[]` есть metadata событий и ссылки на article-local `.ics`.',
          '',
          'Главные URL',
          `- Главная новостей: ${home}`,
          `- Основной JSON feed: ${feed}`,
          `- RSS: ${rss}`,
          `- API catalog: ${catalog}`,
          `- JSON Schema: ${schema}`,
          `- OpenAPI: ${openapi}`,
          `- Расширенная версия этого текста: ${full}`,
          '',
          'Как читать раздел',
          `- Пример detail HTML: ${articleHtml}`,
          `- Пример detail Markdown: ${articleMarkdown}`,
          `- Годовой архив: ${yearUrl}`,
          `- Месячный архив: ${monthUrl}`,
          `- Индекс тегов: ${tags}`,
          `- Пример tag page: ${tagUrl}`,
          '- В articles.json каждая статья содержит summary, полный body_markdown, optional `events` и отдельный массив addenda.',
          '- addenda не переписывают исходный body новости; это поздние уточнения, комментарии или новые подтвержденные факты.',
          '- Тип источника определяется по `author.kind`; официальные источники используют `kind: official`.',
          '- Для календаря события используйте `/news/YYYY/MM/[entry]/[event-slug].ics`; глобального календаря событий нет.',
        ]
      : [
          'Новости Шелково',
          'Файл: llms-full.txt',
          'Язык: русский',
          '',
          'Проект',
          '- Раздел `/news/` публикует новости, объявления и последующие уточнения по КП Шелково.',
          '- Для массового чтения используйте JSON feed; HTML и Markdown удобнее для одной новости, архива или тега.',
          `- Сейчас в разделе ${counts}.`,
          '',
          'Канонические URL',
          `- Главная новостей: ${home}`,
          `- Markdown news home: ${homeMarkdown}`,
          `- Короткий агентный обзор: ${short}`,
          `- Расширенный агентный обзор: ${full}`,
          `- Основной JSON feed: ${feed}`,
          `- RSS: ${rss}`,
          `- API catalog: ${catalog}`,
          `- JSON Schema: ${schema}`,
          `- OpenAPI: ${openapi}`,
          `- Индекс тегов HTML: ${tags}`,
          `- Индекс тегов Markdown: ${tagsMarkdown}`,
          `- Пример detail HTML: ${articleHtml}`,
          `- Пример detail Markdown: ${articleMarkdown}`,
          `- Пример годового архива: ${yearUrl}`,
          `- Пример месячного архива: ${monthUrl}`,
          `- Пример страницы тега: ${tagUrl}`,
          '',
          'Описание articles.json',
          '- Это основной read-only structured feed для массового обхода новостей.',
          '- Корневой объект содержит `articles`, `archives.years` и `tags`.',
          '- `articles[]` включает `id`, `title`, `summary`, `published_at`, опциональный `updated_at`, дату по частям (`year`, `month`, `day`), `entry`, `html_url`, `markdown_url`, `source_url`, `pinned`, `author`, `areas`, `tags`, опциональные `cover` и `events`, массивы `photos`, `attachments`, полный `body_markdown` и массив `addenda`.',
          '- `articles[].events[]` существует только у новостей, которые объявляют календарные события; каждый объект содержит `slug`, `title`, `starts_at`, optional `description`, `ends_at`, `location`, `coordinates`, `map_url` и обязательный `ics_url`.',
          '- `addenda[]` сериализуются отдельно от основного body и сохраняют собственные `published_at`, `author`, `source_url`, `body_markdown`, `photos` и `attachments`.',
          '- `archives.years[]` описывают годовые и месячные архивы с count и URL на HTML/Markdown pages.',
          '- `tags[]` содержат редакционный label, normalized key, count и URL на HTML/Markdown tag pages.',
          '',
          'События и календарь',
          '- Файлы календаря событий живут рядом со статьей: `/news/YYYY/MM/[entry]/[event-slug].ics`.',
          '- Для машинного обхода берите прямые ссылки из `articles[].events[].ics_url`; они абсолютные в JSON feed.',
          '- Глобального events calendar feed в этой реализации нет.',
          '',
          'HTML и Markdown',
          '- HTML detail pages `/news/YYYY/MM/[entry]/` остаются каноническим человекочитаемым представлением новости.',
          '- Markdown companions `/news/.../index.md` дают text-first слой для терминалов, агентов и прямых ссылок на чистый текст.',
          '- Во всех списках, архивах и тегах показывается только summary; полный body и текст addenda раскрываются только на detail page и в основном JSON feed.',
          '',
          'RSS',
          '- `/news/feed.xml` остается summary-first RSS.',
          '- В RSS description используется краткое summary статьи, а не полный body и не текст addenda.',
          '- Источником правды для полного machine-readable контента остается articles.json.',
          '',
          'Addenda и источники',
          '- addenda хранятся внутри того же article source file, что и исходная новость, но в JSON/Markdown/detail HTML отдаются отдельным массивом или блоком.',
          '- Поздние addenda не поднимают новость вверх в списках: базовая сортировка остается по исходной публикации.',
          '- Тип источника определяется по `author.kind`: официальные источники используют `kind: official`.',
          '- Официальная новость может получить community/editorial addenda без переписывания исходного body.',
          '',
          'Ограничения',
          '- Все маршруты раздела read-only; ручек для изменения данных и авторизации здесь нет.',
          '- Если source article не указывает areas, effective `areas` в feed покрывает все части поселка: `river`, `forest`, `park`, `village`.',
          '- Теги хранятся как русские label, а для URL и feed получают normalized key с дефисами.',
          '- Inline локальные картинки внутри raw markdown body не переписываются автоматически; гарантированно machine-readable считаются `cover`, `photos`, `attachments` и `events`.',
        ];

  return serializeLlmsDocument(body);
}
