import type { TProduct } from "./TProduct";

export type TCartNavigationCase = {
  name: string;
  testData: { remove: TProduct; keep: TProduct };
  expectedData: { quantity: number; initialCount: number; remainingCount: number };
};
