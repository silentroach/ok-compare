import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexPath = join(process.cwd(), 'src/pages/815/compare/index.astro');
const settlementPath = join(
  process.cwd(),
  'src/pages/815/compare/settlements/[slug]/index.astro',
);
const runtimePath = join(process.cwd(), 'src/scripts/site-runtime.ts');
const explorerPath = join(
  process.cwd(),
  'src/compare/components/SettlementsExplorer.svelte',
);
const cardPath = join(
  process.cwd(),
  'src/compare/components/SettlementCard.svelte',
);
const fullAdapterPath = join(process.cwd(), 'src/compare/lib/full.ts');
const explorerAdapterPath = join(process.cwd(), 'src/compare/lib/explorer.ts');
const fullJsonRoutePath = join(
  process.cwd(),
  'src/pages/815/compare/data/settlements.json.ts',
);
const explorerJsonRoutePath = join(
  process.cwd(),
  'src/pages/815/compare/data/explorer.json.ts',
);
const tablePaths = [
  'src/compare/components/CommonSpacesTable.svelte',
  'src/compare/components/InfrastructureTable.svelte',
  'src/compare/components/ServiceTable.svelte',
  'src/compare/components/SourcesList.svelte',
].map((path) => join(process.cwd(), path));

/**
 * Intentional architecture guard for the main list:
 * 1) We keep a full static list in HTML for bots and no-JS users.
 * 2) Interactive explorer must be client-only and load data from data/explorer.json.
 * 3) Passing settlements/comparisons/stats into SettlementsExplorer props in Astro
 *    serializes large payload into HTML again (the regression we had).
 */
const loadIndex = (): string => readFileSync(indexPath, 'utf-8');
const loadSettlement = (): string => readFileSync(settlementPath, 'utf-8');
const loadRuntime = (): string => readFileSync(runtimePath, 'utf-8');
const loadExplorer = (): string => readFileSync(explorerPath, 'utf-8');
const loadCard = (): string => readFileSync(cardPath, 'utf-8');
const loadFullAdapter = (): string => readFileSync(fullAdapterPath, 'utf-8');
const loadExplorerAdapter = (): string =>
  readFileSync(explorerAdapterPath, 'utf-8');
const loadFullJsonRoute = (): string =>
  readFileSync(fullJsonRoutePath, 'utf-8');
const loadExplorerJsonRoute = (): string =>
  readFileSync(explorerJsonRoutePath, 'utf-8');
const loadTables = (): Record<string, string> =>
  Object.fromEntries(
    tablePaths.map((path) => [path, readFileSync(path, 'utf-8')]),
  );

const rawSettlementTokens = [
  'short_name',
  'is_baseline',
  'address_text',
  'map_url',
  'normalized_per_sotka_month',
  'normalized_is_estimate',
  'water_in_tariff',
  'common_spaces',
  'service_model',
  'management_company',
];

describe('index page explorer architecture', () => {
  it('uses the shared page header without compare-home compensation CSS', () => {
    const code = loadIndex();

    expect(code).not.toContain("import '@/compare/styles/global.css';");
    expect(code).not.toContain('compare-landing-header');
    expect(code).toContain('<section class="ui-page-header">');
  });

  it('uses client-only explorer with json source', () => {
    const code = loadIndex();

    expect(code).toContain("import { withBase } from '@/compare/lib/url';");
    expect(code).toContain("const dataUrl = withBase('data/explorer.json');");
    expect(code).toContain(
      '<SettlementsExplorer dataUrl={dataUrl} client:only="svelte" />',
    );
  });

  it('keeps static fallback list for bots and no-js', () => {
    const code = loadIndex();
    const runtime = loadRuntime();

    expect(code).toContain(
      "import SettlementCard from '@/compare/components/SettlementCard.svelte';",
    );
    expect(code).toContain('<div id="settlements-static">');
    expect(code).toContain('<SettlementCard');
    expect(runtime).toContain("window.addEventListener('explorer:ready'");
    expect(runtime).toContain("getElementById('settlements-static')");
  });

  it('does not inline large list payload into explorer island props', () => {
    const code = loadIndex();
    const tag = code.match(/<SettlementsExplorer[\s\S]*?\/>/)?.[0] ?? '';
    const bad = [
      {
        token: 'settlements={cards}',
        why: 'This inlines the full list into HTML instead of loading /data/explorer.json on client.',
      },
      {
        token: 'comparisons={comparisonsObj}',
        why: 'This inlines comparison payload into HTML and duplicates data that should come from JSON.',
      },
      {
        token: 'stats={stats}',
        why: 'Explorer stats should come from JSON in client-only mode, not from island props.',
      },
      {
        token: 'client:idle',
        why: 'client:idle SSR still serializes props; we intentionally use client:only + dataUrl here.',
      },
    ];

    expect(tag).toContain('<SettlementsExplorer');
    for (const row of bad) {
      if (tag.includes(row.token)) {
        throw new Error(
          `Regression in index.astro: found \`${row.token}\`. ${row.why}`,
        );
      }
    }
  });

  it('keeps raw settlement field names out of compare route and island code', () => {
    const files = {
      'index.astro': loadIndex(),
      'settlement page': loadSettlement(),
      'SettlementsExplorer.svelte': loadExplorer(),
      'SettlementCard.svelte': loadCard(),
      ...loadTables(),
    };

    for (const [label, code] of Object.entries(files)) {
      for (const token of rawSettlementTokens) {
        expect(code, `${label} must not read raw ${token}`).not.toContain(
          token,
        );
      }
    }
  });

  it('keeps public compare JSON behind whole-payload public adapters', () => {
    const adapters = {
      'full.ts': loadFullAdapter(),
      'explorer.ts': loadExplorerAdapter(),
    };
    const routes = {
      'settlements.json.ts': loadFullJsonRoute(),
      'explorer.json.ts': loadExplorerJsonRoute(),
    };

    for (const [label, code] of Object.entries(adapters)) {
      expect(
        code,
        `${label} must not expose domain comparison payloads directly`,
      ).not.toContain('ComparisonResult');
      expect(
        code,
        `${label} must not expose domain stats payloads directly`,
      ).not.toMatch(/\bStats\b[\s\S]*from '\.\/settlement\/types';/);
    }

    expect(routes['settlements.json.ts']).toContain('toFullPayload(');
    expect(routes['explorer.json.ts']).toContain('toExplorerPayload(');

    for (const [label, code] of Object.entries(routes)) {
      expect(code, `${label} must not assemble JSON body inline`).not.toContain(
        'const body:',
      );
      expect(
        code,
        `${label} must not assemble comparisons inline`,
      ).not.toContain('Object.fromEntries(comparisons)');
    }
  });
});
