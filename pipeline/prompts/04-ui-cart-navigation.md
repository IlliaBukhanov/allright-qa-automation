# Codex 04 — Cart page and navigation

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Read `AGENTS.md`, skill, current `InventoryPage`, `ProductCard`, `inventory.spec.ts`, `TProduct`, and dictionary first. Do not rewrite existing four sorting tests or the existing full-catalog Add All → Remove All test.

## Implement
- Create `CartPage` and `CartItem` using current `BasePage`/`ParentComponent`/element wrappers. Expose typed product data, product count, remove action, checkout action, and Continue Shopping action.
- Create a focused UI test with fresh, isolated authenticated state: open Inventory; add **two named distinct products** from the dictionary; verify badge; navigate to Cart; verify exact names, prices, quantities and no unexpected entries; Continue Shopping; verify the cart state remains; navigate back to Cart; remove one item; verify the remaining product and badge; clean up without depending on other tests.
- Validate navigation by URL + page readiness, not just click success.
- Keep assertions at scenario level except page readiness and component-specific verification; use descriptive `test.step()`.
- Do not use arbitrary sleeps or mock SauceDemo backend endpoints. Prefer `expect(locator)` auto-retrying checks.

## Validation
Run typecheck and targeted cart test, record actual results and problems in `AI_WORKLOG.md`. Ensure the existing Add All → Remove All scenario still passes or report why not.
