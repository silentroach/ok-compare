import { pluralizeRu } from '@shelkovo/format';

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
          '- Это статический news-section внутри kpshelkovo.online про новости, объявления и поздние уточнения по Шелково.',
          `- Сейчас в разделе ${counts}.`,
          '- HTML detail pages остаются каноническим представлением для людей, а articles.json служит основным structured feed для агентов.',
          '- Если новость объявляет календарное событие, в `articles[].event` есть metadata события и ссылка на article-local `.ics`.',
          '',
          'Главные URL',
          `- Главная news-section: ${home}`,
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
          '- В articles.json каждая статья содержит summary, полный body_markdown, optional `event` и отдельный массив addenda.',
          '- addenda не переписывают исходный body новости; это поздние уточнения, комментарии или новые подтвержденные факты.',
          '- Официальность определяется по author entry и top-level полю is_official.',
          '- Для одной новости-события используйте `/news/YYYY/MM/[entry]/event.ics`; глобального календаря событий нет.',
        ]
      : [
          'Новости Шелково',
          'Файл: llms-full.txt',
          'Язык: русский',
          '',
          'Проект',
          '- Это статический news-section внутри kpshelkovo.online под `/news/...`.',
          '- Он нужен для публикации новостей, объявлений и последующих уточнений без SSR и без серверного state.',
          `- Сейчас в разделе ${counts}.`,
          '',
          'Канонические URL',
          `- Главная news-section: ${home}`,
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
          '- Это основной read-only structured feed для агентов и машинного обхода news-section.',
          '- Корневой объект содержит `articles`, `archives.years` и `tags`.',
          '- `articles[]` включает `id`, `title`, `summary`, `published_at`, опциональный `updated_at`, дату по частям (`year`, `month`, `day`), `entry`, `html_url`, `markdown_url`, `source_url`, `pinned`, `is_official`, `author`, `areas`, `tags`, опциональные `cover` и `event`, массивы `photos`, `attachments`, полный `body_markdown` и массив `addenda`.',
          '- `articles[].event` существует только у новостей, которые объявляют календарное событие; объект содержит `title`, `starts_at`, optional `ends_at`, `location`, `coordinates`, `map_url` и обязательный `ics_url`.',
          '- `addenda[]` сериализуются отдельно от основного body и сохраняют собственные `published_at`, `author`, `source_url`, `body_markdown`, `photos` и `attachments`.',
          '- `archives.years[]` описывают годовые и месячные архивы с count и URL на HTML/Markdown pages.',
          '- `tags[]` содержат редакционный label, normalized key, count и URL на HTML/Markdown tag pages.',
          '',
          'События и календарь',
          '- Файл календаря для одной новости-события живет рядом со статьей: `/news/YYYY/MM/[entry]/event.ics`.',
          '- Для машинного обхода берите прямую ссылку из `articles[].event.ics_url`; она абсолютная в JSON feed.',
          '- Глобального events calendar feed в этой реализации нет.',
          '',
          'HTML и Markdown surfaces',
          '- HTML detail pages `/news/YYYY/MM/[entry]/` остаются каноническим человекочитаемым представлением новости.',
          '- Markdown companions `/news/.../index.md` дают text-first слой для терминалов, агентов и прямых ссылок на чистый текст.',
          '- Во всех list/archive/tag surfaces показывается только summary; полный body и текст addenda раскрываются только на detail page и в основном JSON feed.',
          '',
          'RSS',
          '- `/news/feed.xml` остается summary-first RSS.',
          '- В RSS description используется краткое summary статьи, а не полный body и не текст addenda.',
          '- Источником правды для полного machine-readable контента остается articles.json.',
          '',
          'Addenda и официальность',
          '- addenda хранятся внутри того же article source file, что и исходная новость, но в JSON/Markdown/detail HTML отдаются отдельным массивом или блоком.',
          '- Поздние addenda не поднимают новость вверх в списках: базовая сортировка остается по исходной публикации.',
          '- Официальность новости определяется по author entry, а не по отдельному boolean в markdown-файле статьи.',
          '- Официальная новость может получить community/editorial addenda без переписывания исходного body.',
          '',
          'Ограничения',
          '- Все routes news-section генерируются статически; mutation endpoints и auth в этой поверхности отсутствуют.',
          '- Если source article не указывает areas, effective `areas` в feed покрывает все части поселка: `river`, `forest`, `park`, `village`.',
          '- Теги хранятся как русские label, а для URL и feed получают normalized key с дефисами.',
          '- Inline локальные картинки внутри raw markdown body не переписываются автоматически; гарантированно machine-readable считаются `cover`, `photos`, `attachments` и `event`.',
        ];

  return `${body.join('\n')}\n`;
}
