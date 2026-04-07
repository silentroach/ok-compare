import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

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
    plugins: [tailwindcss()],
  },
  integrations: [svelte()],
  build: {
    format: 'directory',
  },
});
