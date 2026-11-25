# AI Worklog — selected development record

This is a curated chronological record of AI-assisted implementation for the All Right QA automation assignment. The QA engineer defined the scope and review criteria; ChatGPT assisted with task formulation, and Codex implemented changes and reported validation results. Engineer review is noted only where recorded. Validation outcomes remain those recorded during development.

## Key AI mistakes and corrections (historical summary)

| AI mistake | Detection | Correction |
| --- | --- | --- |
| Passed custom Button wrappers into native locator matchers | Typecheck (TS2339) and focused cart test failure | Passed the backing `.locator` instead |
| Targeted the inner product name rather than its link | Focused UI test stayed on Inventory | Scoped the anchor to the card (`a[data-test$="-title-link"]`) |
| Omitted image DOM type narrowing | Typecheck | Narrowed the image element to `HTMLImageElement` |
| Used a link-role selector that matched only About | Focused navigation test failure | Used the observed `.bm-item` selector for all menu entries |
| Sampled redirect URL too early | Three protected-route cases failed on the settled URL | Asserted the login redirect and retained exact error checks |

The table summarizes recorded development observations, not new failures reproduced during maintenance. Selected commands and reviewer decisions are recorded below. Routine environment setup and intermediate implementation details are omitted.

## Implementation and validation log

Selected implementation and validation records. Prompts 01–12 are renumbered consecutively for publication; commands and outcomes refer to their original development stages. This is not an exhaustive transcript.

### 01 — Strict login errors and authentication cookie checks (2026-11-25)
- **Prompt:** [`01-login-assertions-and-cookies.md`](pipeline/prompts/01-login-assertions-and-cookies.md).
- **AI execution:** Codex with `qa-test-generator`; implemented requirements for exact negative-login errors, positive and negative `session-username` cookie checks, unauthenticated login-project isolation, validation, and factual worklog reporting.
- **Scope and files:** Updated `src/data/fixture/login.ts` and `test/ui/login.spec.ts`; reviewed `AGENTS.md`, the `qa-test-generator` skill, login types/dictionary/fixture/page/spec, base element contracts, `playwright.config.ts`, and `package.json`. `playwright.config.ts` already configured the `login` project with empty cookies and origins, so it was not changed.
- **AI contribution:** Replaced all five negative fixture expectations with the complete verified `Epic sadface: ...` messages; retained five independent `invalidLoginCases.forEach` tests and the existing exact `LoginPage.expectError()` assertion; added Playwright steps and success assertions for the cookie's presence, fixture-derived username value, SauceDemo domain, and future expiration when persistent; added cookie-absence assertions to every failed-login case.
- **Engineer decisions / changes:** The prompt required business cookie assertions to remain in the spec and prohibited unnecessary abstractions; the engineer subsequently confirmed review and approval.
- **Validation:** `npm.cmd run typecheck` — exit code 0 (`tsc --noEmit`); `npx.cmd playwright test --project=login` — exit code 0, 6 passed in 34.8s.
- **Observed issues and resolution:** The existing “Incorrect username” fixture had a stray trailing `1` and all five expected errors omitted the rendered `Epic sadface: ` prefix. The requested exact-message update corrected both.
- **Actual AI mistakes:** None observed in this task.
- **Status:** Implementation and requested validations completed; engineer review completed and approval received.

### 02 — Inventory sorting and cart transitions (2026-11-25)
- **Prompt:** [`02-inventory-components-and-tests.md`](pipeline/prompts/02-inventory-components-and-tests.md).
- **Tool and request** — Codex. Prompt 02 requested repository-native inventory components, four fixture-driven sorts, a sequential add/remove test for the full catalog, clean auth state, and focused validation.
- **Files and decisions** — Added `src/component/ProductCard.ts`, `src/page/InventoryPage.ts`, and `test/ui/inventory.spec.ts`. Updated `test/auth.setup.ts` to check the cart before saving state. The existing product dictionary and typed sorting fixture supply the expected values. Price checks compare the displayed prices in order, so either ordering of equal-price items passes. The cart scenario stays on inventory.
- **Observed AI error and correction** — Four button assertions initially passed custom `Button` wrappers to Playwright matchers. Typecheck flagged TS2339, and the first focused run had five passes and one cart failure from the same incorrect matcher input. Passing the backing `.locator` corrected the assertions.
- **Validation** — After the correction, `npm.cmd run typecheck` exited 0. A fresh `npx.cmd playwright test --project=ui test/ui/inventory.spec.ts` exited 0 with six passes in 43.6s, including setup.
- **Status** — Implementation reviewed and approved by the engineer.

