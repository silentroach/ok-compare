import { pluralizeRu } from '@shelkovo/format';

import { loadNewsData } from './news/load';
import {
  apiCatalogUrl as newsApiCatalogUrl,
  articlesDataUrl,
  llmsUrl as newsLlmsUrl,
  newsMarkdownUrl,
  newsUrl,
} from './news/routes';
import { absoluteUrl, withBase } from './site';
import { loadStatusData } from './status/load';
import {
  statusApiCatalogUrl,
  statusDataUrl,
  statusLlmsUrl,
  statusMarkdownUrl,
  statusUrl,
} from './status/routes';

export const SITE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const SITE_MARKDOWN = '/index.md';
const SITE_LLMS = '/llms.txt';
const SITE_LLMS_FULL = '/llms-full.txt';
const SITE_API_CATALOG = '/.well-known/api-catalog';

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

export const siteMarkdownUrl = (): string => withBase(SITE_MARKDOWN);

export const siteLlmsUrl = (): string => withBase(SITE_LLMS);

export const siteLlmsFullUrl = (): string => withBase(SITE_LLMS_FULL);

export const siteApiCatalogUrl = (): string => withBase(SITE_API_CATALOG);

async function snapshot() {
  const [news, status] = await Promise.all([loadNewsData(), loadStatusData()]);

  return {
    news,
    status,
  };
}

export async function build(kind: 'short' | 'full'): Promise<string> {
  const { news, status } = await snapshot();
  const activeStatus = status.active.filter((item) => item.kind === 'incident');
  const home = absoluteUrl('/');
  const homeMarkdown = absoluteUrl(siteMarkdownUrl());
  const short = absoluteUrl(siteLlmsUrl());
  const full = absoluteUrl(siteLlmsFullUrl());
  const catalog = absoluteUrl(siteApiCatalogUrl());
  const newsHome = absoluteUrl(newsUrl());
  const newsMarkdown = absoluteUrl(newsMarkdownUrl());
  const newsFeed = absoluteUrl(articlesDataUrl());
  const newsCatalog = absoluteUrl(newsApiCatalogUrl());
  const statusHome = absoluteUrl(statusUrl());
  const statusMarkdown = absoluteUrl(statusMarkdownUrl());
  const statusFeed = absoluteUrl(statusDataUrl());
  const statusCatalog = absoluteUrl(statusApiCatalogUrl());
  const compareHome = absoluteUrl('/compare/');
  const compareMarkdown = absoluteUrl('/compare/index.md');
  const compareFeed = absoluteUrl('/compare/data/settlements.json');
  const compareLlms = absoluteUrl('/compare/llms.txt');
  const compareCatalog = absoluteUrl('/compare/.well-known/api-catalog');
  const compareSkills = absoluteUrl(
    '/compare/.well-known/agent-skills/index.json',
  );
  const skills = absoluteUrl('/.well-known/agent-skills/index.json');

  return kind === 'short'
    ? join([
        'Шелково Онлайн',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Это корневой статический сайт kpshelkovo.online про поселок Шелково и его section-build поверхности.',
        '- Основные публичные разделы для агентов: новости, статус сервисов и compare-section по поселкам.',
        `- Сейчас в news-section ${count(news.articles.length, ['статья', 'статьи', 'статей'])}, а в status-section ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}.`,
        '',
        'Главные URL',
        `- Главная: ${home}`,
        `- Главная в Markdown: ${homeMarkdown}`,
        `- API catalog сайта: ${catalog}`,
        `- Public agent skills сайта: ${skills}`,
        `- Новости: ${newsHome}`,
        `- Статус: ${statusHome}`,
        `- Compare: ${compareHome}`,
        `- Расширенная версия этого текста: ${full}`,
        '',
        'Как ориентироваться',
        `- Для новостей используйте ${absoluteUrl(newsLlmsUrl())} и ${newsFeed}.`,
        `- Для статуса используйте ${absoluteUrl(statusLlmsUrl())} и ${statusFeed}.`,
        `- Для сравнения поселков используйте ${compareLlms} и ${compareFeed}.`,
        '- Public skill index на корневом сайте покрывает navigation, news и status; у compare есть свой отдельный skill index.',
      ])
    : join([
        'Шелково Онлайн',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Это корневой статический сайт kpshelkovo.online.',
        '- На корне сейчас есть home-страница и section-build поверхности `/news/`, `/status/` и `/compare/`.',
        '- Compare публикуется как отдельный section build под `/compare/` и не должен дублироваться внутри `apps/www`.',
        '',
        'Канонические URL',
        `- Главная: ${home}`,
        `- Главная в Markdown: ${homeMarkdown}`,
        `- Короткий агентный обзор: ${short}`,
        `- Расширенный агентный обзор: ${full}`,
        `- API catalog сайта: ${catalog}`,
        `- Public agent skills сайта: ${skills}`,
        '',
        'Раздел Новости',
        `- HTML home: ${newsHome}`,
        `- Markdown home: ${newsMarkdown}`,
        `- llms.txt: ${absoluteUrl(newsLlmsUrl())}`,
        `- JSON feed: ${newsFeed}`,
        `- API catalog: ${newsCatalog}`,
        `- Сейчас в news-section ${count(news.articles.length, ['статья', 'статьи', 'статей'])}.`,
        '',
        'Раздел Статус',
        `- HTML home: ${statusHome}`,
        `- Markdown home: ${statusMarkdown}`,
        `- llms.txt: ${absoluteUrl(statusLlmsUrl())}`,
        `- JSON feed: ${statusFeed}`,
        `- API catalog: ${statusCatalog}`,
        `- Сейчас в status-section ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}.`,
        '',
        'Раздел Compare',
        `- HTML home: ${compareHome}`,
        `- Markdown home: ${compareMarkdown}`,
        `- llms.txt: ${compareLlms}`,
        `- Основной full feed: ${compareFeed}`,
        `- API catalog: ${compareCatalog}`,
        `- Public agent skills: ${compareSkills}`,
        '',
        'Как выбирать поверхность',
        '- Когда нужен только обзор разделов и точек входа, начинайте с этого `llms-full.txt` или с корневого `/.well-known/api-catalog`.',
        '- Когда нужна текстовая версия home-страницы и быстрые ссылки на разделы, используйте `/index.md`.',
        '- Для новостей при массовом чтении используйте `news/data/articles.json`, а HTML/Markdown detail pages оставляйте для одной конкретной записи.',
        '- Для статуса при массовом чтении используйте `status/data/status.json`, а HTML/Markdown service/incident pages оставляйте для фокусной проверки одной линии или одного события.',
        '- Для compare используйте `/compare/data/settlements.json` как основной structured feed, а detail pages и markdown companions - для чтения по одному поселку.',
        '',
        'Skills и discovery',
        '- На корневом сайте public skills сейчас описывают навигацию по разделам, news feed и status feed.',
        '- У compare-section свой отдельный public skill index с более узкими skill-файлами по feeds, страницам поселков и рейтингу.',
        '- News и status публикуют discovery через `llms.txt`, `api-catalog`, JSON Schema и OpenAPI.',
      ]);
}

