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

function abs(path: string): string {
  return absoluteUrl(path);
}

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

export async function build(kind: 'short' | 'full'): Promise<string> {
  const data = await loadNewsData();
  const article = data.articles[0];
  const year = data.archives.years[0];
  const month = year?.months[0];
  const tag = data.tags[0];
  const counts = `${data.articles.length} ${plural(data.articles.length, 'статья', 'статьи', 'статей')}, ${data.tags.length} ${plural(data.tags.length, 'тег', 'тега', 'тегов')} и ${data.archives.years.length} ${plural(data.archives.years.length, 'архивный год', 'архивных года', 'архивных лет')}`;

  const home = abs(newsUrl());
  const homeMarkdown = abs(newsMarkdownUrl());
  const feed = abs(articlesDataUrl());
  const rss = abs(feedUrl());
  const short = abs(llmsUrl());
  const full = abs(llmsFullUrl());
  const catalog = abs(apiCatalogUrl());
  const schema = abs(articlesSchemaUrl());
  const openapi = abs(articlesOpenApiUrl());
  const tags = abs(tagsUrl());
  const tagsMarkdown = abs(tagsMarkdownUrl());
  const articleHtml = article?.canonical ?? '/news/YYYY/MM/[entry]/';
  const articleMarkdown = article
    ? abs(article.markdown_url)
    : '/news/YYYY/MM/[entry]/index.md';
  const yearUrl = year ? abs(year.url) : '/news/YYYY/';
  const monthUrl = month ? abs(month.url) : '/news/YYYY/MM/';
  const tagUrl = tag ? abs(tag.url) : '/news/tags/[tag]/';

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
          '- В articles.json каждая статья содержит summary, полный body_markdown и отдельный массив addenda.',
          '- addenda не переписывают исходный body новости; это поздние уточнения, комментарии или новые подтвержденные факты.',
          '- Официальность определяется по author entry и top-level полю is_official.',
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
          '- `articles[]` включает `id`, `title`, `summary`, `published_at`, опциональный `updated_at`, дату по частям (`year`, `month`, `day`), `entry`, `html_url`, `markdown_url`, `source_url`, `pinned`, `is_official`, `author`, `areas`, `tags`, опциональный `cover`, массивы `photos`, `attachments`, полный `body_markdown` и массив `addenda`.',
          '- `addenda[]` сериализуются отдельно от основного body и сохраняют собственные `published_at`, `author`, `source_url`, `body_markdown`, `photos` и `attachments`.',
          '- `archives.years[]` описывают годовые и месячные архивы с count и URL на HTML/Markdown pages.',
          '- `tags[]` содержат редакционный label, normalized key, count и URL на HTML/Markdown tag pages.',
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
          '- Inline локальные картинки внутри raw markdown body не переписываются автоматически; гарантированно machine-readable считаются `cover`, `photos` и `attachments`.',
        ];

  return `${body.join('\n')}\n`;
}
