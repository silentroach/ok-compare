import { defineConfig } from 'astro/config';
import compressor from 'astro-compressor';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { constants } from 'node:zlib';

const packed = process.env.ASTRO_COMPRESS === '1';

const plugins = [tailwindcss()];
const integrations = [svelte()];

if (packed) {
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
        '.xml',
        '.cjs',
        '.mjs',
        '.svg',
        '.txt',
        '.json',
      ],
    }),
  );
}

export default defineConfig({
  output: 'static',
  base: process.env.ASTRO_BASE || '/ok-compare',
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
  },
});
