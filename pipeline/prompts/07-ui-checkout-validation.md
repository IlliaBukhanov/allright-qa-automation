# Codex 07 — Checkout form negative/boundary cases

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Read current UI architecture, dictionary, Page Objects, and config. Do not duplicate an existing checkout implementation, if one has been added since this prompt was written.

## Implement
- Create or extend a typed `CheckoutPage` with `Input` controls for first name, last name, and postal code; `continue` and `cancel` actions; error validation with **exact** `toHaveText` if the complete expected error is known.
- Create typed cases in a single checkout validation fixture (`name`, `testData`, `expectedData`). Cover missing first name, missing last name, missing postal code. Each case gets its own Playwright test via `forEach`.
- Prepare the test precondition independently: authenticated user, add one known item, open cart, click Checkout; verify actual checkout page before submit.
- Verify the app remains on the checkout form and shows the correct error. Do not assert unstated validation rules (e.g. postal code format) without observing or confirming them.
- Group meaningful actions and assertions into `test.step()`; do not add `test.step` around every tiny low-level assertion. Reuse `Button`, `Input`, `BasePage`.

## Validation
Run targeted tests + typecheck, note actual error texts, update AI_WORKLOG with factual results, no invented bugs.
