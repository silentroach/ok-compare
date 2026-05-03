import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      '../../packages/**/src/**/*.{test,spec}.{js,ts}',
    ],
    alias: {
      '@/*': './src/*',
      '@components/*': './src/components/*',
      '@lib/*': './src/lib/*',
      '@data/*': './src/data/*',
      '@layouts/*': './src/layouts/*',
      '@styles/*': './src/styles/*',
    },
  },
  resolve: {
    conditions: ['browser', 'default'],
  },
});
