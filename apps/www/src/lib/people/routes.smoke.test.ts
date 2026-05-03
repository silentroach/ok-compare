import { beforeAll, describe, expect, it, vi } from 'vitest';

import type { PersonProfile } from './schema';

const fixtures = vi.hoisted(() => {
  const profile: PersonProfile = {
    id: 'kschemelinin',
    slug: 'kschemelinin',
    name: 'Кирилл Щемелинин',
    url: '/people/kschemelinin/',
    markdown_url: '/people/kschemelinin/index.md',
    canonical: 'https://example.com/people/kschemelinin/',
    contacts: [
      {
        type: 'telegram',
        value: '@Kirill_ZemlyaMO',
        display: '@Kirill_ZemlyaMO',
        href: 'https://t.me/Kirill_ZemlyaMO',
      },
    ],
    body: 'Как отметил [Кирилл Щемелинин](/people/kschemelinin/), проблема редкая.',
    mentions: [],
    backlinks: {
      news: [],
      status: [
        {
          section: 'status',
          kind: 'incident',
          source_id: '2026/04/electricity-river-10kv-line-damage',
          title: 'Отключение электричества в Шелково Ривер',
          html_url:
            '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
          markdown_url:
            '/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md',
          excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
          mentioned_at: '2026-04-22T11:30:00.000+03:00',
          sort_key: 1,
        },
      ],
      people: [],
    },
  };

  return {
    llmsBuild: vi.fn(async (kind: 'short' | 'full') =>
      kind === 'short' ? 'people short llms\n' : 'people full llms\n',
    ),
    profile,
  };
});

vi.mock('@/lib/people/load', () => ({
  loadPeopleProfiles: async () => [fixtures.profile],
  loadPeopleProfilesWithBacklinks: async () => [fixtures.profile],
  loadPeopleDataWithBacklinks: async () => ({
    profiles: [fixtures.profile],
  }),
  loadPersonProfileWithBacklinks: async (slug: string) =>
    slug === fixtures.profile.slug ? fixtures.profile : undefined,
}));

vi.mock('@/lib/people/llms', () => ({
  build: fixtures.llmsBuild,
}));

beforeAll(() => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });
});

describe('people route smoke', () => {
  it('serves the person markdown companion and static paths', async () => {
    const route = await import('../../pages/people/[slug]/index.md');
    const response = await route.GET({
      params: {
        slug: fixtures.profile.slug,
      },
    } as never);

    expect(await route.getStaticPaths()).toEqual([
      {
        params: {
          slug: fixtures.profile.slug,
        },
      },
    ]);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(await response.text()).toContain('# Кирилл Щемелинин');
  });

  it('serves the people markdown overview without a public html index', async () => {
    const route = await import('../../pages/people/index.md');
    const response = await route.GET({} as never);
    const body = await response.text();

    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(body).toContain('# Люди Шелково');
    expect(body).toContain('Публичного HTML-индекса `/people/` нет');
    expect(body).toContain('https://example.com/people/kschemelinin/index.md');
  });

  it('serves llms short and full texts', async () => {
    const shortRoute = await import('../../pages/people/llms.txt');
    const fullRoute = await import('../../pages/people/llms-full.txt');
    const short = await shortRoute.GET({} as never);
    const full = await fullRoute.GET({} as never);

    expect(short.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(full.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(await short.text()).toBe('people short llms\n');
    expect(await full.text()).toBe('people full llms\n');
  });

  it('serves the structured people feed with backlinks', async () => {
    const route = await import('../../pages/people/data/people.json');
    const response = await route.GET({} as never);
    const payload = JSON.parse(await response.text()) as {
      readonly profiles: readonly [
        {
          readonly slug: string;
          readonly backlinks: {
            readonly status: readonly { readonly source_id: string }[];
          };
        },
      ];
    };

    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(response.headers.get('Link')).toContain(
      '/people/.well-known/api-catalog',
    );
    expect(payload.profiles[0]?.slug).toBe('kschemelinin');
    expect(payload.profiles[0]?.backlinks.status[0]?.source_id).toBe(
      '2026/04/electricity-river-10kv-line-damage',
    );
  });

  it('serves people api-catalog, schema, and openapi documents', async () => {
    const catalogRoute =
      await import('../../pages/people/.well-known/api-catalog');
    const schemaRoute =
      await import('../../pages/people/schemas/people.schema.json');
    const openapiRoute =
      await import('../../pages/people/openapi/people.openapi.json');
    const catalog = await catalogRoute.GET({} as never);
    const head = await catalogRoute.HEAD({} as never);
    const schema = await schemaRoute.GET({} as never);
    const openapi = await openapiRoute.GET({} as never);
    const catalogBody = JSON.parse(await catalog.text()) as {
      readonly linkset: readonly [
        {
          readonly anchor: string;
        },
      ];
    };
    const schemaBody = JSON.parse(await schema.text()) as {
      readonly $id: string;
    };
    const openapiBody = JSON.parse(await openapi.text()) as {
      readonly paths?: Record<string, unknown>;
    };

    expect(catalog.headers.get('Content-Type')).toContain(
      'application/linkset+json',
    );
    expect(head.headers.get('Link')).toContain(
      '/people/.well-known/api-catalog',
    );
    expect(catalogBody.linkset[0]?.anchor).toBe(
      'https://example.com/people/index.md',
    );
    expect(schema.headers.get('Content-Type')).toBe(
      'application/schema+json; charset=utf-8',
    );
    expect(schemaBody.$id).toBe(
      'https://example.com/people/schemas/people.schema.json',
    );
    expect(openapi.headers.get('Content-Type')).toBe(
      'application/vnd.oai.openapi+json; charset=utf-8',
    );
    expect(openapiBody.paths?.['/people/data/people.json']).toBeDefined();
  });
});
