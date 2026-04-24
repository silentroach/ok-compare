import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { constants } from 'node:zlib';

const site = 'https://сравни.шелково.рф';

const plugins = [tailwindcss()];
const integrations = [
  svelte(),
  sitemap({
    filter(page) {
      return !/\/404(?:\/|\.html)?$/.test(page);
    },
  }),
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
];

export default defineConfig({
  output: 'static',
  site,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  outDir: 'dist',
  srcDir: 'src',
  publicDir: 'public',
  vite: {
    plugins,
  },
  integrations,
  build: {
    format: 'directory',
    assets: 'static',
  },
});
