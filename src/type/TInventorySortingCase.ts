export type TInventorySortOption = "az" | "za" | "lohi" | "hilo";

export type TInventorySortingCase = {
  name: string;
  testData: { sortOption: TInventorySortOption };
  expectedData:
    | { productNames: string[]; productPrices?: never }
    | { productPrices: number[]; productNames?: never };
};
