# Codex 03 — Inventory catalog and product details

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Implement the next UI slice in the existing repository. Start by reading `AGENTS.md`, `.agents/skills/qa-test-generator/SKILL.md`, and current `InventoryPage`, `ProductCard`, `WebElement`, `ParentComponent`, `products.ts`, `TProduct`, `test/ui/inventory.spec.ts`, and `playwright.config.ts`.

## Existing implementation: preserve it
- Four data-driven sorting cases and a test that adds *all* products then removes *all* are **already implemented** in `test/ui/inventory.spec.ts`. Do not regenerate or rename them.
- `ProductCard` and `InventoryPage` exist. Extend these classes rather than adding parallel ones.
- Current `src/data/dict/products.ts` has six verified names and prices but no populated descriptions/images. Do not fabricate static values.

## Implement
1. Extend `ProductCard` with access to name, description, price, image and product detail link, using the project element wrappers where appropriate. Use `requiredElements` for the card structure. Prefer `data-test` selectors.
2. Add a catalog test that independently compares all six product names/prices against `src/data/dict/products.ts`, checks nonempty description, and verifies that each image actually loads (not merely exists). Assert count and no duplicate product names. Compare as keyed objects or an explicit expected ordering, not by accidentally trusting observed UI ordering.
3. Create `ProductDetailsPage` only if needed. Add one independent test: open a known product by its name, verify product fields agree with dictionary/catalog, return to Inventory, and verify navigation. Keep the existing sorting and add/remove tests intact.
4. Put product-specific values in `dict`; place scenario-specific testData/expectedData in a typed fixture if multiple cases exist. Do not create a separate fixture file for every variation.
5. Use named `test.step()` for meaningful Page Object actions and grouped checks; Avoid duplicating steps.

## Validation / exit criteria
Run `npm.cmd run typecheck` and the targeted UI test file(s) on Windows when possible; report exact outcomes. Do not modify expected values just to make tests pass. Update `AI_WORKLOG.md` with the original prompt, changes, real findings, and validation. Leave any live-DOM discrepancies explicitly unresolved rather than guessing.
