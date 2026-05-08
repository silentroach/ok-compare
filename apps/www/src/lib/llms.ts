import { pluralizeRu } from '@shelkovo/format';

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

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

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
  const compareHome = absoluteUrl('/compare/');
  const compareMarkdown = absoluteUrl('/compare/index.md');
  const compareFeed = absoluteUrl('/compare/data/settlements.json');
  const compareLlms = absoluteUrl('/compare/llms.txt');
  const compareCatalog = absoluteUrl('/compare/.well-known/api-catalog');
  const compareSkills = absoluteUrl(
    '/compare/.well-known/agent-skills/index.json',
  );
  const skills = absoluteUrl(siteSkillsUrl());

  return kind === 'short'
    ? join([
        'Шелково Онлайн',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Это корневой статический сайт kpshelkovo.online про поселок Шелково и его section-build поверхности.',
        '- Основные публичные разделы для агентов: новости, статус сервисов, регламентная смета, people-профили и compare-section по поселкам.',
        `- Сейчас в news-section ${count(news.articles.length, ['статья', 'статьи', 'статей'])}, в status-section ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}, а в people-section ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
        '- У people-section нет публичного HTML-индекса: массовый обход идет через markdown overview и people.json.',
        '',
        'Главные URL',
        `- Главная: ${home}`,
        `- Главная в Markdown: ${homeMarkdown}`,
        `- API catalog сайта: ${catalog}`,
        `- Public agent skills сайта: ${skills}`,
        `- Новости: ${newsHome}`,
        `- Статус: ${statusHome}`,
        `- Регламент: ${reglamentHome}`,
        `- Люди в Markdown: ${peopleMarkdown}`,
        `- Compare: ${compareHome}`,
        `- Расширенная версия этого текста: ${full}`,
        '',
        'Как ориентироваться',
        `- Для новостей используйте ${absoluteUrl(newsLlmsUrl())} и ${newsFeed}.`,
        '- У новостей с календарными событиями читайте `articles[].events[].ics_url`; глобального календаря событий нет.',
        `- Для статуса используйте ${absoluteUrl(statusLlmsUrl())} и ${statusFeed}.`,
        `- Для регламента используйте ${reglamentLlms}, ${reglamentFeed}, индекс полного регламента ${reglamentFullMarkdown} и dataset ${reglamentFullDataset}.`,
        `- Для people используйте ${peopleShort} и ${peopleFeed}; для одной персоны переходите на ${personHtml} или ${personMarkdown}.`,
        `- Для сравнения поселков используйте ${compareLlms} и ${compareFeed}.`,
        '- Public skill index на корневом сайте покрывает navigation, news, status и people; у compare есть свой отдельный skill index.',
      ])
    : join([
        'Шелково Онлайн',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Это корневой статический сайт kpshelkovo.online.',
        '- На корне сейчас есть home-страница и section-build поверхности `/news/`, `/status/`, `/815/regulation/`, `people` и `/compare/`.',
        '- Compare публикуется как отдельный section build под `/compare/` и не должен дублироваться внутри `apps/www`.',
        '- People-section публикует detail pages `/people/[slug]/`, но намеренно не имеет публичной HTML index page `/people/`.',
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
        `- RSS: ${newsRss}`,
        `- API catalog: ${newsCatalog}`,
        '- События новостей представлены как optional `articles[].events[]`; `.ics` доступен по `/news/YYYY/MM/[entry]/[event-slug].ics`, глобального events feed нет.',
        `- Сейчас в news-section ${count(news.articles.length, ['статья', 'статьи', 'статей'])}.`,
        '',
        'Раздел Статус',
        `- HTML home: ${statusHome}`,
        `- Markdown home: ${statusMarkdown}`,
        `- llms.txt: ${absoluteUrl(statusLlmsUrl())}`,
        `- JSON feed: ${statusFeed}`,
        `- RSS: ${statusRss}`,
        `- API catalog: ${statusCatalog}`,
        `- Сейчас в status-section ${count(status.incidents.length, ['запись', 'записи', 'записей'])} и ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}.`,
        '',
        'Раздел Регламент',
        `- HTML home запланирован как калькулятор: ${reglamentHome}`,
        `- Markdown companion: ${reglamentMarkdown}`,
        `- Полный регламент Markdown: ${reglamentFullMarkdown}`,
        `- Полный регламент, имущество Markdown: ${reglamentFullAssetsMarkdown}`,
        `- Полный регламент, услуги Markdown: ${reglamentFullServicesMarkdown}`,
        `- Полный регламент, сопоставления Markdown: ${reglamentFullServiceMapMarkdown}`,
        `- Полный регламент, проверки Markdown: ${reglamentFullChecksMarkdown}`,
        `- llms.txt: ${reglamentLlms}`,
        `- JSON feed: ${reglamentFeed}`,
        `- Dataset полного регламента: ${reglamentFullDataset}`,
        `- Общее имущество: ${reglamentAssets}`,
        `- Услуги регламента: ${reglamentServices}`,
        `- API catalog: ${reglamentCatalog}`,
        `- В feed ${estimate2026.sections.length} секций сметы; официальный месячный тариф ${formatReglamentTariff(estimate2026.baseline.tariff_per_sotka_month)}.`,
        '',
        'Раздел Люди',
        `- HTML index page отсутствует; section overview живет в Markdown: ${peopleMarkdown}`,
        `- llms.txt: ${peopleShort}`,
        `- llms-full.txt: ${peopleFull}`,
        `- JSON feed: ${peopleFeed}`,
        `- API catalog: ${peopleCatalog}`,
        `- JSON Schema: ${peopleSchema}`,
        `- OpenAPI: ${peopleOpenApi}`,
        `- Пример detail HTML: ${personHtml}`,
        `- Пример detail Markdown: ${personMarkdown}`,
        `- Сейчас в people-section ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
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
        '- Для новостей при массовом чтении используйте `news/data/articles.json`, а HTML/Markdown detail pages оставляйте для одной конкретной записи; если у статьи есть `events`, календарь берите из `events[].ics_url`.',
        '- Для статуса при массовом чтении используйте `status/data/status.json`, а HTML/Markdown service/incident pages оставляйте для фокусной проверки одной линии или одного события.',
        '- Для регламента при массовом чтении используйте `815/regulation/data/estimate-2026.json` для расчетной сметы и `815/regulation/data/full-2026.json` для полного structured dataset; для текстового чтения начинайте с `815/regulation/full.md`, затем переходите в тематические файлы `815/regulation/full/*.md`.',
        '- Для people при массовом чтении используйте `people/data/people.json`, а detail pages `/people/[slug]/` и `/people/[slug]/index.md` оставляйте для чтения одного профиля.',
        '- Для compare используйте `/compare/data/settlements.json` как основной structured feed, а detail pages и markdown companions - для чтения по одному поселку.',
        '',
        'Skills и discovery',
        '- На корневом сайте public skills сейчас описывают навигацию по разделам, news feed, status feed и people profiles.',
        '- У compare-section свой отдельный public skill index с более узкими skill-файлами по feeds, страницам поселков и рейтингу.',
        '- News, status, people и reglament публикуют discovery через `llms.txt`, `api-catalog`, JSON Schema и OpenAPI.',
      ]);
}

