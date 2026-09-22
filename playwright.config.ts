import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: {baseURL: 'http://localhost:8088', channel: 'chrome'},
  webServer: {
    command: 'node tests/serve.mjs',
    url: 'http://localhost:8088',
    reuseExistingServer: false,
  },
});
