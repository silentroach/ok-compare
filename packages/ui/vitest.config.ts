/// <reference types="vitest/config" />

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser', 'default'],
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    exclude: ['tests/**/*.visual.local.spec.ts'],
    server: {
      deps: {
        inline: ['@testing-library/svelte', '@testing-library/svelte-core'],
      },
    },
  },
});
