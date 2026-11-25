# Codex 08 — Full UI purchase E2E

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Read `AGENTS.md`, skill, current `LoginPage`, `InventoryPage`, `ProductCard`, `CartPage`, checkout Page Objects, dictionary and UI tests. Reuse all existing implementation. Do not generate duplicate Page Objects.

## Implement one independent end-to-end scenario
1. Start in a **clean unauthenticated browser context**; this test must perform login itself (do NOT use authenticated `storageState` even if other UI tests do).
2. Validate successful login and `session-username` cookie.
3. Add one known product from dictionary; assert `Remove` button and badge.
4. Open Cart and validate name, price and quantity.
5. Checkout: fill typed customer data from `src/data/fixture/purchase.ts`; continue to overview; validate product, subtotal, tax and total, including transparent expected-value calculations or confirmed static values (do not derive expected totals from actual UI totals).
6. Finish; check exact confirmation message and URL; return to inventory and verify cleared cart.
7. **Receipt/PDF download is conditional**: first inspect the actual deployed app. If a real download control exists, use `page.waitForEvent('download')` around the click and verify filename/content is nonempty. If not, omit this step, describe it as not supported in README, and never synthesize a fake receipt.

## Architecture/reporting
Use meaningful nested `test.step()` groups and existing wrappers. `CheckoutOverviewPage` and `CheckoutCompletePage` are appropriate if justified by separate routes, but avoid unnecessary base layers. Keep test-scoped expectations in the test. 

## Validation
Run `npm.cmd run typecheck` and targeted E2E test. Verify it runs without the setup auth fixture being silently applied. Record exact result, evidence and any observed AI mistakes in `AI_WORKLOG.md`.
