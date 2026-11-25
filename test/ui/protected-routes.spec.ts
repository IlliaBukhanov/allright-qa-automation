import { expect, test } from "@playwright/test";
import { protectedRouteCases } from "../../src/data/fixture/protectedRoutes";
import { LoginPage } from "../../src/page/LoginPage";

test.use({ storageState: { cookies: [], origins: [] } });

protectedRouteCases.forEach(({ name, testData, expectedData }) => {
  test(name, async ({ page, context }) => {
    const login = new LoginPage(page);
    await test.step("Open the protected route without authentication", async () => {
      await page.goto(testData.path);
    });
    await test.step("Verify the redirect to login and the exact access error", async () => {
      await expect(page).toHaveURL("/");
      await expect(page.getByRole("form", { name: "Login", exact: true })).toBeVisible();
      await login.expectError(expectedData.error);
    });
    await test.step("Verify the browser has no session username cookie", async () => {
      expect((await context.cookies()).some(cookie => cookie.name === "session-username")).toBe(false);
    });
  });
});
