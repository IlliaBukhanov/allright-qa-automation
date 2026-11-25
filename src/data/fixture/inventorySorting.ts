import { products } from "../dict/products";
import type { TInventorySortingCase } from "../../type/TInventorySortingCase";

/** Name ties in price sorts are asserted by price, not item order. */
export const inventorySortingCases: TInventorySortingCase[] = [
  {
    name: "Sort by name A-Z",
    testData: { sortOption: "az" },
    expectedData: { productNames: [
      products.backpack.name, products.bikeLight.name, products.boltTShirt.name,
      products.fleeceJacket.name, products.onesie.name, products.redTShirt.name,
    ] },
  },
  {
    name: "Sort by name Z-A",
    testData: { sortOption: "za" },
    expectedData: { productNames: [
      products.redTShirt.name, products.onesie.name, products.fleeceJacket.name,
      products.boltTShirt.name, products.bikeLight.name, products.backpack.name,
    ] },
  },
  {
    name: "Sort by price low-high",
    testData: { sortOption: "lohi" },
    expectedData: { productPrices: [
      products.onesie.price, products.bikeLight.price, products.boltTShirt.price,
      products.redTShirt.price, products.backpack.price, products.fleeceJacket.price,
    ] },
  },
  {
    name: "Sort by price high-low",
    testData: { sortOption: "hilo" },
    expectedData: { productPrices: [
      products.fleeceJacket.price, products.backpack.price, products.boltTShirt.price,
      products.redTShirt.price, products.bikeLight.price, products.onesie.price,
    ] },
  },
];
