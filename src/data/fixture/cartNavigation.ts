import { products } from "../dict/products";
import type { TCartNavigationCase } from "../../type/TCartNavigationCase";

export const cartNavigationCases: TCartNavigationCase[] = [{
  name: "Preserve cart contents across navigation and remove a product",
  testData: { remove: products.backpack, keep: products.bikeLight },
  expectedData: { quantity: 1, initialCount: 2, remainingCount: 1 },
}];
