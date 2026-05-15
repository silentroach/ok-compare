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

type CatalogEntry = {
  readonly href?: string;
  readonly type?: string;
  readonly 'title*'?:
    | string
    | readonly { readonly language?: string; readonly value?: string }[];
};

type CatalogLinkset = {
  readonly item?: readonly CatalogEntry[];
  readonly 'service-desc'?: readonly CatalogEntry[];
};

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildReglamentPayload, catalog, openapi, schema, self } =
    await import('./discovery'));
});

const catalogEntries = (root: string): readonly CatalogEntry[] => {
  const body = catalog(root) as {
    readonly linkset?: readonly CatalogLinkset[];
  };

  return (body.linkset ?? []).flatMap((entry) => [
    ...(entry.item ?? []),
    ...(entry['service-desc'] ?? []),
  ]);
};

const catalogTitle = (entry: CatalogEntry): string => {
  const title = entry['title*'];

  if (typeof title === 'string') {
    return title;
  }

  return title?.[0]?.value ?? '';
};

const publicCatalogSnapshot = (
  root: string,
): readonly {
  readonly href: string;
  readonly type: string;
  readonly title: string;
}[] =>
  catalogEntries(root).map((entry) => ({
    href: entry.href ?? '',
    type: entry.type ?? '',
    title: catalogTitle(entry),
  }));

const markdownSection = (markdown: string, title: string): string => {
  const lines = markdown.trimEnd().split('\n');
  const start = lines.findIndex((line) => line === `## ${title}`);

  if (start === -1) {
    return '';
  }

  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith('## '),
  );

  return lines.slice(start, next === -1 ? undefined : next).join('\n');
};

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
    const interestingPaths = new Set([
      reglamentFull2026DataPath(),
      reglamentEstimateDetails2026DataPath(),
      reglamentFullAssetsMarkdownPath(),
      reglamentFullServicesMarkdownPath(),
      reglamentFullServiceMapMarkdownPath(),
      reglamentFullChecksMarkdownPath(),
      reglamentAssetsPath(),
      reglamentServicesPath(),
      reglamentFullSourcePdfPath(),
    ]);

    expect(
      publicCatalogSnapshot(root).filter((entry) =>
        interestingPaths.has(new URL(entry.href).pathname),
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "href": "https://example.com/815/regulation/full/assets.md",
          "title": "Markdown полного регламента: общее имущество",
          "type": "text/markdown",
        },
        {
          "href": "https://example.com/815/regulation/full/services.md",
          "title": "Markdown полного регламента: услуги",
          "type": "text/markdown",
        },
        {
          "href": "https://example.com/815/regulation/full/service-map.md",
          "title": "Markdown полного регламента: сопоставление услуг со сметой",
          "type": "text/markdown",
        },
        {
          "href": "https://example.com/815/regulation/full/checks.md",
          "title": "Markdown полного регламента: проверки и допущения",
          "type": "text/markdown",
        },
        {
          "href": "https://example.com/815/regulation/data/estimate-details-2026.json",
          "title": "Детальный машиночитаемый JSON сметы регламента 2026",
          "type": "application/json",
        },
        {
          "href": "https://example.com/815/regulation/data/full-2026.json",
          "title": "Набор данных полного регламента: имущество, услуги, сопоставления и заметки аудита",
          "type": "application/json",
        },
        {
          "href": "https://example.com/815/regulation/assets/",
          "title": "Страница общего имущества из полного регламента",
          "type": "text/html",
        },
        {
          "href": "https://example.com/815/regulation/services/",
          "title": "Страница услуг и сопоставления со сметой",
          "type": "text/html",
        },
        {
          "href": "https://example.com/815/regulation/original/full.pdf",
          "title": "Исходный PDF полного регламента",
          "type": "application/pdf",
        },
      ]
    `);
  });

  it('exposes estimate detail JSON and markdown surfaces for automated reading', async () => {
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

    const publicPathMatches = detailPaths.map((path) => ({
      path,
      publicPath: REGLAMENT_PUBLIC_PATHS.some((item) => item === path),
      catalog: apiCatalog.includes(`${root}${path}`),
      fullLlms: fullLlms.includes(path),
    }));

    expect({
      publicPathMatches,
      shortSection: markdownSection(shortLlms, 'Что открыть для проверки'),
      fullSection: markdownSection(fullLlms, 'Как выбирать источник'),
    }).toMatchInlineSnapshot(`
      {
        "fullSection": "## Как выбирать источник

      - Агрегированная смета: \`estimate-2026.json\` и \`index.md\` — официальный baseline по разделам и строкам, базовые частоты, годовые суммы, формулы и breakdown.
      - Услуги полного регламента: \`full-2026.json\`, \`full/services.md\` и \`full/service-map.md\` — перечень услуг, периодичность, исходные формулировки и сопоставление с \`estimate_row_id\`.
      - Детальные ресурсы: \`estimate-details-2026.json\` и \`details/*.md\` — work items, resources, control totals, source refs и причины \`needs_check\` из маленьких PDF.
      - Практический порядок ответа: услуга и периодичность из full-слоя, строка и сумма из агрегированной сметы, состав ресурсов и проверки из detail-слоя.
      - Пример вопроса: для полива дорог сравните \`summer-road-dust-suppression\`, \`summer-road-watering\`, строку \`cleaning-summer-mechanized\` и detail-ресурсы воды/поливомоечной техники.
      ",
        "publicPathMatches": [
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/data/estimate-details-2026.json",
            "publicPath": true,
          },
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/details.md",
            "publicPath": true,
          },
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/details/materials.md",
            "publicPath": true,
          },
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/details/machines.md",
            "publicPath": true,
          },
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/details/labor.md",
            "publicPath": true,
          },
          {
            "catalog": true,
            "fullLlms": true,
            "path": "/815/regulation/details/checks.md",
            "publicPath": true,
          },
        ],
        "shortSection": "## Что открыть для проверки

      - Агрегированная смета: \`estimate-2026.json\` и \`index.md\` — разделы, строки, итоговые суммы, базовые частоты и breakdown.
      - Услуги полного регламента: \`full-2026.json\`, \`full/services.md\` и \`full/service-map.md\` — формулировки услуг, периодичность и связь со строками сметы.
      - Детальные ресурсы: \`estimate-details-2026.json\` и \`details/*.md\` — работы, материалы, машины, труд, подрядчики, контрольные итоги и \`needs_check\` из маленьких PDF.
      - Связки: \`estimate_row_id\` соединяет detail-факты с агрегированной сметой; \`service_ids\` соединяют work items с услугами полного регламента.
      - Пример проверки: для полива дорог сопоставьте услуги \`summer-road-dust-suppression\` и \`summer-road-watering\`, строку \`cleaning-summer-mechanized\` и detail-ресурсы полива.",
      }
    `);
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

    expect(markdown).toContain('В интерфейсе тариф показывается как ₽/сотка');
    expect(shortLlms).toContain('В интерфейсе тариф показывается как ₽/сотка');
    expect(fullLlms).toContain('В интерфейсе тариф показывается как ₽/сотка');
    expect(`${markdown}\n${shortLlms}\n${fullLlms}`).not.toContain(
      '₽/сотка/мес',
    );
    expect(json).toContain('tariff_per_sotka_month');
  });

  it('keeps public PDF URLs and repo paths in public surfaces', async () => {
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
