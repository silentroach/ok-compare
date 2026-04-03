import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({
    compilerOptions: {
      runes: true
    }
  })],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    alias: {
      '$lib': './src/lib'
    }
  },
  resolve: {
    conditions: ['browser', 'default']
  }
});
