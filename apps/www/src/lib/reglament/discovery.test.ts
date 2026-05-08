import { readFile } from 'node:fs/promises';

import { beforeAll, describe, expect, it } from 'vitest';

import { estimate2026 } from '@/data/reglament/estimate-2026';

import {
  REGLAMENT_PUBLIC_PATHS,
  reglamentApiCatalogPath,
  reglamentAssetsPath,
  reglamentEstimateDetailsChecksMarkdownPath,
  reglamentEstimateDetails2026DataPath,
  reglamentEstimateDetailsLaborMarkdownPath,
  reglamentEstimateDetailsMachinesMarkdownPath,
  reglamentEstimateDetailsMarkdownPath,
  reglamentEstimateDetailsMaterialsMarkdownPath,
  reglamentEstimate2026DataPath,
  reglamentFull2026DataPath,
  reglamentFullAssetsMarkdownPath,
  reglamentFullChecksMarkdownPath,
  reglamentFullServiceMapMarkdownPath,
  reglamentFullServicesMarkdownPath,
  reglamentFullSourcePdfPath,
  reglamentServicesPath,
  reglamentSourcePdfPath,
} from './routes';

let buildReglamentPayload: typeof import('./discovery').buildReglamentPayload;
let catalog: typeof import('./discovery').catalog;
let openapi: typeof import('./discovery').openapi;
let schema: typeof import('./discovery').schema;
let self: typeof import('./discovery').self;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildReglamentPayload, catalog, openapi, schema, self } =
    await import('./discovery'));
});

describe('reglament discovery payload', () => {
  it('publishes baseline formulas, source refs and computed values', () => {
    const payload = buildReglamentPayload(estimate2026);
    const rows = payload.sections.flatMap((section) => section.rows);

    expect(payload).toMatchObject({
      id: 'estimate-2026',
      year: 2026,
      tariff_area_sotki: 20_440.54,
      official: {
        annual_gross: 221_264_198,
        tariff_per_sotka_month: 902.07,
      },
      computed: {
        annual_gross: 221_264_198,
        tariff_per_sotka_month: 902.07,
        delta_annual_gross: 0,
        delta_tariff_per_sotka_month: 0,
      },
    });
    expect(payload.formulas.tariff_per_sotka_month).toContain('annual_gross');
    expect(payload.formulas.row_breakdown).toMatchObject({
      fot: 'primary_salary + machinist_salary',
      gross: 'income * (1 + vat_rate)',
    });
    expect(payload.caveats).toEqual(
      expect.arrayContaining([expect.stringContaining('PDF')]),
    );
    expect(payload.sections).toHaveLength(7);
    expect(rows.length).toBeGreaterThan(10);
    expect(
      rows.every(
        (row) =>
          row.source_refs.length > 0 &&
          row.computed.annual_gross === row.baseline.annual_gross,
      ),
    ).toBe(true);
    expect(payload.sections[0]?.rows[0]?.source_refs[0]).toMatchObject({
      pdf: 'final',
      pdf_path: 'apps/www/public/815/regulation/original/final.pdf',
      pdf_url: reglamentSourcePdfPath('final'),
      page: 1,
    });
    expect(payload.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pdf: 'final',
          pdf_path: 'apps/www/public/815/regulation/original/final.pdf',
          pdf_url: reglamentSourcePdfPath('final'),
        }),
      ]),
    );
  });

  it('keeps schema, openapi and catalog aligned with public routes', () => {
    const root = 'https://example.com';
    const apiCatalog = JSON.stringify(catalog(root));
    const jsonSchema = schema(root) as {
      readonly additionalProperties?: boolean;
      readonly $defs?: Record<
        string,
        { readonly additionalProperties?: boolean }
      >;
    };
    const api = openapi(root) as {
      readonly paths?: Record<string, unknown>;
      readonly components?: {
        readonly schemas?: Record<
          string,
          {
            readonly $defs?: Record<
              string,
              { readonly additionalProperties?: boolean }
            >;
          }
        >;
      };
    };
    const apiSchema = api.components?.schemas?.Estimate2026Payload;

    for (const path of REGLAMENT_PUBLIC_PATHS.filter(
      (item) => item !== reglamentApiCatalogPath(),
    )) {
      expect(apiCatalog).toContain(`https://example.com${path}`);
    }

    expect(self(root)).toContain(
      `https://example.com${reglamentApiCatalogPath()}`,
    );
    expect(apiCatalog).toContain(
      `https://example.com${reglamentSourcePdfPath('final')}`,
    );
    expect(jsonSchema.additionalProperties).toBe(false);
    expect(jsonSchema.$defs?.row?.additionalProperties).toBe(false);
    expect(api.paths).toHaveProperty(reglamentEstimate2026DataPath());
    expect(apiSchema?.$defs?.row?.additionalProperties).toBe(false);
  });
});

