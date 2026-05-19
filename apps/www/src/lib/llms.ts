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
import { loadPeopleDataWithBacklinks } from './people/load';
import { absoluteUrl } from './site';
import { estimate2026 } from '@/data/reglament/estimate-2026';
import { formatReglamentTariff } from './reglament/format';
import { loadStatusData } from './status/load';
import { publicSurfaceRegistry } from './public-surface';
import type { PublicSurfaceId } from './public-surface';

export {
  siteApiCatalogPath,
  siteApiCatalogUrl,
  siteLlmsFullPath,
  siteLlmsFullUrl,
  siteLlmsPath,
  siteLlmsUrl,
  siteMarkdownPath,
  siteMarkdownUrl,
} from './root-routes';

export const SITE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const registeredSurfacePath = (surfaceId: PublicSurfaceId): string => {
  const surface = publicSurfaceRegistry.surfaces.find(
    (item) => item.id === surfaceId,
  );

  if (surface?.path === undefined) {
    throw new Error(`Public surface ${surfaceId} must provide a stable path`);
  }

  return surface.path;
};

const registeredSurfaceUrl = (surfaceId: PublicSurfaceId): string =>
  absoluteUrl(registeredSurfacePath(surfaceId));

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
  const home = registeredSurfaceUrl('root:index');
  const homeMarkdown = registeredSurfaceUrl('root:index-markdown');
  const short = registeredSurfaceUrl('root:llms');
  const full = registeredSurfaceUrl('root:llms-full');
  const catalog = registeredSurfaceUrl('root:api-catalog');
  const newsHome = registeredSurfaceUrl('news:index');
  const newsMarkdown = registeredSurfaceUrl('news:index-markdown');
  const newsFeed = registeredSurfaceUrl('news:data');
  const newsRss = registeredSurfaceUrl('news:rss');
  const newsCatalog = registeredSurfaceUrl('news:api-catalog');
  const newsLlms = registeredSurfaceUrl('news:llms');
  const statusHome = registeredSurfaceUrl('status:index');
  const statusMarkdown = registeredSurfaceUrl('status:index-markdown');
  const statusFeed = registeredSurfaceUrl('status:data');
  const statusRss = registeredSurfaceUrl('status:rss');
  const statusCatalog = registeredSurfaceUrl('status:api-catalog');
  const statusLlms = registeredSurfaceUrl('status:llms');
  const reglamentHome = registeredSurfaceUrl('reglament:index');
  const reglamentMarkdown = registeredSurfaceUrl('reglament:index-markdown');
  const reglamentFeed = registeredSurfaceUrl('reglament:data-estimate-2026');
  const reglamentFullMarkdown = registeredSurfaceUrl('reglament:full-markdown');
  const reglamentFullAssetsMarkdown = registeredSurfaceUrl(
    'reglament:full-assets-markdown',
  );
  const reglamentFullServicesMarkdown = registeredSurfaceUrl(
    'reglament:full-services-markdown',
  );
  const reglamentFullServiceMapMarkdown = registeredSurfaceUrl(
    'reglament:full-service-map-markdown',
  );
  const reglamentFullChecksMarkdown = registeredSurfaceUrl(
    'reglament:full-checks-markdown',
  );
  const reglamentFullDataset = registeredSurfaceUrl('reglament:data-full-2026');
  const reglamentAssets = registeredSurfaceUrl('reglament:assets');
  const reglamentServices = registeredSurfaceUrl('reglament:services');
  const reglamentLlms = registeredSurfaceUrl('reglament:llms');
  const reglamentCatalog = registeredSurfaceUrl('reglament:api-catalog');
  const peopleMarkdown = registeredSurfaceUrl('people:index-markdown');
  const peopleFeed = registeredSurfaceUrl('people:data');
  const peopleCatalog = registeredSurfaceUrl('people:api-catalog');
  const peopleSchema = registeredSurfaceUrl('people:schema');
  const peopleOpenApi = registeredSurfaceUrl('people:openapi');
  const peopleShort = registeredSurfaceUrl('people:llms');
  const peopleFull = registeredSurfaceUrl('people:llms-full');
  const personHtml = person?.canonical ?? '/people/[slug]/';
  const personMarkdown = person
    ? absoluteUrl(person.markdown_url)
    : '/people/[slug]/index.md';
  const compareHome = registeredSurfaceUrl('compare:index');
  const compareMarkdown = registeredSurfaceUrl('compare:index-markdown');
  const compareFeed = registeredSurfaceUrl('compare:data-settlements');
  const compareLlms = registeredSurfaceUrl('compare:llms');
  const compareCatalog = registeredSurfaceUrl('compare:api-catalog');
  const compareSkills = registeredSurfaceUrl('compare:skills');
  const skills = registeredSurfaceUrl('root:skills');

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
              `Новости: ${newsLlms}; основной feed: ${newsFeed}; календарные события лежат в \`articles[].events[].ics_url\`.`,
              `Статус сервисов: ${statusLlms}; основной feed: ${statusFeed}.`,
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
              `Разделы сайта: \`${registeredSurfacePath('news:index')}\`, \`${registeredSurfacePath('status:index')}\`, \`${registeredSurfacePath('reglament:index')}\`, \`${registeredSurfacePath('people:index-markdown')}\` и \`${registeredSurfacePath('compare:index')}\`.`,
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
              `llms.txt: ${newsLlms}`,
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
              `llms.txt: ${statusLlms}`,
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
              `Для сравнения тарифов используйте \`${registeredSurfacePath('compare:data-settlements')}\` как основной structured feed, а HTML/Markdown-страницы - для чтения по одному поселку.`,
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
  const newsHome = registeredSurfaceUrl('news:index');
  const newsFeed = registeredSurfaceUrl('news:data');
  const newsRss = registeredSurfaceUrl('news:rss');
  const newsLlms = registeredSurfaceUrl('news:llms');
  const newsCatalog = registeredSurfaceUrl('news:api-catalog');
  const statusHome = registeredSurfaceUrl('status:index');
  const statusFeed = registeredSurfaceUrl('status:data');
  const statusRss = registeredSurfaceUrl('status:rss');
  const statusLlms = registeredSurfaceUrl('status:llms');
  const statusCatalog = registeredSurfaceUrl('status:api-catalog');
  const reglamentHome = registeredSurfaceUrl('reglament:index');
  const reglamentFeed = registeredSurfaceUrl('reglament:data-estimate-2026');
  const reglamentFullMarkdown = registeredSurfaceUrl('reglament:full-markdown');
  const reglamentFullDataset = registeredSurfaceUrl('reglament:data-full-2026');
  const reglamentMarkdown = registeredSurfaceUrl('reglament:index-markdown');
  const reglamentLlms = registeredSurfaceUrl('reglament:llms');
  const reglamentCatalog = registeredSurfaceUrl('reglament:api-catalog');
  const peopleMarkdown = registeredSurfaceUrl('people:index-markdown');
  const peopleFeed = registeredSurfaceUrl('people:data');
  const peopleLlms = registeredSurfaceUrl('people:llms');
  const peopleCatalog = registeredSurfaceUrl('people:api-catalog');
  const compareHome = registeredSurfaceUrl('compare:index');
  const compareFeed = registeredSurfaceUrl('compare:data-settlements');
  const compareLlms = registeredSurfaceUrl('compare:llms');
  const compareCatalog = registeredSurfaceUrl('compare:api-catalog');
  const catalog = registeredSurfaceUrl('root:api-catalog');
  const short = registeredSurfaceUrl('root:llms');
  const full = registeredSurfaceUrl('root:llms-full');
  const skills = registeredSurfaceUrl('root:skills');

  return serializeMarkdownNodes([
    md.heading(1, 'Шелково Онлайн'),
    ...markdownBlocks(
      'Текстовое представление корневого сайта и его основных разделов для терминалов и автоматического чтения.',
    ),
    md.heading(2, 'Разделы'),
    markdownList([
      `[Новости](${newsHome}) — ${count(news.articles.length, ['статья', 'статьи', 'статей'])}; structured feed: ${newsFeed}; RSS: ${newsRss}; события: optional \`articles[].events[]\` с article-local \`[event-slug].ics\``,
      `[Статус](${statusHome}) — ${count(status.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeStatus.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])}; structured feed: ${statusFeed}; RSS: ${statusRss}`,
      `[Регламент](${reglamentHome}) — смета тарифа 2026; structured feed: ${reglamentFeed}; full index: ${reglamentFullMarkdown}; full dataset: ${reglamentFullDataset}; markdown overview: ${reglamentMarkdown}`,
      `Люди — ${count(people.profiles.length, ['профиль', 'профиля', 'профилей'])}; markdown overview: ${peopleMarkdown}; structured feed: ${peopleFeed}; публичного HTML-индекса нет`,
      `[Compare](${compareHome}) — сравнение тарифов поселков и рейтинга; structured feed: ${compareFeed}`,
    ]),
    md.heading(2, 'Agent Discovery'),
    markdownList([
      `API catalog сайта: ${catalog}`,
      `llms.txt: ${short}`,
      `llms-full.txt: ${full}`,
      `Инструкции для автоматического чтения: ${skills}`,
    ]),
    md.heading(2, 'Section Discovery'),
    markdownList([
      `Новости: ${newsLlms}, ${newsCatalog}`,
      `Статус: ${statusLlms}, ${statusCatalog}`,
      `Регламент: ${reglamentLlms}, ${reglamentCatalog}`,
      `Люди: ${peopleLlms}, ${peopleCatalog}`,
      `Compare: ${compareLlms}, ${compareCatalog}`,
    ]),
  ]);
}
