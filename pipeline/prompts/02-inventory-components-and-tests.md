# Codex prompt 02 — Inventory components and data-driven tests

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Read `AGENTS.md`, the qa-test-generator skill and the project's types, dict, fixture, and base UI classes. Build only what is required; do not import previous/external frameworks.

Implement or refine `ProductCard` and `InventoryPage` using the project's `WebElement`/`ParentComponent`/`Button`/`Select` conventions. Keep component locators scoped to their root; do not create Text/Image/Badge wrappers without demonstrated reusable behavior. Wrap meaningful component actions/validation groups in descriptive `test.step()`; avoid one step per trivial assertion.

Use `src/data/dict/products.ts` for product values and **one** `src/data/fixture/inventorySorting.ts` for typed `{name, testData, expectedData}` sorting scenarios. Register four independent sorting tests via `cases.forEach`; use static expected sequences. Compare names for name sorting and prices for price sorting; handle equal prices without asserting an unjustified tie order. Use Playwright auto-retrying assertions or `expect.poll` for asynchronous re-renders.

Add a separate UI scenario: open inventory with clean authenticated state, get all cards, sequentially add **all** products with `for...of` and check each Add→Remove button transition and count 1..N, optionally check cart contents/navigation, then sequentially remove **all** with checks N-1..0 and restored Add buttons. Do not use `forEach(async...)` for sequential UI operations.

Keep setup auth state cart-free; do not depend on other test cases. Run typecheck and focused tests and document real results in `AI_WORKLOG.md`. Do not generate unrelated checkout or API features.
