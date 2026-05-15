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
import { serializeMarkdownLineDocument } from '@/lib/markdown/llms-document';

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
  'Уточнения и источники',
  'Ограничения',
]);

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
          '- HTML-страницы новостей остаются каноническим представлением для людей, а `articles.json` служит основным структурированным файлом данных.',
          '- Если новость объявляет календарные события, в `articles[].events[]` есть метаданные событий и ссылки на локальные для статьи `.ics`-файлы.',
          '',
          'Главные URL',
          `- Главная новостей: ${home}`,
          `- Основной JSON-файл: ${feed}`,
          `- RSS: ${rss}`,
          `- Каталог API: ${catalog}`,
          `- JSON Schema: ${schema}`,
          `- OpenAPI: ${openapi}`,
          `- Расширенная версия этого текста: ${full}`,
          '',
          'Как читать раздел',
          `- Пример HTML-страницы новости: ${articleHtml}`,
          `- Пример Markdown-страницы новости: ${articleMarkdown}`,
          `- Годовой архив: ${yearUrl}`,
          `- Месячный архив: ${monthUrl}`,
          `- Индекс тегов: ${tags}`,
          `- Пример страницы тега: ${tagUrl}`,
          '- В `articles.json` каждая статья содержит `summary`, полный `body_markdown`, необязательный массив `events` и отдельный массив `addenda`.',
          '- `addenda` не переписывают исходный `body` новости; это поздние уточнения, комментарии или новые подтвержденные факты.',
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
          '- Для массового чтения используйте JSON-файл; HTML и Markdown удобнее для одной новости, архива или тега.',
          `- Сейчас в разделе ${counts}.`,
          '',
          'Канонические URL',
          `- Главная новостей: ${home}`,
          `- Главная новостей в Markdown: ${homeMarkdown}`,
          `- Короткий агентный обзор: ${short}`,
          `- Расширенный агентный обзор: ${full}`,
          `- Основной JSON-файл: ${feed}`,
          `- RSS: ${rss}`,
          `- Каталог API: ${catalog}`,
          `- JSON Schema: ${schema}`,
          `- OpenAPI: ${openapi}`,
          `- Индекс тегов HTML: ${tags}`,
          `- Индекс тегов Markdown: ${tagsMarkdown}`,
          `- Пример HTML-страницы новости: ${articleHtml}`,
          `- Пример Markdown-страницы новости: ${articleMarkdown}`,
          `- Пример годового архива: ${yearUrl}`,
          `- Пример месячного архива: ${monthUrl}`,
          `- Пример страницы тега: ${tagUrl}`,
          '',
          'Описание articles.json',
          '- Это основной структурированный файл данных для массового обхода новостей; маршруты раздела доступны только на чтение.',
          '- Корневой объект содержит `articles`, `archives.years` и `tags`.',
          '- `articles[]` включает `id`, `title`, `summary`, `published_at`, опциональный `updated_at`, дату по частям (`year`, `month`, `day`), `entry`, `html_url`, `markdown_url`, `source_url`, `pinned`, `author`, `areas`, `tags`, опциональные `cover` и `events`, массивы `photos`, `attachments`, полный `body_markdown` и массив `addenda`.',
          '- `articles[].events[]` существует только у новостей, которые объявляют календарные события; каждый объект содержит `slug`, `title`, `starts_at`, необязательные `description`, `ends_at`, `location`, `coordinates`, `map_url` и обязательный `ics_url`.',
          '- `addenda[]` сериализуются отдельно от основного `body` и сохраняют собственные `published_at`, `author`, `source_url`, `body_markdown`, `photos` и `attachments`.',
          '- `archives.years[]` описывают годовые и месячные архивы с количеством публикаций и URL на HTML/Markdown-страницы.',
          '- `tags[]` содержат редакционный `label`, нормализованный `key`, количество публикаций и URL на HTML/Markdown-страницы тегов.',
          '',
          'События и календарь',
          '- Файлы календаря событий живут рядом со статьей: `/news/YYYY/MM/[entry]/[event-slug].ics`.',
          '- Для машинного обхода берите прямые ссылки из `articles[].events[].ics_url`; в JSON-файле они абсолютные.',
          '- Глобального календарного файла событий в этой реализации нет.',
          '',
          'HTML и Markdown',
          '- HTML-страницы `/news/YYYY/MM/[entry]/` остаются каноническим человекочитаемым представлением новости.',
          '- Markdown-файлы `/news/.../index.md` дают текстовый слой для терминалов, агентов и прямых ссылок на чистый текст.',
          '- Во всех списках, архивах и тегах показывается только `summary`; полный `body` и текст `addenda` раскрываются только на странице новости и в основном JSON-файле.',
          '',
          'RSS',
          '- `/news/feed.xml` остается RSS с краткими описаниями.',
          '- В RSS `description` используется краткое `summary` статьи, а не полный `body` и не текст `addenda`.',
          '- Источником правды для полного машиночитаемого контента остается `articles.json`.',
          '',
          'Уточнения и источники',
          '- `addenda` хранятся в том же исходном файле статьи, что и исходная новость, но в JSON, Markdown и HTML отдаются отдельным массивом или блоком.',
          '- Поздние `addenda` не поднимают новость вверх в списках: базовая сортировка остается по исходной публикации.',
          '- Тип источника определяется по `author.kind`: официальные источники используют `kind: official`.',
          '- Официальная новость может получить уточнения от сообщества или редакции без переписывания исходного `body`.',
          '',
          'Ограничения',
          '- Все маршруты раздела доступны только на чтение; ручек для изменения данных и авторизации здесь нет.',
          '- Если исходная статья не указывает `areas`, итоговое поле `areas` в JSON-файле покрывает все части поселка: `river`, `forest`, `park`, `village`.',
          '- Теги хранятся как русские `label`, а для URL и JSON-файла получают нормализованный `key` с дефисами.',
          '- Локальные картинки внутри исходного markdown-текста не переписываются автоматически; гарантированно машиночитаемыми считаются `cover`, `photos`, `attachments` и `events`.',
        ];

  return serializeMarkdownLineDocument(body, SECTION_TITLES);
}
