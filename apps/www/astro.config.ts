import { fileURLToPath } from 'node:url';
import { constants } from 'node:zlib';
import type { SitemapItem } from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import compressor from 'astro-compressor';
import tailwindcss from '@tailwindcss/vite';
import { rehypeTypograf } from '@shelkovo/markdown';
import {
  applySitemapMetadata,
  type SitemapMetadataIndex,
} from './src/lib/sitemap';
import { loadSitemapMetadataIndex } from './src/lib/sitemap-data';

const plugins = [tailwindcss()];
const devServerPort = 4321;
const site = 'https://kpshelkovo.online';
let sitemapMetadataIndex: Promise<SitemapMetadataIndex> | undefined;

const loadSitemapMetadata = (): Promise<SitemapMetadataIndex> => {
  sitemapMetadataIndex ??= loadSitemapMetadataIndex();

  return sitemapMetadataIndex;
};

const serializeSitemapItem = async (
  item: SitemapItem,
): Promise<SitemapItem | undefined> =>
  applySitemapMetadata(item, await loadSitemapMetadata());

export default defineConfig({
  output: 'static',
  site,
  server: {
    port: devServerPort,
  },
  cacheDir: '../../node_modules/.astro/www',
  markdown: {
    processor: unified({
      gfm: true,
      smartypants: true,
      rehypePlugins: [rehypeTypograf],
    }),
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
    build: {
      // Keep processed scripts external so CSP does not need broad inline JS.
      assetsInlineLimit: 0,
    },
    server: {
      strictPort: true,
    },
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
      serialize: serializeSitemapItem,
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