describe('reglament discovery route smoke', () => {
  it('serves every Task 4 public discovery route', async () => {
    const cases = [
      {
        name: 'markdown companion',
        load: () => import('../../pages/815/regulation/index.md'),
        contentType: 'text/markdown',
        marker: '# Калькулятор тарифа по смете 2026',
      },
      {
        name: 'json feed',
        load: () =>
          import('../../pages/815/regulation/data/estimate-2026.json'),
        contentType: 'application/json',
        marker: '"id": "estimate-2026"',
      },
      {
        name: 'estimate details json feed',
        load: () =>
          import('../../pages/815/regulation/data/estimate-details-2026.json'),
        contentType: 'application/json',
        marker: '"dataset_id": "estimate-details-2026"',
      },
      {
        name: 'full reglament markdown companion',
        load: () => import('../../pages/815/regulation/full.md'),
        contentType: 'text/markdown',
        marker: '# Полный регламент содержания Шелково',
      },
      {
        name: 'full reglament assets markdown companion',
        load: () => import('../../pages/815/regulation/full/assets.md'),
        contentType: 'text/markdown',
        marker: '# Полный регламент: общее имущество',
      },
      {
        name: 'full reglament services markdown companion',
        load: () => import('../../pages/815/regulation/full/services.md'),
        contentType: 'text/markdown',
        marker: '# Полный регламент: услуги',
      },
      {
        name: 'full reglament service map markdown companion',
        load: () => import('../../pages/815/regulation/full/service-map.md'),
        contentType: 'text/markdown',
        marker: '# Полный регламент: сопоставление услуг со сметой',
      },
      {
        name: 'full reglament checks markdown companion',
        load: () => import('../../pages/815/regulation/full/checks.md'),
        contentType: 'text/markdown',
        marker: '# Полный регламент: проверки и допущения',
      },
      {
        name: 'full reglament json feed',
        load: () => import('../../pages/815/regulation/data/full-2026.json'),
        contentType: 'application/json',
        marker: '"dataset_id": "full-reglament-2026"',
      },
      {
        name: 'short llms',
        load: () => import('../../pages/815/regulation/llms.txt'),
        contentType: 'text/plain',
        marker: '/815/regulation/data/full-2026.json',
      },
      {
        name: 'full llms',
        load: () => import('../../pages/815/regulation/llms-full.txt'),
        contentType: 'text/plain',
        marker: '/815/regulation/full.md',
      },
      {
        name: 'json schema',
        load: () =>
          import('../../pages/815/regulation/schemas/estimate-2026.schema.json'),
        contentType: 'application/schema+json',
        marker: 'Estimate2026Payload',
      },
      {
        name: 'openapi',
        load: () =>
          import('../../pages/815/regulation/openapi/estimate-2026.openapi.json'),
        contentType: 'application/vnd.oai.openapi+json',
        marker: 'getReglamentEstimate2026',
      },
      {
        name: 'api catalog',
        load: () =>
          import('../../pages/815/regulation/.well-known/api-catalog'),
        contentType: 'application/linkset+json',
        marker: '/815/regulation/data/full-2026.json',
      },
    ];

    for (const item of cases) {
      const route = await item.load();
      const response = await route.GET({} as never);
      const body = await response.text();

      expect(response.headers.get('Content-Type'), item.name).toContain(
        item.contentType,
      );
      expect(body, item.name).toContain(item.marker);
    }
  });

  it('serves public full-reglament pages and exposes the full dataset route', async () => {
    const root = 'https://example.com';
    const apiCatalog = JSON.stringify(catalog(root));

    expect(apiCatalog).toContain(`${root}${reglamentFull2026DataPath()}`);
    expect(apiCatalog).toContain(
      `${root}${reglamentEstimateDetails2026DataPath()}`,
    );
    expect(apiCatalog).toContain(`${root}${reglamentFullAssetsMarkdownPath()}`);
    expect(apiCatalog).toContain(
      `${root}${reglamentFullServicesMarkdownPath()}`,
    );
    expect(apiCatalog).toContain(
      `${root}${reglamentFullServiceMapMarkdownPath()}`,
    );
    expect(apiCatalog).toContain(`${root}${reglamentFullChecksMarkdownPath()}`);
    expect(apiCatalog).toContain(`${root}${reglamentAssetsPath()}`);
    expect(apiCatalog).toContain(`${root}${reglamentServicesPath()}`);
    expect(apiCatalog).toContain(`${root}${reglamentFullSourcePdfPath()}`);
  });

  it('exposes estimate detail JSON and markdown surfaces to agents', async () => {
    const root = 'https://example.com';
    const apiCatalog = JSON.stringify(catalog(root));
    const shortLlmsRoute = await import('../../pages/815/regulation/llms.txt');
    const fullLlmsRoute =
      await import('../../pages/815/regulation/llms-full.txt');
    const shortLlms = await (await shortLlmsRoute.GET({} as never)).text();
    const fullLlms = await (await fullLlmsRoute.GET({} as never)).text();
    const detailPaths = [
      reglamentEstimateDetails2026DataPath(),
      reglamentEstimateDetailsMarkdownPath(),
      reglamentEstimateDetailsMaterialsMarkdownPath(),
      reglamentEstimateDetailsMachinesMarkdownPath(),
      reglamentEstimateDetailsLaborMarkdownPath(),
      reglamentEstimateDetailsChecksMarkdownPath(),
    ] as const;

    for (const path of detailPaths) {
      expect(REGLAMENT_PUBLIC_PATHS).toContain(path);
      expect(apiCatalog).toContain(`${root}${path}`);
      expect(fullLlms).toContain(path);
    }

    expect(shortLlms).toContain(reglamentEstimateDetails2026DataPath());
    expect(shortLlms).toContain(reglamentEstimateDetailsMarkdownPath());
  });

  it('maps public source PDF URLs to public asset files', async () => {
    const pdfPaths = REGLAMENT_PUBLIC_PATHS.filter((path) =>
      path.endsWith('.pdf'),
    );

    expect(pdfPaths).toEqual(
      expect.arrayContaining([
        reglamentFullSourcePdfPath(),
        reglamentSourcePdfPath('final'),
      ]),
    );

    for (const path of pdfPaths) {
      const file = await readFile(
        new URL(`../../../public${path}`, import.meta.url),
      );
      const marker = new TextDecoder().decode(file.subarray(0, 4));

      expect(marker, path).toBe('%PDF');
    }
  });

  it('explains the short UI tariff unit without renaming machine fields', async () => {
    const markdownRoute = await import('../../pages/815/regulation/index.md');
    const shortLlmsRoute = await import('../../pages/815/regulation/llms.txt');
    const fullLlmsRoute =
      await import('../../pages/815/regulation/llms-full.txt');
    const jsonRoute =
      await import('../../pages/815/regulation/data/estimate-2026.json');
    const markdown = await (await markdownRoute.GET({} as never)).text();
    const shortLlms = await (await shortLlmsRoute.GET({} as never)).text();
    const fullLlms = await (await fullLlmsRoute.GET({} as never)).text();
    const json = await (await jsonRoute.GET({} as never)).text();

    expect(markdown).toContain('UI-лейбл: ₽/сотка');
    expect(shortLlms).toContain('UI-лейбл: ₽/сотка');
    expect(fullLlms).toContain('UI-лейбл: ₽/сотка');
    expect(`${markdown}\n${shortLlms}\n${fullLlms}`).not.toContain(
      '₽/сотка/мес',
    );
    expect(json).toContain('tariff_per_sotka_month');
  });

  it('keeps public PDF URLs and repo paths in agent-facing surfaces', async () => {
    const markdownRoute = await import('../../pages/815/regulation/index.md');
    const shortLlmsRoute = await import('../../pages/815/regulation/llms.txt');
    const fullLlmsRoute =
      await import('../../pages/815/regulation/llms-full.txt');
    const jsonRoute =
      await import('../../pages/815/regulation/data/estimate-2026.json');
    const markdown = await (await markdownRoute.GET({} as never)).text();
    const shortLlms = await (await shortLlmsRoute.GET({} as never)).text();
    const fullLlms = await (await fullLlmsRoute.GET({} as never)).text();
    const json = JSON.parse(
      await (await jsonRoute.GET({} as never)).text(),
    ) as {
      readonly source_refs: readonly {
        readonly pdf: string;
        readonly pdf_path: string;
        readonly pdf_url: string;
      }[];
    };

    expect(`${markdown}\n${shortLlms}\n${fullLlms}`).toContain(
      '/815/regulation/original/final.pdf',
    );
    expect(json.source_refs[0]).toMatchObject({
      pdf: 'final',
      pdf_path: 'apps/www/public/815/regulation/original/final.pdf',
      pdf_url: '/815/regulation/original/final.pdf',
    });
  });
});
