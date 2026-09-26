// Proves E2E: cal haver fet `npm run build` abans (serveix dist/).
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 4173);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    viewport: { width: 1180, height: 820 },
    // el service worker podria servir fitxers d'una build anterior
    serviceWorkers: 'block',
    acceptDownloads: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1180, height: 820 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1180, height: 820 } } },
    { name: 'ipad', use: { ...devices['iPad Pro 11 landscape'] } },
  ],
  webServer: {
    command: `node tests/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/home.html`,
    reuseExistingServer: !process.env.CI,
  },
});
