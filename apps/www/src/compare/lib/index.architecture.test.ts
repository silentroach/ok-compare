import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexPath = join(process.cwd(), 'src/pages/815/compare/index.astro');
const runtimePath = join(process.cwd(), 'src/scripts/site-runtime.ts');

/**
 * Intentional architecture guard for the main list:
 * 1) We keep a full static list in HTML for bots and no-JS users.
 * 2) Interactive explorer must be client-only and load data from data/explorer.json.
 * 3) Passing settlements/comparisons/stats into SettlementsExplorer props in Astro
 *    serializes large payload into HTML again (the regression we had).
 */
const loadIndex = (): string => readFileSync(indexPath, 'utf-8');
const loadRuntime = (): string => readFileSync(runtimePath, 'utf-8');

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
});
