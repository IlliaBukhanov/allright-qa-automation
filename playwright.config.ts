
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./test",

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : 2,

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],

  use: {
    baseURL: "https://www.saucedemo.com",

    headless: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",

    testIdAttribute: "data-test",
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    {
      name: "login",
      testMatch: /ui\/(login|purchase|protected-routes)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: {
          cookies: [],
          origins: [],
        },
      },
    },

    {
      name: "ui",
      testMatch: /ui\/(?!(login|purchase|protected-routes)\.spec\.ts).*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/standardUser.json",
      },
    },

    {
      name: "api",
      testMatch: /api\/.*\.spec\.ts/,
      use: { baseURL: "https://restful-booker.herokuapp.com" },
    },
  ],
});
