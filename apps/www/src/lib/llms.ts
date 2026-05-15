import { count } from '@shelkovo/format';
import { md } from '@shelkovo/markdown';

import {
  llmsSection,
  markdownBlocks,
  markdownList,
  serializeLlmsDocument,
  serializeMarkdownNodes,
} from '@/lib/markdown/llms-document';
import { loadNewsData } from './news/load';
import {
  apiCatalogUrl as newsApiCatalogUrl,
  articlesDataUrl,
  feedUrl as newsFeedUrl,
  llmsUrl as newsLlmsUrl,
  newsMarkdownUrl,
  newsUrl,
} from './news/routes';
import { loadPeopleDataWithBacklinks } from './people/load';
import {
  peopleApiCatalogUrl,
  peopleDataUrl,
  peopleLlmsFullUrl,
  peopleLlmsUrl,
  peopleMarkdownUrl,
  peopleOpenApiUrl,
  peopleSchemaUrl,
} from './people/routes';
import { absoluteUrl, withBase } from './site';
import { siteSkillsUrl } from './skills';
import { estimate2026 } from '@/data/reglament/estimate-2026';
import { formatReglamentTariff } from './reglament/format';
import {
  reglamentApiCatalogUrl,
  reglamentAssetsUrl,
  reglamentEstimate2026DataUrl,
  reglamentFullAssetsMarkdownUrl,
  reglamentFullChecksMarkdownUrl,
  reglamentFull2026DataUrl,
  reglamentFullMarkdownUrl,
  reglamentFullServiceMapMarkdownUrl,
  reglamentFullServicesMarkdownUrl,
  reglamentLlmsUrl,
  reglamentMarkdownUrl,
  reglamentServicesUrl,
  reglamentUrl,
} from './reglament/routes';
import { loadStatusData } from './status/load';
import {
  statusApiCatalogUrl,
  statusDataUrl,
  statusFeedUrl,
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

export const siteMarkdownUrl = (): string => withBase(SITE_MARKDOWN);

export const siteLlmsUrl = (): string => withBase(SITE_LLMS);

export const siteLlmsFullUrl = (): string => withBase(SITE_LLMS_FULL);

export const siteApiCatalogUrl = (): string => withBase(SITE_API_CATALOG);

async function snapshot() {
  const [news, people, status] = await Promise.all([
    loadNewsData(),
    loadPeopleDataWithBacklinks(),
    loadStatusData(),
  ]);

  return {
    news,
    people,
    status,
  };
}

export async function build(kind: 'short' | 'full'): Promise<string> {
  const { news, people, status } = await snapshot();
  const activeStatus = status.active.filter((item) => item.kind === 'incident');
  const person = people.profiles[0];
  const home = absoluteUrl('/');
  const homeMarkdown = absoluteUrl(siteMarkdownUrl());
  const short = absoluteUrl(siteLlmsUrl());
  const full = absoluteUrl(siteLlmsFullUrl());
  const catalog = absoluteUrl(siteApiCatalogUrl());
  const newsHome = absoluteUrl(newsUrl());
  const newsMarkdown = absoluteUrl(newsMarkdownUrl());
  const newsFeed = absoluteUrl(articlesDataUrl());
  const newsRss = absoluteUrl(newsFeedUrl());
  const newsCatalog = absoluteUrl(newsApiCatalogUrl());
  const statusHome = absoluteUrl(statusUrl());
  const statusMarkdown = absoluteUrl(statusMarkdownUrl());
  const statusFeed = absoluteUrl(statusDataUrl());
  const statusRss = absoluteUrl(statusFeedUrl());
  const statusCatalog = absoluteUrl(statusApiCatalogUrl());
  const reglamentHome = absoluteUrl(reglamentUrl());
  const reglamentMarkdown = absoluteUrl(reglamentMarkdownUrl());
  const reglamentFeed = absoluteUrl(reglamentEstimate2026DataUrl());
  const reglamentFullMarkdown = absoluteUrl(reglamentFullMarkdownUrl());
  const reglamentFullAssetsMarkdown = absoluteUrl(
    reglamentFullAssetsMarkdownUrl(),
  );
  const reglamentFullServicesMarkdown = absoluteUrl(
    reglamentFullServicesMarkdownUrl(),
  );
  const reglamentFullServiceMapMarkdown = absoluteUrl(
    reglamentFullServiceMapMarkdownUrl(),
  );
  const reglamentFullChecksMarkdown = absoluteUrl(
    reglamentFullChecksMarkdownUrl(),
  );
  const reglamentFullDataset = absoluteUrl(reglamentFull2026DataUrl());
  const reglamentAssets = absoluteUrl(reglamentAssetsUrl());
  const reglamentServices = absoluteUrl(reglamentServicesUrl());
  const reglamentLlms = absoluteUrl(reglamentLlmsUrl());
  const reglamentCatalog = absoluteUrl(reglamentApiCatalogUrl());
  const peopleMarkdown = absoluteUrl(peopleMarkdownUrl());
  const peopleFeed = absoluteUrl(peopleDataUrl());
  const peopleCatalog = absoluteUrl(peopleApiCatalogUrl());
  const peopleSchema = absoluteUrl(peopleSchemaUrl());
  const peopleOpenApi = absoluteUrl(peopleOpenApiUrl());
  const peopleShort = absoluteUrl(peopleLlmsUrl());
  const peopleFull = absoluteUrl(peopleLlmsFullUrl());
  const personHtml = person?.canonical ?? '/people/[slug]/';
  const personMarkdown = person
    ? absoluteUrl(person.markdown_url)
    : '/people/[slug]/index.md';
  const compareHome = absoluteUrl('/815/compare/');
  const compareMarkdown = absoluteUrl('/815/compare/index.md');
  const compareFeed = absoluteUrl('/815/compare/data/settlements.json');
  const compareLlms = absoluteUrl('/815/compare/llms.txt');
  const compareCatalog = absoluteUrl('/815/compare/.well-known/api-catalog');
  const compareSkills = absoluteUrl(
    '/815/compare/.well-known/agent-skills/index.json',
  );
  const skills = absoluteUrl(siteSkillsUrl());

  return kind === 'short'
    ? serializeLlmsDocument({
        title: 'Шелково Онлайн',
        file: 'llms.txt',
        sections: [
          llmsSection('Описание', [
            markdownList([
              'Это карта публичных данных и точек входа kpshelkovo.online.',
              'Основные разделы: новости, статус сервисов, регламент и смета тарифа 815, профили людей и сравнение тарифов поселков.',
              `Сейчас в новостях ${count(news.articles.length, ['статья', 'статьи', 'статей'])}, в статусе ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}, в людях ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
              'Для массового чтения используйте JSON-фиды; HTML и Markdown удобнее для ссылок и точечного чтения.',
            ]),
          ]),
          llmsSection('Главные URL', [
            markdownList([
              `Главная: ${home}`,
              `Главная в Markdown: ${homeMarkdown}`,
              `API catalog сайта: ${catalog}`,
              `Инструкции для автоматического чтения сайта: ${skills}`,
              `Новости: ${newsHome}`,
              `Статус: ${statusHome}`,
              `Регламент: ${reglamentHome}`,
              `Люди в Markdown: ${peopleMarkdown}`,
              `Сравнение тарифов: ${compareHome}`,
              `Расширенная версия этого текста: ${full}`,
            ]),
          ]),
          llmsSection('Как ориентироваться', [
            markdownList([
              'Если задача относится к одному разделу, сначала откройте его `llms.txt`; если нужны данные массово, сразу берите JSON-фид.',
              `Новости: ${absoluteUrl(newsLlmsUrl())}; основной feed: ${newsFeed}; календарные события лежат в \`articles[].events[].ics_url\`.`,
              `Статус сервисов: ${absoluteUrl(statusLlmsUrl())}; основной feed: ${statusFeed}.`,
              `Регламент и смета: ${reglamentLlms}; смета: ${reglamentFeed}; полный регламент: ${reglamentFullMarkdown}; dataset: ${reglamentFullDataset}.`,
              `Люди: ${peopleShort}; основной feed: ${peopleFeed}; одна персона: ${personHtml} или ${personMarkdown}.`,
              `Сравнение тарифов поселков: ${compareLlms}; основной feed: ${compareFeed}.`,
              'Публичные инструкции помогают с типовыми задачами; у сравнения тарифов есть отдельный индекс.',
            ]),
          ]),
        ],
      })
    : serializeLlmsDocument({
        title: 'Шелково Онлайн',
        file: 'llms-full.txt',
        sections: [
          llmsSection('Проект', [
            markdownList([
              'Это корневой сайт kpshelkovo.online и карта его публичных данных.',
              'Разделы сайта: `/news/`, `/status/`, `/815/regulation/`, `/people/` и `/815/compare/`.',
              'Все JSON-фиды read-only и отражают состояние на момент сборки сайта.',
              'У раздела людей нет публичной HTML-страницы индекса `/people/`; используйте `/people/index.md` и `/people/data/people.json`.',
            ]),
          ]),
          llmsSection('Канонические URL', [
            markdownList([
              `Главная: ${home}`,
              `Главная в Markdown: ${homeMarkdown}`,
              `Короткий обзор llms.txt: ${short}`,
              `Подробный обзор llms-full.txt: ${full}`,
              `API catalog сайта: ${catalog}`,
              `Инструкции для автоматического чтения сайта: ${skills}`,
            ]),
          ]),
          llmsSection('Новости', [
            markdownList([
              `HTML home: ${newsHome}`,
              `Markdown home: ${newsMarkdown}`,
              `llms.txt: ${absoluteUrl(newsLlmsUrl())}`,
              `JSON feed: ${newsFeed}`,
              `RSS: ${newsRss}`,
              `API catalog: ${newsCatalog}`,
              'События новостей представлены как optional `articles[].events[]`; `.ics` доступен по `/news/YYYY/MM/[entry]/[event-slug].ics`, глобального events feed нет.',
              `Сейчас в разделе ${count(news.articles.length, ['статья', 'статьи', 'статей'])}.`,
            ]),
          ]),
          llmsSection('Статус сервисов', [
            markdownList([
              `HTML home: ${statusHome}`,
              `Markdown home: ${statusMarkdown}`,
              `llms.txt: ${absoluteUrl(statusLlmsUrl())}`,
              `JSON feed: ${statusFeed}`,
              `RSS: ${statusRss}`,
              `API catalog: ${statusCatalog}`,
              `Сейчас в разделе ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}.`,
            ]),
          ]),
          llmsSection('Регламент и смета тарифа 815', [
            markdownList([
              `HTML home: ${reglamentHome}`,
              `Markdown companion: ${reglamentMarkdown}`,
              `Полный регламент Markdown: ${reglamentFullMarkdown}`,
              `Полный регламент, имущество Markdown: ${reglamentFullAssetsMarkdown}`,
              `Полный регламент, услуги Markdown: ${reglamentFullServicesMarkdown}`,
              `Полный регламент, сопоставления Markdown: ${reglamentFullServiceMapMarkdown}`,
              `Полный регламент, проверки Markdown: ${reglamentFullChecksMarkdown}`,
              `llms.txt: ${reglamentLlms}`,
              `JSON feed: ${reglamentFeed}`,
              `Dataset полного регламента: ${reglamentFullDataset}`,
              `Общее имущество: ${reglamentAssets}`,
              `Услуги регламента: ${reglamentServices}`,
              `API catalog: ${reglamentCatalog}`,
              `В feed ${estimate2026.sections.length} секций сметы; официальный месячный тариф ${formatReglamentTariff(estimate2026.baseline.tariff_per_sotka_month)}.`,
            ]),
          ]),
          llmsSection('Люди', [
            markdownList([
              `HTML-индекса нет; обзор раздела живет в Markdown: ${peopleMarkdown}`,
              `llms.txt: ${peopleShort}`,
              `llms-full.txt: ${peopleFull}`,
              `JSON feed: ${peopleFeed}`,
              `API catalog: ${peopleCatalog}`,
              `JSON Schema: ${peopleSchema}`,
              `OpenAPI: ${peopleOpenApi}`,
              `Пример detail HTML: ${personHtml}`,
              `Пример detail Markdown: ${personMarkdown}`,
              `Сейчас в разделе ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
            ]),
          ]),
          llmsSection('Сравнение тарифов поселков', [
            markdownList([
              `HTML home: ${compareHome}`,
              `Markdown home: ${compareMarkdown}`,
              `llms.txt: ${compareLlms}`,
              `Основной JSON feed: ${compareFeed}`,
              `API catalog: ${compareCatalog}`,
              `Инструкции для автоматического чтения: ${compareSkills}`,
            ]),
          ]),
          llmsSection('Как выбирать источник', [
            markdownList([
              'Когда нужен обзор разделов и точек входа, начинайте с этого `llms-full.txt` или с корневого `/.well-known/api-catalog`.',
              'Когда нужна текстовая версия home-страницы и быстрые ссылки на разделы, используйте `/index.md`.',
              'Для новостей при массовом чтении используйте `/news/data/articles.json`, а HTML/Markdown-страницы оставляйте для одной конкретной записи; если у статьи есть `events`, календарь берите из `events[].ics_url`.',
              'Для статуса при массовом чтении используйте `/status/data/status.json`, а HTML/Markdown service/incident pages оставляйте для фокусной проверки одной линии или одного события.',
              'Для регламента при массовом чтении используйте `/815/regulation/data/estimate-2026.json` для расчетной сметы и `/815/regulation/data/full-2026.json` для полного structured dataset; для текстового чтения начинайте с `/815/regulation/full.md`, затем переходите в тематические файлы `/815/regulation/full/*.md`.',
              'Для людей при массовом чтении используйте `/people/data/people.json`, а `/people/[slug]/` и `/people/[slug]/index.md` оставляйте для чтения одного профиля.',
              'Для сравнения тарифов используйте `/815/compare/data/settlements.json` как основной structured feed, а HTML/Markdown-страницы - для чтения по одному поселку.',
            ]),
          ]),
          llmsSection('Skills и discovery', [
            markdownList([
              '`llms.txt` дает карту маршрутов, `api-catalog` и OpenAPI/Schema описывают контракты, публичные инструкции закрывают типовые задачи.',
              'Корневой skill index покрывает навигацию, новости, статус и профили людей.',
              'У compare свой skill index для фида, страниц поселков, рейтинга и уточнений по источникам.',
            ]),
          ]),
        ],
      });
}

export async function buildHomeMarkdown(): Promise<string> {
  const { news, people, status } = await snapshot();
  const activeStatus = status.active.filter((item) => item.kind === 'incident');

  return serializeMarkdownNodes([
    md.heading(1, 'Шелково Онлайн'),
    ...markdownBlocks(
      'Текстовое представление корневого сайта и его основных разделов для терминалов и автоматического чтения.',
    ),
    md.heading(2, 'Разделы'),
    markdownList([
      `[Новости](${absoluteUrl(newsUrl())}) — ${count(news.articles.length, ['статья', 'статьи', 'статей'])}; structured feed: ${absoluteUrl(articlesDataUrl())}; RSS: ${absoluteUrl(newsFeedUrl())}; события: optional \`articles[].events[]\` с article-local \`[event-slug].ics\``,
      `[Статус](${absoluteUrl(statusUrl())}) — ${count(status.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}; structured feed: ${absoluteUrl(statusDataUrl())}; RSS: ${absoluteUrl(statusFeedUrl())}`,
      `[Регламент](${absoluteUrl(reglamentUrl())}) — смета тарифа 2026; structured feed: ${absoluteUrl(reglamentEstimate2026DataUrl())}; full index: ${absoluteUrl(reglamentFullMarkdownUrl())}; full dataset: ${absoluteUrl(reglamentFull2026DataUrl())}; markdown overview: ${absoluteUrl(reglamentMarkdownUrl())}`,
      `Люди — ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}; markdown overview: ${absoluteUrl(peopleMarkdownUrl())}; structured feed: ${absoluteUrl(peopleDataUrl())}; публичного HTML-индекса нет`,
      `[Compare](${absoluteUrl('/815/compare/')}) — сравнение тарифов поселков и рейтинга; structured feed: ${absoluteUrl('/815/compare/data/settlements.json')}`,
    ]),
    md.heading(2, 'Agent Discovery'),
    markdownList([
      `API catalog сайта: ${absoluteUrl(siteApiCatalogUrl())}`,
      `llms.txt: ${absoluteUrl(siteLlmsUrl())}`,
      `llms-full.txt: ${absoluteUrl(siteLlmsFullUrl())}`,
      `Инструкции для автоматического чтения: ${absoluteUrl(siteSkillsUrl())}`,
    ]),
    md.heading(2, 'Section Discovery'),
    markdownList([
      `Новости: ${absoluteUrl(newsLlmsUrl())}, ${absoluteUrl(newsApiCatalogUrl())}`,
      `Статус: ${absoluteUrl(statusLlmsUrl())}, ${absoluteUrl(statusApiCatalogUrl())}`,
      `Регламент: ${absoluteUrl(reglamentLlmsUrl())}, ${absoluteUrl(reglamentApiCatalogUrl())}`,
      `Люди: ${absoluteUrl(peopleLlmsUrl())}, ${absoluteUrl(peopleApiCatalogUrl())}`,
      `Compare: ${absoluteUrl('/815/compare/llms.txt')}, ${absoluteUrl('/815/compare/.well-known/api-catalog')}`,
    ]),
  ]);
}
