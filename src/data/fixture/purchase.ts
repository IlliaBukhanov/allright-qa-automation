import type { TCheckoutData } from "../../type/TCheckoutData";
import { products } from "../dict/products";

export const purchase = {
  testData: {
    product: products.backpack,
    customer: { firstName: "Avery", lastName: "Tester", postalCode: "12345" } satisfies TCheckoutData,
  },
  expectedData: {
    quantity: 1,
    // Observed for this specific one-item order on SauceDemo.
    taxCents: 240,
    heading: "Thank you for your order!",
    message: "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    pdfFilename: /^swag-labs-order-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.pdf$/,
  },
};
