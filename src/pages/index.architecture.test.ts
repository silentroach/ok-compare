import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const path = join(process.cwd(), 'src/pages/index.astro');

/**
 * Intentional architecture guard for the main list:
 * 1) We keep a full static list in HTML for bots and no-JS users.
 * 2) Interactive explorer must be client-only and load data from data/explorer.json.
 * 3) Passing settlements/comparisons/stats into SettlementsExplorer props in Astro
 *    serializes large payload into HTML again (the regression we had).
 */

function load(): string {
  return readFileSync(path, 'utf-8');
}

describe('index page explorer architecture', () => {
  it('uses client-only explorer with json source', () => {
    const code = load();

    expect(code).toContain("import { withBase } from '../lib/url';");
    expect(code).toContain("const dataUrl = withBase('data/explorer.json');");
    expect(code).toContain('<SettlementsExplorer dataUrl={dataUrl} client:only="svelte" />');
  });

  it('keeps static fallback list for bots and no-js', () => {
    const code = load();

    expect(code).toContain("import SettlementCard from '../components/SettlementCard.svelte';");
    expect(code).toContain('<div id="settlements-static">');
    expect(code).toContain('<SettlementCard');
    expect(code).toContain("window.addEventListener('explorer:ready'");
  });

  it('does not inline large list payload into explorer island props', () => {
    const code = load();
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
        throw new Error(`Regression in index.astro: found \`${row.token}\`. ${row.why}`);
      }
    }
  });
});
