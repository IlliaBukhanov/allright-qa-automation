import { defineConfig } from "@playwright/test";
import base from "../playwright.config";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const evidence = process.env.PIPELINE_EVIDENCE_DIR;
if (!evidence) throw new Error("Run the bonus via npm run generate:test (or rerun:generated).");

export default defineConfig({
  ...base,
  testDir: root,
  outputDir: resolve(evidence, "test-results"),
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: resolve(evidence, "playwright-report") }],
    ["json", { outputFile: resolve(evidence, "playwright-results.json") }],
  ],
  projects: (base.projects ?? []).filter(p => ["setup", "ui", "api"].includes(p.name ?? "")).map(p => ({
    ...p,
    testMatch: p.name === "setup" ? "**/test/auth.setup.ts" : `**/pipeline/generated/${p.name}/**/*.spec.ts`,
    use: { ...p.use, ...(p.name === "ui" ? { storageState: resolve(root, "playwright/.auth/standardUser.json") } : {}) },
  })),
});
