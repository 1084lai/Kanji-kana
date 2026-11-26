import {defineConfig} from '@playwright/test';

// Browser: Chrome di sistema se presente (variabile CHROME_PATH), altrimenti quelli di Playwright.
const executablePath = process.env.CHROME_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  retries: 0,
  use: {baseURL: 'http://localhost:8000', launchOptions: {executablePath, args: ['--no-sandbox']}},
  webServer: {command: 'python3 -m http.server 8000', url: 'http://localhost:8000/index.html', reuseExistingServer: true, timeout: 30000}
});
