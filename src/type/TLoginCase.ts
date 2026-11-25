import type { TLoginData } from "./TLoginData";

export type TLoginCase = {
  name: string;
  testData: TLoginData;
  expectedData: { error: string };
};
