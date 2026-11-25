import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/page/LoginPage";
import { standardUser } from "../../src/data/dict/users";
import { invalidLoginCases } from "../../src/data/fixture/login";

test("Successful login", async ({ page, context }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.expectStaticContent();

  await test.step("Log in with valid credentials", async () => {
    await login.login(standardUser);
  });

  await test.step("Verify authenticated inventory access", async () => {
    await expect(page).toHaveURL(/inventory\.html/);
  });

  await test.step("Verify the authentication cookie", async () => {
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(({ name }) => name === "session-username");

    expect(sessionCookie, "session-username cookie should be created").toBeDefined();
    expect(sessionCookie?.value).toBe(standardUser.username);
    expect(sessionCookie?.domain).toMatch(/(^|\.)saucedemo\.com$/);

    if (sessionCookie && sessionCookie.expires > 0) {
      expect(sessionCookie.expires).toBeGreaterThan(Date.now() / 1000);
    }
  });
});

invalidLoginCases.forEach(({ name, testData, expectedData }) => {
  test(name, async ({ page, context }) => {
    const login = new LoginPage(page);
    await login.open();

    await test.step("Attempt login with invalid credentials", async () => {
      await login.login(testData);
    });

    await test.step("Verify the login error and stay on the login page", async () => {
      await login.expectError(expectedData.error);
      await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    });

    await test.step("Verify no authentication cookie was created", async () => {
      const cookies = await context.cookies();
      expect(cookies.find(({ name: cookieName }) => cookieName === "session-username")).toBeUndefined();
    });
  });
});
