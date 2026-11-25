import type { TCheckoutData, TCheckoutValidationCase } from "../../type/TCheckoutData";

const validInformation: TCheckoutData = { firstName: "Avery", lastName: "Tester", postalCode: "12345" };

export const checkoutValidationCases: TCheckoutValidationCase[] = [
  {
    name: "Require a first name at checkout",
    testData: { ...validInformation, firstName: "" },
    expectedData: { error: "Error: First Name is required" },
  },
  {
    name: "Require a last name at checkout",
    testData: { ...validInformation, lastName: "" },
    expectedData: { error: "Error: Last Name is required" },
  },
  {
    name: "Require a postal code at checkout",
    testData: { ...validInformation, postalCode: "" },
    expectedData: { error: "Error: Postal Code is required" },
  },
];
