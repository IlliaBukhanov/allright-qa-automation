import { test as setup, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { LoginPage } from "../src/page/LoginPage";
import { InventoryPage } from "../src/page/InventoryPage";
import { standardUser } from "../src/data/dict/users";

setup("Authenticate a standard user", async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.login(standardUser);
  await expect(page).toHaveURL(/inventory\.html/);
  await setup.step("Save authenticated state with an empty cart", async () => {
    const inventory = new InventoryPage(page);
    await inventory.waitForElement();
    await expect(inventory.cartBadge).toHaveCount(0);
    await mkdir("playwright/.auth", { recursive: true });
    await page.context().storageState({ path: "playwright/.auth/standardUser.json" });
  });
});
