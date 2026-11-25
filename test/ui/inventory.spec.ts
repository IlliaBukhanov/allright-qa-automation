import { expect, test } from "@playwright/test";
import { products } from "../../src/data/dict/products";
import { inventorySortingCases } from "../../src/data/fixture/inventorySorting";
import { InventoryPage } from "../../src/page/InventoryPage";
import { ProductDetailsPage } from "../../src/page/ProductDetailsPage";

inventorySortingCases.forEach(({ name, testData, expectedData }) => {
  test(name, async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.open();
    if (testData.sortOption === "az" && expectedData.productNames) {
      await inventory.sortBy("za");
      await expect(inventory.productNames).toHaveText([...expectedData.productNames].reverse());
    }
    await inventory.sortBy(testData.sortOption);

    await test.step("Verify the displayed product order", async () => {
      if (expectedData.productNames) {
        await expect(inventory.productNames).toHaveText(expectedData.productNames);
      } else {
        const prices = expectedData.productPrices.map(price => `$${price.toFixed(2)}`);
        await expect(inventory.productPrices).toHaveText(prices);
        // Check the name/price association and catalog membership without imposing a tie order.
        const expectedPairs = Object.values(products)
          .map(({ name, price }) => `${name}|$${price.toFixed(2)}`).sort();
        await expect.poll(async () => {
          const cards = await inventory.getProductCards();
          return (await Promise.all(cards.map(async card =>
            `${await card.name.innerText()}|${await card.price.innerText()}`))).sort();
        }).toEqual(expectedPairs);
      }
    });
  });
});

test("Add and remove every inventory product", async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.open();
  const expectedNames = Object.values(products).map(({ name }) => name).sort();

  const cards = await test.step("Verify the full catalog and empty cart", async () => {
    await expect.poll(async () => (await inventory.productNames.allTextContents()).sort()).toEqual(expectedNames);
    await expect(inventory.cartBadge).toHaveCount(0);
    return inventory.getProductCards();
  });

  await test.step("Add all products and verify each cart update", async () => {
    for (const [index, card] of cards.entries()) {
      await card.addToCart();
      await expect(card.removeButton.locator).toBeVisible();
      await expect(card.addButton.locator).toHaveCount(0);
      await expect(inventory.cartBadge).toHaveText(String(index + 1));
    }
  });

  await test.step("Remove all products and verify each cart update", async () => {
    for (const [index, card] of cards.entries()) {
      await card.removeFromCart();
      await expect(card.addButton.locator).toBeVisible();
      await expect(card.removeButton.locator).toHaveCount(0);
      const remaining = cards.length - index - 1;
      if (remaining === 0) {
        await expect(inventory.cartBadge).toHaveCount(0);
      } else {
        await expect(inventory.cartBadge).toHaveText(String(remaining));
      }
    }
  });
});

test("Display the complete product catalog", async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.open();
  const cards = await inventory.getProductCards();
  const expectedProducts = Object.values(products);

  await test.step("Verify catalog size and unique product names", async () => {
    await expect(cards).toHaveLength(expectedProducts.length);
    const actualNames = await Promise.all(cards.map(card => card.name.innerText()));
    await expect(new Set(actualNames).size).toBe(expectedProducts.length);
  });

  await test.step("Verify every catalog product", async () => {
    const actualProducts = new Map<string, { price: string; description: string }>();

    for (const card of cards) {
      await card.waitForElement();
      const name = await card.name.innerText();
      actualProducts.set(name, {
        price: await card.price.innerText(),
        description: await card.description.innerText(),
      });
      await expect(card.description.locator).not.toHaveText("");
      await expect
        .poll(() => card.image.locator.evaluate(image => {
          const productImage = image as HTMLImageElement;
          return productImage.complete && productImage.naturalWidth > 0;
        }))
        .toBe(true);
    }

    for (const expectedProduct of expectedProducts) {
      const actualProduct = actualProducts.get(expectedProduct.name);
      expect(actualProduct, `Catalog entry for ${expectedProduct.name}`).toBeDefined();
      expect(actualProduct?.price).toBe(`$${expectedProduct.price.toFixed(2)}`);
    }
  });
});

test("Open product details and return to inventory", async ({ page }) => {
  const inventory = new InventoryPage(page);
  const details = new ProductDetailsPage(page);
  const expectedProduct = products.backpack;
  await inventory.open();
  const card = inventory.getProductCardByName(expectedProduct.name);
  const catalogDescription = await card.description.innerText();
  const catalogImageSource = await card.image.getAttribute("src");

  await card.openDetails();

  await test.step("Verify product details match the catalog and dictionary", async () => {
    await details.shouldHavePath(/\/inventory-item\.html\?id=\d+$/);
    await details.waitForElement();
    await expect(details.name.locator).toHaveText(expectedProduct.name);
    await expect(details.price.locator).toHaveText(`$${expectedProduct.price.toFixed(2)}`);
    await expect(details.description.locator).toHaveText(catalogDescription);
    await expect(details.image.locator).toHaveAttribute("src", catalogImageSource ?? "");
    await expect
      .poll(() => details.image.locator.evaluate(image => {
        const productImage = image as HTMLImageElement;
        return productImage.complete && productImage.naturalWidth > 0;
      }))
      .toBe(true);
  });

  await details.returnToInventory();
  await test.step("Verify navigation back to inventory", async () => {
    await inventory.shouldHavePath(/\/inventory\.html$/);
    await inventory.waitForElement();
  });
});
