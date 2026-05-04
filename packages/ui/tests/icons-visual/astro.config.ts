import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  srcDir: 'src',
  outDir: 'dist',
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [
          fileURLToPath(new URL('../..', import.meta.url)),
          fileURLToPath(new URL('../../../..', import.meta.url)),
        ],
      },
    },
  },
  build: {
    format: 'directory',
    assets: 'static',
  },
});