export async function buildHomeMarkdown(): Promise<string> {
  const { news, status } = await snapshot();
  const activeStatus = status.active.filter((item) => item.kind === 'incident');

  return join([
    '# Шелково Онлайн',
    '',
    'Текстовое представление корневого сайта и его основных разделов для терминалов и агентов.',
    '',
    '## Разделы',
    `- [Новости](${absoluteUrl(newsUrl())}) — ${count(news.articles.length, ['статья', 'статьи', 'статей'])}; structured feed: ${absoluteUrl(articlesDataUrl())}`,
    `- [Статус](${absoluteUrl(statusUrl())}) — ${count(status.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}; structured feed: ${absoluteUrl(statusDataUrl())}`,
    `- [Compare](${absoluteUrl('/compare/')}) — сравнение поселков, тарифов и рейтинга; structured feed: ${absoluteUrl('/compare/data/settlements.json')}`,
    '',
    '## Agent Discovery',
    `- API catalog сайта: ${absoluteUrl(siteApiCatalogUrl())}`,
    `- llms.txt: ${absoluteUrl(siteLlmsUrl())}`,
    `- llms-full.txt: ${absoluteUrl(siteLlmsFullUrl())}`,
    `- Public agent skills: ${absoluteUrl('/.well-known/agent-skills/index.json')}`,
    '',
    '## Section Discovery',
    `- Новости: ${absoluteUrl(newsLlmsUrl())}, ${absoluteUrl(newsApiCatalogUrl())}`,
    `- Статус: ${absoluteUrl(statusLlmsUrl())}, ${absoluteUrl(statusApiCatalogUrl())}`,
    `- Compare: ${absoluteUrl('/compare/llms.txt')}, ${absoluteUrl('/compare/.well-known/api-catalog')}`,
  ]);
}