### 03 — Catalog and product details (2026-11-25)
- **Prompt:** [`03-ui-catalog-product-details.md`](pipeline/prompts/03-ui-catalog-product-details.md).
- **AI execution:** Codex with `qa-test-generator`; implemented the requested catalog and product-details scope without modifying previously completed scenarios.
- **Scope and files:** Updated `src/component/ProductCard.ts`, `src/page/InventoryPage.ts`, and `test/ui/inventory.spec.ts`; added `src/page/ProductDetailsPage.ts`; updated this worklog. Existing four sorting tests and the add/remove-all test were not renamed or regenerated.
- **AI contribution:** Extended the existing card with required name, description, price, image, and details-link elements; added lookup by product name and a focused details Page Object; added one catalog test for dictionary-backed names/prices, count, uniqueness, nonempty descriptions, and loaded images, plus one details/navigation test that compares name and price with the dictionary and description/image source with the catalog card.
- **Engineer decisions / changes:** The prompt explicitly prohibited fabricated descriptions/images, so the dictionary remains unchanged and the live description/image values are checked for completeness and catalog/detail consistency. No new UI element type or scenario fixture was needed because there is one fixed details case.
- **Validation:** Initial `npm.cmd run typecheck` failed with four TS2339 errors because `Locator.evaluate` inferred a generic HTML/SVG element for image properties; explicit `HTMLImageElement` narrowing fixed this. The first `npx.cmd playwright test --project=ui test/ui/inventory.spec.ts` run produced 7 passed and 1 failed in 57.3s. After correcting the details-link locator and completing review additions, final `npm.cmd run typecheck` exited 0 and final `npx.cmd playwright test --project=ui test/ui/inventory.spec.ts` exited 0 with 8 passed in 54.6s.
- **Observed issues and resolution:** The initial details link wrapped the inner product-name `div`; the focused run proved that clicking it left the browser on Inventory, where the details object found six matching name nodes. The locator was corrected to the card's `a[data-test$="-title-link"]`. The TypeScript image-element inference issue was detected by typecheck and corrected without weakening the loaded-image assertion.
- **Actual AI mistakes:** The first details-link locator targeted the inner name element rather than the anchor; the targeted UI failure detected it and the locator was corrected. The first image callback omitted a required DOM type narrowing; typecheck detected it and it was corrected.
- **Status:** Catalog and product-details implementation and focused validation completed; engineer review completed and approval received.

### 04 — Cart navigation and contents (2026-11-25)
- **Prompt:** [`04-ui-cart-navigation.md`](pipeline/prompts/04-ui-cart-navigation.md).
- **AI execution:** Codex with `qa-test-generator`. Implement only prompt 04, preserve existing UI scenarios, run focused checks, before engineer review.
- **Changes:** Added `src/component/CartItem.ts`, `src/page/CartPage.ts`, `src/type/TCartNavigationCase.ts`, `src/data/fixture/cartNavigation.ts`, and `test/ui/cart.spec.ts`. Updated `src/page/InventoryPage.ts` to reuse the cart link for navigation. The test “Preserve cart contents across navigation and remove a product” uses the existing isolated authenticated context and dictionary products. It checks exact cart entries, quantities, prices, badge changes, navigation readiness, and cleanup. Checkout is exposed by CartPage for later scenarios.
- **Validation:** `npm.cmd run typecheck` passed before the run and after fixture restoration. `npx.cmd playwright test --project=ui test/ui/cart.spec.ts test/ui/inventory.spec.ts --grep 'Preserve cart contents|Add and remove every inventory product'` passed all three tests including auth setup in 23.5s.
- **Observed issues:** No implementation errors or SauceDemo defects were observed in the focused checks.
- **Status:** Cart implementation and focused validation completed; checkout was outside this increment. Engineer review completed and approval received.