export async function buildHomeMarkdown(): Promise<string> {
  const { news, people, status } = await snapshot();
  const activeStatus = status.active.filter((item) => item.kind === 'incident');

  return join([
    '# Шелково Онлайн',
    '',
    'Текстовое представление корневого сайта и его основных разделов для терминалов и агентов.',
    '',
    '## Разделы',
    `- [Новости](${absoluteUrl(newsUrl())}) — ${count(news.articles.length, ['статья', 'статьи', 'статей'])}; structured feed: ${absoluteUrl(articlesDataUrl())}; RSS: ${absoluteUrl(newsFeedUrl())}; события: optional articles[].events[] с article-local [event-slug].ics`,
    `- [Статус](${absoluteUrl(statusUrl())}) — ${count(status.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}; structured feed: ${absoluteUrl(statusDataUrl())}; RSS: ${absoluteUrl(statusFeedUrl())}`,
    `- [Регламент](${absoluteUrl(reglamentUrl())}) — смета тарифа 2026; structured feed: ${absoluteUrl(reglamentEstimate2026DataUrl())}; full index: ${absoluteUrl(reglamentFullMarkdownUrl())}; full dataset: ${absoluteUrl(reglamentFull2026DataUrl())}; markdown overview: ${absoluteUrl(reglamentMarkdownUrl())}`,
    `- Люди — ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}; markdown overview: ${absoluteUrl(peopleMarkdownUrl())}; structured feed: ${absoluteUrl(peopleDataUrl())}; публичного HTML-индекса нет`,
    `- [Compare](${absoluteUrl('/compare/')}) — сравнение поселков, тарифов и рейтинга; structured feed: ${absoluteUrl('/compare/data/settlements.json')}`,
    '',
    '## Agent Discovery',
    `- API catalog сайта: ${absoluteUrl(siteApiCatalogUrl())}`,
    `- llms.txt: ${absoluteUrl(siteLlmsUrl())}`,
    `- llms-full.txt: ${absoluteUrl(siteLlmsFullUrl())}`,
    `- Public agent skills: ${absoluteUrl(siteSkillsUrl())}`,
    '',
    '## Section Discovery',
    `- Новости: ${absoluteUrl(newsLlmsUrl())}, ${absoluteUrl(newsApiCatalogUrl())}`,
    `- Статус: ${absoluteUrl(statusLlmsUrl())}, ${absoluteUrl(statusApiCatalogUrl())}`,
    `- Регламент: ${absoluteUrl(reglamentLlmsUrl())}, ${absoluteUrl(reglamentApiCatalogUrl())}`,
    `- Люди: ${absoluteUrl(peopleLlmsUrl())}, ${absoluteUrl(peopleApiCatalogUrl())}`,
    `- Compare: ${absoluteUrl('/compare/llms.txt')}, ${absoluteUrl('/compare/.well-known/api-catalog')}`,
  ]);
}
