import { expect, test } from "@playwright/test";
import { BurgerMenu } from "../../src/component/BurgerMenu";
import { aboutHref, footerLinks, menuLabels } from "../../src/data/dict/navigation";
import { products } from "../../src/data/dict/products";
import { CartPage } from "../../src/page/CartPage";
import { InventoryPage } from "../../src/page/InventoryPage";

test("Navigate from cart to All Items and verify external link destinations", async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const menu = new BurgerMenu(page);
  await inventory.open();
  await inventory.openCart();
  await test.step("Verify the cart is ready", async () => {
    await cart.shouldHavePath(/\/cart\.html$/);
    await cart.waitForElement();
  });
  await menu.open();
  await test.step("Verify menu entries and the About destination", async () => {
    await expect(menu.entries).toHaveText(menuLabels);
    await expect(menu.about.locator).toHaveAttribute("href", aboutHref);
  });
  await menu.showAllItems();
  await test.step("Verify inventory and its social link destinations", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
    for (const { name, href } of footerLinks) {
      const link = inventory.footer.getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
    }
  });
});

test("Reset App State clears the populated cart", async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const menu = new BurgerMenu(page);
  await inventory.open();
  const card = inventory.getProductCardByName(products.backpack.name);
  await card.addToCart();
  await test.step("Verify the cart contains one product before reset", async () => {
    await expect(inventory.cartBadge).toHaveText("1");
    await expect(card.removeButton.locator).toBeVisible();
  });
  await menu.open();
  await menu.resetAppState();
  await test.step("Verify reset clears the badge while staying on inventory", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await expect(inventory.cartBadge).toHaveCount(0);
  });
  await inventory.openCart();
  await test.step("Verify the cart is empty after reset", async () => {
    await cart.shouldHavePath(/\/cart\.html$/);
    await cart.waitForElement();
    await expect(cart.items).toHaveCount(0);
  });
});

test("Reset App State immediately restores product button state [BUG-UI-001]", async ({ page }) => {
  const inventory = new InventoryPage(page);
  const menu = new BurgerMenu(page);
  await inventory.open();
  const card = inventory.getProductCardByName(products.backpack.name);
  await card.addToCart();
  await expect(inventory.cartBadge).toHaveText("1");
  await expect(card.removeButton.locator).toBeVisible();
  await menu.open();
  await menu.resetAppState();
  await inventory.shouldHavePath(/\/inventory\.html$/);
  await expect(inventory.cartBadge).toHaveCount(0);
  await expect(card.name.locator).toBeVisible();

  // Only the known button-state defect is expected to fail; setup must succeed.
  test.fail(true, "BUG-UI-001: inventory button state remains stale until navigation");
  await test.step("Verify immediate product button reset", async () => {
    await expect.soft(card.addButton.locator).toBeVisible();
    await expect.soft(card.removeButton.locator).toHaveCount(0);
  });
});

test("Product button state is restored after navigating back from cart", async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const menu = new BurgerMenu(page);
  await inventory.open();
  const card = inventory.getProductCardByName(products.backpack.name);
  await card.addToCart();
  await expect(inventory.cartBadge).toHaveText("1");
  await expect(card.removeButton.locator).toBeVisible();
  await menu.open();
  await menu.resetAppState();
  await expect(inventory.cartBadge).toHaveCount(0);
  await inventory.openCart();
  await cart.shouldHavePath(/\/cart\.html$/);
  await cart.waitForElement();
  await expect(cart.items).toHaveCount(0);
  await cart.continueShopping();
  await test.step("Verify catalog buttons after returning from the cart", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
    await expect(inventory.cartBadge).toHaveCount(0);
    await expect(card.addButton.locator).toBeVisible();
    await expect(card.removeButton.locator).toHaveCount(0);
  });
});

test("Logout clears the demo session and returns protected navigation to login", async ({ page, context }) => {
  const inventory = new InventoryPage(page);
  const menu = new BurgerMenu(page);
  await inventory.open();
  await menu.open();
  await menu.logout();
  await test.step("Verify the login screen and cleared session cookie", async () => {
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("login-button")).toBeVisible();
    expect((await context.cookies()).some(cookie => cookie.name === "session-username")).toBe(false);
  });
  await test.step("Verify inventory redirects to login after logout", async () => {
    await page.goto("/inventory.html");
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("login-button")).toBeVisible();
  });
});
