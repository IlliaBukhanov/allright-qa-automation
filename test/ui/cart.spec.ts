import { expect, test } from "@playwright/test";
import { cartNavigationCases } from "../../src/data/fixture/cartNavigation";
import { CartPage } from "../../src/page/CartPage";
import { InventoryPage } from "../../src/page/InventoryPage";

cartNavigationCases.forEach(({ name, testData, expectedData }) => {
  test(name, async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const selected = [testData.remove, testData.keep];
    const openCart = async () => {
      await inventory.openCart();
      await test.step("Verify the cart page is ready", async () => {
        await cart.shouldHavePath(/\/cart\.html$/);
        await cart.waitForElement();
      });
    };

    await inventory.open();
    await test.step("Add two distinct products to an empty cart", async () => {
      await expect(inventory.cartBadge).toHaveCount(0);
      for (const product of selected) {
        await inventory.getProductCardByName(product.name).addToCart();
      }
      await expect(inventory.cartBadge, "Verify the badge after adding both products").toHaveText(String(expectedData.initialCount));
    });

    await openCart();
    const verifyContents = async (products: typeof selected, count: number) => {
      await expect(cart.items).toHaveCount(count);
      for (const product of products) {
        const item = cart.itemFor(product);
        await expect(item.name.locator, `${product.name} name`).toHaveText(product.name);
        await expect(item.price.locator, `${product.name} price`).toHaveText(`$${product.price.toFixed(2)}`);
        await expect(item.quantity.locator, `${product.name} quantity`).toHaveText(String(expectedData.quantity));
      }
    };
    await test.step("Verify both cart entries and their quantities", () => verifyContents(selected, expectedData.initialCount));

    await cart.continueShopping();
    await test.step("Verify inventory is ready and still shows both products in the cart", async () => {
      await inventory.shouldHavePath(/\/inventory\.html$/);
      await inventory.waitForElement();
      await expect(inventory.cartBadge, "Verify the badge after returning to inventory").toHaveText(String(expectedData.initialCount));
      for (const product of selected) {
        const card = inventory.getProductCardByName(product.name);
        await expect(card.removeButton.locator).toBeVisible();
      }
    });

    await openCart();
    await test.step("Verify both entries survived the round trip", () => verifyContents(selected, expectedData.initialCount));
    await cart.itemFor(testData.remove).remove();
    await test.step("Verify only the remaining product and its badge count", async () => {
      await verifyContents([testData.keep], expectedData.remainingCount);
      await expect(cart.cartBadge, "Verify the badge after removing one product").toHaveText(String(expectedData.remainingCount));
    });
    await test.step("Empty the cart and verify cleanup", async () => {
      await cart.itemFor(testData.keep).remove();
      await expect(cart.items).toHaveCount(0);
      await expect(cart.cartBadge).toHaveCount(0);
    });
  });
});
