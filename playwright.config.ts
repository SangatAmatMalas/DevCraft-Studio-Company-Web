import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    reporter: [['list']],
    use: {
        baseURL: 'http://127.0.0.1:8124',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'bash scripts/e2e-server.sh',
        url: 'http://127.0.0.1:8124/up',
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
            APP_ENV: 'local',
            APP_DEBUG: 'true',
            DB_CONNECTION: 'sqlite',
            DB_DATABASE: 'database/e2e.sqlite',
            SESSION_DRIVER: 'file',
            CACHE_STORE: 'file',
            INERTIA_SSR_ENABLED: 'false',
        },
    },
});
