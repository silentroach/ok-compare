import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const port = 4329;
const baseURL = `http://127.0.0.1:${String(port)}`;
const cwd = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  testDir: './tests',
  testMatch: 'sticky-table.visual.local.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    viewport: {
      width: 1440,
      height: 900,
    },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  },
  webServer: {
    command: 'pnpm run test:visual:sticky-table:serve',
    cwd,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
