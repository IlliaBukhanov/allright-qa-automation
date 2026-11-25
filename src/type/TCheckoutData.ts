export type TCheckoutData = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export type TCheckoutValidationCase = {
  name: string;
  testData: TCheckoutData;
  expectedData: { error: string };
};
