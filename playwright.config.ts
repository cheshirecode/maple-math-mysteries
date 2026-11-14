import { defineConfig } from '@playwright/test'

const use: object = process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  fullyParallel: false,
  reporter: [['list']],
  use: { ...use, baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
})