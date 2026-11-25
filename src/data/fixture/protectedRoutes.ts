import type { TProtectedRouteCase } from "../../type/TProtectedRouteCase";

export const protectedRouteCases: TProtectedRouteCase[] = [
  "/inventory.html",
  "/cart.html",
  "/checkout-step-one.html",
].map(path => ({
  name: `Require login for ${path}`,
  testData: { path },
  expectedData: { error: `Epic sadface: You can only access '${path}' when you are logged in.` },
}));
