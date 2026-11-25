import { expect, test } from "@playwright/test";
import { cartNavigationCases } from "../../../src/data/fixture/cartNavigation";
import { CartPage } from "../../../src/page/CartPage";
import { InventoryPage } from "../../../src/page/InventoryPage";
import type { TProduct } from "../../../src/type/TProduct";

const { name, testData, expectedData } = cartNavigationCases[0];

test(name, async ({ page }) => {
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const selectedProducts: TProduct[] = [testData.remove, testData.keep];

  const openCartAndVerifyReady = async (): Promise<void> => {
    await inventory.openCart();
    await test.step("Verify the cart page is ready", async () => {
      await cart.shouldHavePath(/\/cart\.html$/);
      await cart.waitForElement();
    });
  };

  const verifyCartContents = async (products: TProduct[]): Promise<void> => {
    await test.step("Verify the exact cart contents", async () => {
      await expect(cart.items).toHaveCount(products.length);

      for (const product of products) {
        const item = cart.itemFor(product);
        await expect(item.name.locator, `Verify the name of ${product.name}`).toHaveText(product.name);
        await expect(item.price.locator, `Verify the price of ${product.name}`).toHaveText(`$${product.price.toFixed(2)}`);
        await expect(item.quantity.locator, `Verify the quantity of ${product.name}`).toHaveText(String(expectedData.quantity));
      }
    });
  };

  await inventory.open();

  await test.step("Add the backpack and bike light to an empty cart", async () => {
    await expect(inventory.cartBadge).toHaveCount(0);
    for (const product of selectedProducts) {
      await inventory.getProductCardByName(product.name).addToCart();
    }
    await expect(inventory.cartBadge, "Verify the cart badge after adding both products").toHaveText(String(expectedData.initialCount));
  });

  await openCartAndVerifyReady();
  await verifyCartContents(selectedProducts);
  await expect(cart.cartBadge, "Verify the cart badge on the cart page").toHaveText(String(expectedData.initialCount));

  await cart.continueShopping();
  await test.step("Verify both products remain selected after continuing shopping", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
    await expect(inventory.cartBadge, "Verify the cart badge after returning to inventory").toHaveText(String(expectedData.initialCount));

    for (const product of selectedProducts) {
      await expect(
        inventory.getProductCardByName(product.name).removeButton.locator,
      ).toBeVisible();
    }
  });

  await openCartAndVerifyReady();
  await verifyCartContents(selectedProducts);

  await cart.itemFor(testData.remove).remove();
  await test.step("Verify only the bike light remains", async () => {
    await verifyCartContents([testData.keep]);
    await expect(cart.cartBadge, "Verify the cart badge after removing the backpack").toHaveText(String(expectedData.remainingCount));
  });

  await cart.itemFor(testData.keep).remove();
  await test.step("Verify the cart is empty and its badge is absent", async () => {
    await expect(cart.items).toHaveCount(0);
    await expect(cart.cartBadge).toHaveCount(0);
  });
});
