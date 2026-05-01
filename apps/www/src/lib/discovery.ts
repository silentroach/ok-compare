import {
  apiCatalogPath as newsApiCatalogPath,
  articlesDataPath,
  llmsPath as newsLlmsPath,
  newsPath,
} from './news/routes';
import {
  siteApiCatalogUrl,
  siteLlmsFullUrl,
  siteLlmsUrl,
  siteMarkdownUrl,
} from './llms';
import { siteSkillsUrl } from './skills';
import {
  statusApiCatalogPath,
  statusDataPath,
  statusLlmsPath,
  statusPath,
} from './status/routes';

export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';

const COMPARE_PATH = '/compare/';
const COMPARE_DATA = '/compare/data/settlements.json';
const COMPARE_LLMS = '/compare/llms.txt';
const COMPARE_CATALOG = '/compare/.well-known/api-catalog';
const COMPARE_SKILLS = '/compare/.well-known/agent-skills/index.json';
const abs = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root}/`).toString();

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
            href: abs(root, siteMarkdownUrl()),
            type: 'text/markdown',
            'title*': star('Markdown companion корневой страницы'),
          },
          {
            href: abs(root, siteLlmsUrl()),
            type: 'text/plain',
            'title*': star('Короткий агентный обзор корневого сайта'),
          },
          {
            href: abs(root, siteLlmsFullUrl()),
            type: 'text/plain',
            'title*': star('Расширенный агентный обзор корневого сайта'),
          },
          {
            href: abs(root, siteSkillsUrl()),
            type: 'application/json',
            'title*': star('Индекс public agent skills корневого сайта'),
          },
        ],
      },
      {
        anchor: abs(root, newsPath()),
        item: [
          {
            href: abs(root, articlesDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed news-section'),
          },
          {
            href: abs(root, newsLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор news-section'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, newsApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog news-section'),
          },
        ],
      },
      {
        anchor: abs(root, statusPath()),
        item: [
          {
            href: abs(root, statusDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed status-section'),
          },
          {
            href: abs(root, statusLlmsPath()),
            type: 'text/plain',
            'title*': star('Агентный обзор status-section'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, statusApiCatalogPath()),
            type: 'application/linkset+json',
            'title*': star('API catalog status-section'),
          },
        ],
      },
      {
        anchor: abs(root, COMPARE_PATH),
        item: [
          {
            href: abs(root, COMPARE_DATA),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed compare-section'),
          },
          {
            href: abs(root, COMPARE_LLMS),
            type: 'text/plain',
            'title*': star('Агентный обзор compare-section'),
          },
          {
            href: abs(root, COMPARE_SKILLS),
            type: 'application/json',
            'title*': star('Индекс public agent skills compare-section'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, COMPARE_CATALOG),
            type: 'application/linkset+json',
            'title*': star('API catalog compare-section'),
          },
        ],
      },
    ],
  };
}

export const self = (root: string): string =>
  `<${abs(root, siteApiCatalogUrl())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
