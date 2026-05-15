import {
  apiCatalogPath as newsApiCatalogPath,
  articlesDataPath,
  llmsPath as newsLlmsPath,
  newsPath,
} from './news/routes';
import {
  peopleApiCatalogPath,
  peopleDataPath,
  peopleLlmsFullPath,
  peopleLlmsPath,
  peopleMarkdownPath,
} from './people/routes';
import {
  siteApiCatalogUrl,
  siteLlmsFullUrl,
  siteLlmsUrl,
  siteMarkdownUrl,
} from './llms';
import { siteSkillsUrl } from './skills';
import {
  reglamentApiCatalogPath,
  reglamentEstimate2026DataPath,
  reglamentAssetsPath,
  reglamentFull2026DataPath,
  reglamentFullAssetsMarkdownPath,
  reglamentFullChecksMarkdownPath,
  reglamentFullMarkdownPath,
  reglamentFullServiceMapMarkdownPath,
  reglamentFullServicesMarkdownPath,
  reglamentLlmsFullPath,
  reglamentLlmsPath,
  reglamentMarkdownPath,
  reglamentPath,
  reglamentServicesPath,
} from './reglament/routes';
import {
  statusApiCatalogPath,
  statusDataPath,
  statusLlmsPath,
  statusPath,
} from './status/routes';

export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';

const COMPARE_PATH = '/815/compare/';
const COMPARE_DATA = '/815/compare/data/settlements.json';
const COMPARE_LLMS = '/815/compare/llms.txt';
const COMPARE_CATALOG = '/815/compare/.well-known/api-catalog';
const COMPARE_SKILLS = '/815/compare/.well-known/agent-skills/index.json';

const abs = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root}/`).toString();

const full = (root: string, path: string): string =>
  new URL(path, `${root}/`).toString();

const star = (
  value: string,
): readonly { readonly value: string; readonly language: 'ru' }[] => [
  { value, language: 'ru' },
];

export function catalog(root: string): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: abs(root, '/'),
        item: [
          {
            href: abs(root, '/'),
            type: 'text/html',
            'title*': star('Главная страница сайта'),
          },
          {
            href: full(root, siteMarkdownUrl()),
            type: 'text/markdown',
            'title*': star('Markdown companion корневой страницы'),
          },
          {
            href: full(root, siteLlmsUrl()),
            type: 'text/plain',
            'title*': star('Короткий обзор корневого сайта'),
          },
          {
            href: full(root, siteLlmsFullUrl()),
            type: 'text/plain',
            'title*': star('Подробный обзор корневого сайта'),
          },
          {
            href: full(root, siteSkillsUrl()),
            type: 'application/json',
            'title*': star(
              'Индекс инструкций для автоматического чтения корневого сайта',
            ),
          },
        ],
      },
      {
        anchor: abs(root, newsPath()),
        item: [
          {
            href: abs(root, articlesDataPath()),
            type: 'application/json',
            'title*': star(
              'Основной машиночитаемый feed новостей, включая optional events',
            ),
          },
          {
            href: abs(root, newsLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор новостей'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, newsApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog новостей'),
          },
        ],
      },
      {
        anchor: abs(root, statusPath()),
        item: [
          {
            href: abs(root, statusDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed статуса'),
          },
          {
            href: abs(root, statusLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор статуса'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, statusApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog статуса'),
          },
        ],
      },
      {
        anchor: abs(root, reglamentPath()),
        item: [
          {
            href: abs(root, reglamentMarkdownPath()),
            type: 'text/markdown',
            'title*': star('Markdown companion регламента'),
          },
          {
            href: abs(root, reglamentFullMarkdownPath()),
            type: 'text/markdown',
            'title*': star('Markdown index полного регламента'),
          },
          {
            href: abs(root, reglamentFullAssetsMarkdownPath()),
            type: 'text/markdown',
            'title*': star('Markdown полного регламента: общее имущество'),
          },
          {
            href: abs(root, reglamentFullServicesMarkdownPath()),
            type: 'text/markdown',
            'title*': star('Markdown полного регламента: услуги'),
          },
          {
            href: abs(root, reglamentFullServiceMapMarkdownPath()),
            type: 'text/markdown',
            'title*': star(
              'Markdown полного регламента: сопоставление услуг со сметой',
            ),
          },
          {
            href: abs(root, reglamentFullChecksMarkdownPath()),
            type: 'text/markdown',
            'title*': star('Markdown полного регламента: проверки и допущения'),
          },
          {
            href: abs(root, reglamentEstimate2026DataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed регламента'),
          },
          {
            href: abs(root, reglamentFull2026DataPath()),
            type: 'application/json',
            'title*': star('Dataset полного регламента'),
          },
          {
            href: abs(root, reglamentAssetsPath()),
            type: 'text/html',
            'title*': star('Общее имущество регламента'),
          },
          {
            href: abs(root, reglamentServicesPath()),
            type: 'text/html',
            'title*': star('Услуги регламента'),
          },
          {
            href: abs(root, reglamentLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор регламента'),
          },
          {
            href: abs(root, reglamentLlmsFullPath()),
            type: 'text/plain',
            'title*': star('Подробный обзор регламента'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, reglamentApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog регламента'),
          },
        ],
      },
      {
        anchor: abs(root, peopleMarkdownPath()),
        item: [
          {
            href: abs(root, peopleMarkdownPath()),
            type: 'text/markdown',
            'title*': star(
              'Markdown overview профилей людей без публичного HTML index',
            ),
          },
          {
            href: abs(root, peopleDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed профилей людей'),
          },
          {
            href: abs(root, peopleLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор профилей людей'),
          },
          {
            href: abs(root, peopleLlmsFullPath()),
            type: 'text/plain',
            'title*': star('Подробный обзор профилей людей'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, peopleApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog профилей людей'),
          },
        ],
      },
      {
        anchor: abs(root, COMPARE_PATH),
        item: [
          {
            href: abs(root, COMPARE_DATA),
            type: 'application/json',
            'title*': star(
              'Основной машиночитаемый feed сравнения тарифов поселков',
            ),
          },
          {
            href: abs(root, COMPARE_LLMS),
            type: 'text/plain',
            'title*': star('Агентный обзор сравнения тарифов поселков'),
          },
          {
            href: abs(root, COMPARE_SKILLS),
            type: 'application/json',
            'title*': star(
              'Индекс инструкций для автоматического чтения сравнения тарифов поселков',
            ),
          },
        ],
        'service-desc': [
          {
            href: abs(root, COMPARE_CATALOG),
            type: 'application/linkset+json',
            'title*': star('API catalog сравнения тарифов поселков'),
          },
        ],
      },
    ],
  };
}

export const self = (root: string): string =>
  `<${full(root, siteApiCatalogUrl())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
