import { absoluteUrl } from '../site';
import type { PersonMentionTarget } from './mentions';
import type { PersonNameCaseForms } from './name-cases';
import type {
  PersonBacklinks,
  PersonContact,
  PersonMentionRef,
  PersonProfile,
} from './schema';
import {
  peopleApiCatalogPath,
  peopleDataPath,
  peopleLlmsFullPath,
  peopleLlmsPath,
  peopleMarkdownPath,
  peopleOpenApiPath,
  peopleSchemaPath,
} from './routes';

export const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
export const OAS = 'application/vnd.oai.openapi+json';

export interface PeopleDiscoveryContact {
  readonly type: PersonContact['type'];
  readonly value: string;
  readonly display: string;
  readonly href: string;
}

export interface PeopleDiscoveryMention {
  readonly slug: string;
  readonly name: string;
  readonly company?: string;
  readonly position?: string;
  readonly html_url: string;
  readonly markdown_url: string;
}

export interface PeopleDiscoveryBacklink {
  readonly section: PersonMentionRef['section'];
  readonly kind: PersonMentionRef['kind'];
  readonly source_id: string;
  readonly title: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly excerpt?: string;
  readonly mentioned_at?: string;
}

export interface PeopleDiscoveryBacklinks {
  readonly news: readonly PeopleDiscoveryBacklink[];
  readonly status: readonly PeopleDiscoveryBacklink[];
  readonly people: readonly PeopleDiscoveryBacklink[];
}

export interface PeopleDiscoveryProfile {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly name_cases?: PersonNameCaseForms;
  readonly company?: string;
  readonly position?: string;
  readonly html_url: string;
  readonly markdown_url: string;
  readonly contacts: readonly PeopleDiscoveryContact[];
  readonly body_markdown: string;
  readonly mentions: readonly PeopleDiscoveryMention[];
  readonly mention_count: number;
  readonly backlinks: PeopleDiscoveryBacklinks;
  readonly backlink_count: number;
}

export interface PeopleDiscoveryPayload {
  readonly stats: {
    readonly profile_count: number;
    readonly mention_count: number;
    readonly backlink_count: number;
  };
  readonly profiles: readonly PeopleDiscoveryProfile[];
}

const PEOPLE_PAYLOAD_SCHEMA = 'PeoplePayload';

