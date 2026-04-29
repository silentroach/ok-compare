import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { constants } from 'node:zlib';

const site = process.env.COMPARE_SITE ?? 'https://сравни.шелково.рф';
const base = process.env.COMPARE_BASE ?? '/';
const outDir = process.env.COMPARE_OUT_DIR ?? 'dist/site';
const useSitemap = process.env.COMPARE_SITEMAP !== 'false';
const devPort = Number(process.env.COMPARE_DEV_PORT ?? '4322');

const plugins = [tailwindcss()];
const integrations = [svelte()];

if (useSitemap) {
  integrations.push(
    sitemap({
      filter(page) {
        return !/\/404(?:\/|\.html)?$/.test(page);
      },
    }),
  );
}

integrations.push(
  compressor({
    gzip: {
      level: 9,
    },
    brotli: {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
      },
    },
    zstd: false,
    fileExtensions: [
      '.css',
      '.js',
      '.html',
      '.md',
      '.xml',
      '.cjs',
      '.mjs',
      '.svg',
      '.txt',
      '.json',
    ],
  }),
);

export default defineConfig({
  output: 'static',
  base,
  site,
  cacheDir: '../../node_modules/.astro/compare',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  outDir,
  srcDir: 'src',
  publicDir: 'public',
  vite: {
    envDir: '../..',
    plugins,
    server: {
      hmr: {
        clientPort: devPort,
        port: devPort,
      },
    },
  },
  integrations,
  build: {
    format: 'directory',
    assets: 'static',
  },
});
