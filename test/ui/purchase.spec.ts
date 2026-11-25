import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { standardUser } from "../../src/data/dict/users";
import { purchase } from "../../src/data/fixture/purchase";
import { CartPage } from "../../src/page/CartPage";
import { CheckoutCompletePage } from "../../src/page/CheckoutCompletePage";
import { CheckoutOverviewPage } from "../../src/page/CheckoutOverviewPage";
import { CheckoutPage } from "../../src/page/CheckoutPage";
import { InventoryPage } from "../../src/page/InventoryPage";
import { LoginPage } from "../../src/page/LoginPage";

test.use({ storageState: { cookies: [], origins: [] } });

test("Complete a purchase and download the order PDF", async ({ page, context }) => {
  const { testData: { product, customer }, expectedData } = purchase;
  const login = new LoginPage(page);
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  const overview = new CheckoutOverviewPage(page);
  const complete = new CheckoutCompletePage(page);
  const price = `$${product.price.toFixed(2)}`;
  const quantity = String(expectedData.quantity);

  await test.step("Sign in from a clean browser context", async () => {
    expect((await context.cookies()).find(cookie => cookie.name === "session-username")).toBeUndefined();
    await login.open();
    await login.login(standardUser);
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
    const cookie = (await context.cookies(page.url())).find(entry => entry.name === "session-username");
    expect(cookie?.value).toBe(standardUser.username);
    expect(cookie?.domain.replace(/^\./, "")).toBe(new URL(page.url()).hostname);
    if (cookie && cookie.expires > 0) {
      expect(cookie.expires).toBeGreaterThan(Date.now() / 1000);
    }
  });

  const card = inventory.getProductCardByName(product.name);
  await test.step("Add the product to an empty cart", async () => {
    await expect(inventory.cartBadge).toHaveCount(0);
    await card.addToCart();
    await expect(card.removeButton.locator).toBeVisible();
    await expect(inventory.cartBadge).toHaveText(quantity);
  });
  await inventory.openCart();
  await test.step("Verify the selected item in the cart", async () => {
    await cart.shouldHavePath(/\/cart\.html$/);
    await cart.waitForElement();
    await expect(cart.items).toHaveCount(1);
    const item = cart.itemFor(product);
    await expect(item.name.locator).toHaveText(product.name);
    await expect(item.price.locator).toHaveText(price);
    await expect(item.quantity.locator).toHaveText(quantity);
  });

  await cart.checkout();
  await test.step("Verify the checkout form is ready", async () => {
    await checkout.shouldHavePath(/\/checkout-step-one\.html$/);
    await checkout.waitForElement();
  });
  await checkout.fillInformation(customer);
  await checkout.continue();
  await test.step("Verify the overview item, subtotal, tax and total", async () => {
    await overview.shouldHavePath(/\/checkout-step-two\.html$/);
    await overview.waitForElement();
    await expect(overview.items).toHaveCount(1);
    await expect(overview.productName).toHaveText(product.name);
    await expect(overview.productPrice).toHaveText(price);
    await expect(overview.quantity).toHaveText(quantity);

    const subtotalCents = Math.round(product.price * 100) * expectedData.quantity;
    const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
    const comparisons = [
      { locator: overview.subtotal, text: `Item total: ${money(subtotalCents)}` },
      { locator: overview.tax, text: `Tax: ${money(expectedData.taxCents)}` },
      { locator: overview.total, text: `Total: ${money(subtotalCents + expectedData.taxCents)}` },
    ];
    for (const { locator, text } of comparisons) {
      await expect(locator).toHaveText(text);
    }
  });

  await overview.finish();
  await test.step("Verify order confirmation", async () => {
    await complete.shouldHavePath(/\/checkout-complete\.html$/);
    await complete.waitForElement();
    await expect(complete.heading).toHaveText(expectedData.heading);
    await expect(complete.message).toHaveText(expectedData.message);
  });
  const download = await complete.downloadOrder();
  await test.step("Verify the downloaded file is a nonempty order PDF", async () => {
    expect(download.suggestedFilename()).toMatch(expectedData.pdfFilename);
    const pdf = await readFile(await download.path());
    expect(pdf.length).toBeGreaterThan(5);
    expect(pdf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
  await complete.returnToInventory();
  await test.step("Verify inventory is ready and the cart is cleared", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
    await expect(inventory.cartBadge).toHaveCount(0);
    await expect(card.addButton.locator).toBeVisible();
  });
});