const abs = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root}/`).toString();

const fullUrl = (value: string): string => absoluteUrl(value);

const server = (root: string): string => root.replace(/\/$/, '');

const star = (
  value: string,
): readonly { readonly value: string; readonly language: 'ru' }[] => [
  { value, language: 'ru' },
];

const text = (minLength = 0): Record<string, unknown> => ({
  type: 'string',
  ...(minLength > 0 ? { minLength } : {}),
});

const uri = (): Record<string, unknown> => ({
  type: 'string',
  format: 'uri',
});

const dateTime = (): Record<string, unknown> => ({
  type: 'string',
  format: 'date-time',
});

const integer = (minimum = 0): Record<string, unknown> => ({
  type: 'integer',
  minimum,
});

const list = (
  items: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, unknown> => ({
  type: 'array',
  items,
  ...(extra ?? {}),
});

const obj = (
  properties: Record<string, unknown>,
  required: readonly string[],
): Record<string, unknown> => ({
  type: 'object',
  additionalProperties: false,
  properties,
  required,
});

function rewriteSchemaRefs(value: unknown, schemaRef: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteSchemaRefs(item, schemaRef));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (
        key === '$ref' &&
        typeof entry === 'string' &&
        entry.startsWith('#/')
      ) {
        return [key, `${schemaRef}${entry.slice(1)}`];
      }

      return [key, rewriteSchemaRefs(entry, schemaRef)];
    }),
  );
}

const backlinksCount = (backlinks: PersonBacklinks): number =>
  backlinks.news.length + backlinks.status.length + backlinks.people.length;

const contact = (item: PersonContact): PeopleDiscoveryContact => ({
  type: item.type,
  value: item.value,
  display: item.display,
  href: item.href,
});

const mention = (item: PersonMentionTarget): PeopleDiscoveryMention => ({
  slug: item.slug,
  name: item.name,
  ...(item.company ? { company: item.company } : {}),
  ...(item.position ? { position: item.position } : {}),
  html_url: fullUrl(item.html_url),
  markdown_url: fullUrl(item.markdown_url),
});

const backlink = (item: PersonMentionRef): PeopleDiscoveryBacklink => ({
  section: item.section,
  kind: item.kind,
  source_id: item.source_id,
  title: item.title,
  html_url: fullUrl(item.html_url),
  markdown_url: fullUrl(item.markdown_url),
  ...(item.excerpt ? { excerpt: item.excerpt } : {}),
  ...(item.mentioned_at ? { mentioned_at: item.mentioned_at } : {}),
});

const backlinks = (value: PersonBacklinks): PeopleDiscoveryBacklinks => ({
  news: value.news.map(backlink),
  status: value.status.map(backlink),
  people: value.people.map(backlink),
});

const profile = (item: PersonProfile): PeopleDiscoveryProfile => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  ...(item.name_cases ? { name_cases: item.name_cases } : {}),
  ...(item.company ? { company: item.company } : {}),
  ...(item.position ? { position: item.position } : {}),
  html_url: item.canonical,
  markdown_url: fullUrl(item.markdown_url),
  contacts: item.contacts.map(contact),
  body_markdown: item.body,
  mentions: item.mentions.map(mention),
  mention_count: item.mentions.length,
  backlinks: backlinks(item.backlinks),
  backlink_count: backlinksCount(item.backlinks),
});

export const buildPeoplePayload = (data: {
  readonly profiles: readonly PersonProfile[];
}): PeopleDiscoveryPayload => {
  const profiles = data.profiles.map(profile);

  return {
    stats: {
      profile_count: profiles.length,
      mention_count: profiles.reduce(
        (total, item) => total + item.mention_count,
        0,
      ),
      backlink_count: profiles.reduce(
        (total, item) => total + item.backlink_count,
        0,
      ),
    },
    profiles,
  };
};

export function schema(root: string): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: abs(root, peopleSchemaPath()),
    title: 'PeoplePayload',
    description:
      'Read-only полный feed people-section с публичными профилями, контактами, mentions и backlinks по всему сайту.',
    type: 'object',
    additionalProperties: false,
    required: ['stats', 'profiles'],
    properties: {
      stats: {
        $ref: '#/$defs/stats',
      },
      profiles: list({
        $ref: '#/$defs/profile',
      }),
    },
    $defs: {
      contactType: {
        enum: ['phone', 'telegram'],
      },
      section: {
        enum: ['news', 'status', 'people'],
      },
      kind: {
        enum: ['article', 'addendum', 'incident', 'person'],
      },
      nameCases: obj(
        {
          gen: text(1),
          dat: text(1),
          acc: text(1),
          ins: text(1),
          prep: text(1),
        },
        [],
      ),
      contact: obj(
        {
          type: {
            $ref: '#/$defs/contactType',
          },
          value: text(1),
          display: text(1),
          href: uri(),
        },
        ['type', 'value', 'display', 'href'],
      ),
      mention: obj(
        {
          slug: text(1),
          name: text(1),
          company: text(1),
          position: text(1),
          html_url: uri(),
          markdown_url: uri(),
        },
        ['slug', 'name', 'html_url', 'markdown_url'],
      ),
      backlink: obj(
        {
          section: {
            $ref: '#/$defs/section',
          },
          kind: {
            $ref: '#/$defs/kind',
          },
          source_id: text(1),
          title: text(1),
          html_url: uri(),
          markdown_url: uri(),
          excerpt: text(1),
          mentioned_at: dateTime(),
        },
        ['section', 'kind', 'source_id', 'title', 'html_url', 'markdown_url'],
      ),
      backlinks: obj(
        {
          news: list({
            $ref: '#/$defs/backlink',
          }),
          status: list({
            $ref: '#/$defs/backlink',
          }),
          people: list({
            $ref: '#/$defs/backlink',
          }),
        },
        ['news', 'status', 'people'],
      ),
      profile: obj(
        {
          id: text(1),
          slug: text(1),
          name: text(1),
          name_cases: {
            $ref: '#/$defs/nameCases',
          },
          company: text(1),
          position: text(1),
          html_url: uri(),
          markdown_url: uri(),
          contacts: list({
            $ref: '#/$defs/contact',
          }),
          body_markdown: text(),
          mentions: list({
            $ref: '#/$defs/mention',
          }),
          mention_count: integer(0),
          backlinks: {
            $ref: '#/$defs/backlinks',
          },
          backlink_count: integer(0),
        },
        [
          'id',
          'slug',
          'name',
          'html_url',
          'markdown_url',
          'contacts',
          'body_markdown',
          'mentions',
          'mention_count',
          'backlinks',
          'backlink_count',
        ],
      ),
      stats: obj(
        {
          profile_count: integer(0),
          mention_count: integer(0),
          backlink_count: integer(0),
        },
        ['profile_count', 'mention_count', 'backlink_count'],
      ),
    },
  };
}

export function openapi(root: string): Record<string, unknown> {
  const schemaRef = `#/components/schemas/${PEOPLE_PAYLOAD_SCHEMA}`;
  const body = Object.fromEntries(
    Object.entries(schema(root)).filter(
      ([key]) => key !== '$schema' && key !== '$id',
    ),
  );
  const componentBody = rewriteSchemaRefs(body, schemaRef);

  return {
    openapi: '3.1.0',
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    info: {
      title: 'Шелково People Feed',
      version: '1.0.0',
      description:
        'Read-only OpenAPI wrapper для /people/data/people.json с публичными профилями, contacts, mentions и backlinks.',
    },
    servers: [
      {
        url: server(root),
      },
    ],
    paths: {
      [peopleDataPath()]: {
        get: {
          operationId: 'getPeopleProfiles',
          summary: 'Read full people feed',
          description:
            'Возвращает основной structured feed people-section с профилями, контактами, mentions и backlinks.',
          responses: {
            200: {
              description: 'Full people feed',
              content: {
                'application/json': {
                  schema: {
                    $ref: schemaRef,
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        [PEOPLE_PAYLOAD_SCHEMA]: componentBody,
      },
    },
  };
}

export function catalog(root: string): Record<string, unknown> {
  return {
    linkset: [
      {
        anchor: abs(root, peopleMarkdownPath()),
        item: [
          {
            href: abs(root, peopleMarkdownPath()),
            type: 'text/markdown',
            'title*': star(
              'Markdown overview people-section без публичного HTML index',
            ),
          },
          {
            href: abs(root, peopleDataPath()),
            type: 'application/json',
            'title*': star('Основной машиночитаемый feed people-section'),
          },
          {
            href: abs(root, peopleLlmsPath()),
            type: 'text/plain',
            'title*': star('Короткий агентный обзор llms.txt'),
          },
          {
            href: abs(root, peopleLlmsFullPath()),
            type: 'text/plain',
            'title*': star('Расширенный агентный обзор llms-full.txt'),
          },
        ],
        'service-desc': [
          {
            href: abs(root, peopleSchemaPath()),
            type: 'application/schema+json',
            'title*': star('JSON Schema для people feed'),
          },
          {
            href: abs(root, peopleOpenApiPath()),
            type: OAS,
            'title*': star('OpenAPI для people feed'),
          },
        ],
      },
    ],
  };
}

export const links = (root: string): string =>
  [
    `<${abs(root, peopleSchemaPath())}>; rel="service-desc"; type="application/schema+json"`,
    `<${abs(root, peopleOpenApiPath())}>; rel="service-desc"; type="${OAS}"`,
    `<${abs(root, peopleApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`,
  ].join(', ');

export const self = (root: string): string =>
  `<${abs(root, peopleApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"; profile="${PROFILE}"`;