### 05 — Burger menu and footer navigation (2026-11-25)
- **Prompt:** [`05-ui-menu-footer.md`](pipeline/prompts/05-ui-menu-footer.md).
- **Tool and request** — Codex with `qa-test-generator`. Implemented navigation and menu scenarios as the next development increment.
- **Changes** — Added `src/component/BurgerMenu.ts`, `src/data/dict/navigation.ts`, and `test/ui/navigation.spec.ts`. Added the footer locator to `src/page/InventoryPage.ts`. Three scenarios cover All Items and external link destinations, reset of a populated cart, and logout with cookie removal and a subsequent inventory redirect.
- **Live DOM** — The menu includes Dynamic Catalog in addition to the four entries listed in the prompt. About has href `https://saucelabs.com/` and no target attribute. X, Facebook and LinkedIn have hrefs `https://x.com/saucelabs`, `https://www.facebook.com/saucelabs`, and `https://www.linkedin.com/company/sauce-labs/` respectively, each with target `_blank`. External destinations were checked through DOM attributes.
- **Observed AI errors and corrections** — Typecheck flagged TS2729 when the toggle field referenced the page parameter property during field initialization. The toggle now initializes in the constructor. The first UI run reported three passes and one failure because the link role matched only About. The DOM-observed `.bm-item` selector includes the action entries.
- **Validation** — Final `npm.cmd run typecheck` passed. Final `npx.cmd playwright test --project=ui test/ui/navigation.spec.ts` passed all four tests including setup in 33.4s.
- **Status** — Navigation implementation and focused validation completed; engineer review completed and approval received.

