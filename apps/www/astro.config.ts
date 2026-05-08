import { fileURLToPath } from 'node:url';
import { constants } from 'node:zlib';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import compressor from 'astro-compressor';
import tailwindcss from '@tailwindcss/vite';
import { rehypeTypograf } from './src/lib/typography';

const plugins = [tailwindcss()];
const site = 'https://kpshelkovo.online';

export default defineConfig({
  output: 'static',
  site,
  cacheDir: '../../node_modules/.astro/www',
  markdown: {
    rehypePlugins: [rehypeTypograf],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  outDir: 'dist/site',
  srcDir: 'src',
  publicDir: 'public',
  vite: {
    envDir: '../..',
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  integrations: [
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
  ],
  build: {
    format: 'directory',
    assets: 'static',
  },
});