### 06 — Protected routes without authentication (2026-11-25)
- **Prompt:** [`06-ui-protected-routes.md`](pipeline/prompts/06-ui-protected-routes.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement isolated unauthenticated access checks for protected routes.
- **Changes** — Added `src/type/TProtectedRouteCase.ts`, `src/data/fixture/protectedRoutes.ts`, and `test/ui/protected-routes.spec.ts`. Each route gets its own context with explicitly empty storage state. The cases check the login redirect, the visible login form, the exact route-specific error, and absence of the session cookie.
- **Observed AI error and correction** — The preliminary live probe sampled the URL before waiting for the error text. The first test run inherited that premature expectation and all three cases failed because the settled URL was `/`. Updated the URL assertion to check the login redirect while retaining the exact error checks.
- **Validation** — `npm.cmd run typecheck` passed. Final `npx.cmd playwright test --project=ui --no-deps test/ui/protected-routes.spec.ts` passed all three cases in 21.9s without running the authenticated setup.
- **Status** — Protected-route implementation and focused validation completed; engineer review completed and approval received.

### 07 — Checkout required fields (2026-11-25)
- **Prompt:** [`07-ui-checkout-validation.md`](pipeline/prompts/07-ui-checkout-validation.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement checkout required-field validation.
- **Changes** — Added `CheckoutPage.ts`, `TCheckoutData.ts`, `checkoutValidation.ts`, and `checkout-validation.spec.ts`. Each case prepares a one-item cart in its isolated authenticated context and verifies the checkout URL and readiness before and after submission.
- **Validation** — `npm.cmd run typecheck` passed. `npx.cmd playwright test --project=ui test/ui/checkout-validation.spec.ts` passed four tests including setup in 33.2s. Exact observed messages were `Error: First Name is required`, `Error: Last Name is required`, and `Error: Postal Code is required`.
- **Observed issues and status** — Node warned that FORCE_COLOR overrides NO_COLOR. No implementation errors or application defects were observed. Checkout validation and focused verification completed; engineer review completed and approval received.

### 08 — Purchase E2E and order PDF (2026-11-25)
- **Prompt:** [`08-ui-purchase-e2e.md`](pipeline/prompts/08-ui-purchase-e2e.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement end-to-end purchase and PDF receipt verification.
- **Changes** — Added `CheckoutOverviewPage.ts`, `CheckoutCompletePage.ts`, `purchase.ts` fixture, and `purchase.spec.ts`. Updated `playwright.config.ts` to include purchase in the clean login project only and updated README coverage. The test checks the demo session, the one-item cart, exact totals and confirmation, the order PDF, and a cleared cart on return.
- **Live inspection** — An initial post-click snapshot still showed overview controls. Waiting for the confirmation control revealed Generate PDF order. Clicking it emitted a download named `swag-labs-order-2026-11-25_13-09-20.pdf` with 2923 bytes. The live one-item subtotal, tax, and total were $29.99, $2.40, and $32.39.
- **Validation** — `npm.cmd run typecheck` passed. `npx.cmd playwright test --project=login test/ui/purchase.spec.ts` ran only the purchase test and passed in 11.5s with no auth setup. The test performed login and validated the downloaded filename and PDF signature.
- **Status** — Purchase flow implementation and focused verification completed; engineer review completed and approval received. No application defects observed.

### 09 — Restful Booker API foundation (2026-11-25)
- **Prompt:** [`09-api-contracts-controllers.md`](pipeline/prompts/09-api-contracts-controllers.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement the Restful Booker API client layer and fixtures.
- **Changes** — Added `AuthController.ts` and `BookingController.ts` under `src/api`, and `auth.ts` and `booking.ts` under `src/data/fixture/api`. The API project now targets Restful Booker. The controllers return raw Playwright responses and reuse the existing types. PUT and DELETE send the Booker token as a cookie. Credentials are separate and support environment overrides with public demo defaults.
- **Validation** — `npm.cmd run typecheck` passed. A direct Playwright request-context smoke probe against the configured host observed GET /ping 201 and POST /auth 200 with a nonempty token. The probe logged statuses and token presence only. CRUD was outside this increment.
- **Observed issues and status** — No implementation errors observed. API foundation implemented and smoke-checked; engineer review completed and approval received.

### 10 — Restful Booker CRUD lifecycle (2026-11-25)
- **Prompt:** [`10-api-booking-crud.md`](pipeline/prompts/10-api-booking-crud.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement an authenticated booking CRUD lifecycle.
- **Changes** — Added `test/api/booking-crud.spec.ts`. It uses an isolated request context, a unique synthetic surname, and the returned booking ID. It verifies complete booking content through GET after create and update. The finally block attempts cleanup if needed and records cleanup failures without replacing the primary assertion error.
- **Validation** — `npm.cmd run typecheck` passed. `npx.cmd playwright test --project=api` reported one pass in 2.0s against the public demo. Auth, create, both booking reads, and update returned 200. Delete returned 201, followed by 404.
- **Observed issues and status** — Node warned that FORCE_COLOR overrides NO_COLOR. No implementation errors or application defects were observed. Booking CRUD lifecycle implemented and verified; engineer review completed and approval received.

### 11 — Restful Booker negative cases (2026-11-25)
- **Prompt:** [`11-api-negative-cases.md`](pipeline/prompts/11-api-negative-cases.md).
- **Tool and request** — Codex with `qa-test-generator`. Implement negative authentication and booking scenarios.
- **Changes** — Added `test/api/booking-negative.spec.ts` and made the token optional in `src/api/BookingController.ts` for PUT. The tests cover invalid credentials, refusal to update a test-owned record without a token, and a missing ID established by creating and deleting a test-owned record. Cleanup preserves the original failure if both the scenario and cleanup fail.
- **Validation** — A Playwright request-context probe observed POST /auth 200 with reason Bad credentials and no token property. `npm.cmd run typecheck` passed. `npx.cmd playwright test --project=api` passed all four tests in 2.9s, including the existing CRUD case. The negative suite confirmed PUT 403 and unchanged persisted data, plus GET 404 after deleting the test record.
- **Observed issues and status** — Node warned that FORCE_COLOR overrides NO_COLOR. No application defects or implementation errors were observed. API negative scenarios implemented and verified; engineer review completed and approval received.

### 2026-11-25 — Integration review
- **Tool and request** — Codex with `qa-test-generator`. Perform an integration review of configuration, tests, and documentation.
- **Changes** — Moved protected-route discovery into the clean login project in `playwright.config.ts`. Updated README with reproducible install commands, Windows variants, current coverage and shared API limitations.
- **Validation** — `npm.cmd run typecheck` passed. `npm.cmd test -- --list` found 29 entries across 10 files with each scenario listed once (1 setup, 10 clean-context UI, 14 authenticated UI, 4 API). `npx.cmd playwright test --project=login --list` listed 10 tests without setup. With CI=true, `npm.cmd test -- --output test-results/task14` passed all 29 in 39.5s.
- **Observed issues and status** — The review found unnecessary auth setup for protected routes, an incorrect report opener target, and stale setup and coverage documentation. Fixed all three. No live test failures or application defects were observed. Engineer review completed and approval received.

### 12 — Optional non-interactive generation pipeline

- Prompt: [`12-headless-generation-pipeline.md`](pipeline/prompts/12-headless-generation-pipeline.md). The user requested implementation of the discussed bonus so they could launch generation themselves.
- Tool: ChatGPT with local file editing and Node-based validation. Codex CLI is the intended generator, not a tool actually invoked in this editing session.
- Added `pipeline/generate.mjs`, structured output schema, separate Playwright config, three Markdown input cases, example evidence guide, pipeline README and npm commands. Updated README, agent instructions, skill and Git ignore rules. Existing regression scenarios and CI are unchanged by this task.
- Decision: examples are derived from maintained tests and historical prompts; the agent may reuse existing patterns. This is a reproduction demonstration, not an unseen-case benchmark. Experimental tests use separate discovery, typecheck and report paths; the agent returns JSON in read-only mode and the runner records evidence.
- Validation performed: `node --check pipeline/generate.mjs` (passed); `npm run generate:test -- --dry-run` (all three prompts printed); invalid case selector returned 2; missing dependencies returned 1; standalone TypeScript syntax transpilation of bonus configuration passed. In a disposable copy, mock Codex/TypeScript/Playwright subprocesses exercised three-case success orchestration, preservation of original code, changed-code rerun and refusal to overwrite a generated file. Mock output was discarded and is not test evidence.

## Follow-up — Confirm BUG-UI-001 and isolate expected failure

- **User request:** Generate replacement files after manual confirmation of the Reset App State defect and recovery when returning from the cart.
- **Detection:** AI-assisted review identified a missing immediate product-button assertion. The engineer ran the strengthened suite: 28 passed, 1 failed (33.1s). The Add to cart button was not found within 5 seconds; the Remove button count remained 1 instead of 0. No other test failures were reported.
- **Engineer verification:** The engineer reproduced the issue manually and confirmed that returning from the cart restored the correct button state. This is a product defect, not an agent locator error; BUG-UI-001 tracks it.
- **AI changes:** Split the original scenario into cart clearing, immediate button restoration (expected failure only after successful preconditions), and recovery after cart navigation. Preserved the intended assertions and documented the confirmed bug and workaround in README. No new dependencies or reporter changes.
- **Validation:** Replacement source reviewed against existing Page Object methods; the revised tests have not been executed in the editing environment. Run typecheck, targeted navigation tests and the full suite, then inspect the HTML report and hosted CI. No new run result or approval is claimed.

## Bonus generation — Results and corrections

- First actual generation: 3/3 outputs, 2/3 typechecks, 0/3 successful case executions. Cart source used protected `root` from outside the component (TS2445, line 105). ChatGPT proposed using public `name.locator` rather than weakening encapsulation; no intermediate rerun was reported. Checkout and API failed in the runner because `--project`, project, and positional file filter were parsed as multiple project names. Corrected to `--project=${c.project}`. These two failures were runner errors, not proven generated-test errors.
- Improved prompt construction to embed complete AGENTS.md and SKILL.md, rather than only ask the agent to read them. The engineer removed prior output folders and launched fresh generation. Selected historical result files and source snapshots were recovered from the earlier uploaded archive; raw logs were not republished.
- Final real run (2026-11-25 17:52–17:54 UTC): 3/3 generation, 3/3 typecheck, 3/3 targeted execution. Cart 1, checkout 3, API 1 generated tests passed, plus two successful setup executions. All stage exit codes 0; original and executed source are byte-identical.
- ChatGPT inspected the final inputs, generated source, result JSON and local runner output. Cart verifies contents, prices, quantities, badge and removal; checkout checks exact errors and URL for each required field; API checks 403, unchanged full payload and cleanup. No further generated source edits were made. Minor redundancy in cart assertions and a residual API cleanup limitation are recorded in the example correction notes. No engineer approval is inferred.
- Both prompt and runner changed between iterations, so the improvement cannot be attributed solely to the skill. These examples reproduce existing scenarios, not an unseen-case benchmark.
- Fixed the stale pipeline guide and example index; updated README, per-case correction records and skill rule prohibiting direct private/protected member access. Targeted navigation run reported separately by engineer: 6 passed (19.3s), including one expected failure for BUG-UI-001.
- Validation of this documentation update: static inspection and byte comparison of generated source/evidence; no new live browser/API or Codex run, full regression or hosted CI executed during this review.


### Recorded CLI runs

Exit codes below are from the original result JSON files; a dash means the stage was not run.

| Case | Iteration | Generation | Typecheck | Playwright | Evidence |
| --- | --- | ---: | ---: | ---: | --- |
| 01-cart-navigation | First | 0 | 2 | — | [FAILED](pipeline/examples/01-cart-navigation/2026-11-25T17-39-07-159Z/result.json) |
| 01-cart-navigation | Final | 0 | 0 | 0 | [PASSED](pipeline/examples/01-cart-navigation/2026-11-25T17-52-04-899Z/result.json) |
| 02-checkout-validation | First | 0 | 0 | 1 | [FAILED](pipeline/examples/02-checkout-validation/2026-11-25T17-39-55-025Z/result.json) |
| 02-checkout-validation | Final | 0 | 0 | 0 | [PASSED](pipeline/examples/02-checkout-validation/2026-11-25T17-52-57-815Z/result.json) |
| 03-api-authorization | First | 0 | 0 | 1 | [FAILED](pipeline/examples/03-api-authorization/2026-11-25T17-40-29-049Z/result.json) |
| 03-api-authorization | Final | 0 | 0 | 0 | [PASSED](pipeline/examples/03-api-authorization/2026-11-25T17-53-34-623Z/result.json) |
