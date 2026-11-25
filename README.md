# All Right — QA Automation Assignment

Automated UI and API tests written in **TypeScript** using **Playwright Test**, with the built-in **Playwright HTML** reporter and **GitHub Actions** CI.

[![QA Automation Tests](https://github.com/IlliaBukhanov/allright-qa-automation/actions/workflows/tests.yml/badge.svg)](https://github.com/IlliaBukhanov/allright-qa-automation/actions/workflows/tests.yml)

## Systems under test

| Area | Application | Purpose |
| --- | --- | --- |
| UI | [SauceDemo](https://www.saucedemo.com/) | Login, product catalog, cart, navigation, checkout and purchase |
| API | [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | Booking authentication, CRUD and negative scenarios |

## Requirements

- Node.js **22** and npm
- Playwright Chromium (installed using the command below)

## Quick start

From the repository root:

```bash
npm ci
npx playwright install chromium
npm test
```

On a new Linux CI machine, use `npx playwright install --with-deps chromium` to install the browser and system dependencies. On Windows PowerShell, if the `.ps1` launchers are blocked, use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

### Commands

| Command | Action |
| --- | --- |
| `npm test` | Full suite: setup, UI and API |
| `npm run test:ui` | Login/unauthenticated and authenticated UI projects |
| `npm run test:api` | API project only |
| `npm run typecheck` | TypeScript type checking |
| `npm run test:headed` | Full suite with visible Chromium |
| `npm run report` | Open the latest Playwright HTML report |

To view execution in a browser while debugging, use `npx playwright test --headed --project=login` (or another project). By default, local and CI execution is headless. The current configuration saves Playwright video **on test failure** (`video: "retain-on-failure"`), not for every successful test.

## Test coverage

### UI — SauceDemo

| Feature | Checks |
| --- | --- |
| Login | Successful login, complete exact error messages in five invalid-login cases, presence/absence of the `session-username` cookie |
| Inventory | All six products, names/images/details, sorting by name and price (four options, with name/price association checks), add all / remove all |
| Product details | Open a product and verify its name, price, description, image and return navigation |
| Cart | Add two items, preserve items after navigating back to inventory, remove items, verify names, prices, quantities and cart badge |
| Navigation | Burger menu, About link destination, All Items, Reset App State (cart clearing, known button-state defect BUG-UI-001, navigation workaround), Logout and footer social link destinations |
| Restricted access | Direct navigation to protected pages without an authenticated session |
| Checkout validation | Required first name, last name and postal code |
| Purchase | Login → add product → cart → checkout → verify subtotal/tax/total → finish → verify confirmation → download and validate the order PDF → back to inventory |

The assignment core includes login, catalog, sorting, cart and purchase; login failures and checkout validation cover negative paths. Product details, all sorting variants, navigation, logout, protected routes and PDF download extend the requested minimum.

External navigation checks validate link destinations and attributes; they do not test the external social networks themselves.

### API — Restful Booker

- Authenticate and obtain a token.
- Create a booking and validate the returned record.
- Read it back, update it via an authenticated request and verify persistence with another GET.
- Delete it and verify subsequent GET returns `404`.
- Validate invalid credentials, missing update authorization and invalid update token (both verify unchanged booking data).

The API tests use unique booking names, returned booking IDs and cleanup where possible. Restful Booker is a **shared public demo service**; external resets or availability problems may affect results.

Demo credentials default to `admin` / `password123` and may be overridden with `BOOKER_USERNAME` and `BOOKER_PASSWORD` environment variables. Never commit private credentials.

## Architecture

```text
src/
  base/             WebElement, ParentComponent, BasePage
  element/          Reusable Button/Input/Select/Link controls
  component/        ProductCard, CartItem, BurgerMenu
  page/             SauceDemo Page Objects
  api/              AuthController and BookingController
  data/dict/        Canonical product/navigation/user values
  data/fixture/     Typed scenario inputs and expected outcomes
  type/             Local TypeScript contracts
test/
  auth.setup.ts     Creates authenticated browser state
  ui/               UI test specifications
  api/              API test specifications
.github/workflows/   GitHub Actions test workflow
```

Page Objects and components encapsulate UI interactions. Test specifications own scenario assertions. Parameterized tests use typed `testData` and `expectedData` fixtures. The API layer uses Playwright's `APIRequestContext`; no second test framework is required.

### Browser state and project isolation

`playwright.config.ts` defines four projects:

- `setup`: authenticates the standard user and writes `playwright/.auth/standardUser.json`.
- `login`: login, purchase and unauthorized-route tests in clean browser contexts.
- `ui`: authenticated UI tests that depend on `setup`.
- `api`: Restful Booker requests with a separate `baseURL`.

The generated auth state is ignored by Git. The login, purchase and protected-route tests do not reuse it.

## Reporting and artifacts

Playwright writes a ready-to-view HTML report to `playwright-report/` after each normal test run. The console uses the built-in list reporter. No Java or third-party reporting dependency is required.

```bash
npm run report
# Equivalent: npx playwright show-report playwright-report
```

Named `test.step()` calls and native matcher errors are available in the HTML report. Native `expect` provides expected/actual diagnostics on failure; successful assertions do not create additional snapshots. The framework relies on native actionability checks for click, fill and select. Screenshots, videos and traces are retained on failure (`only-on-failure` / `retain-on-failure`). The HTML reporter bundles referenced attachments in the report directory. Keep the complete directory, not just `index.html`. Generated reports, test results and authentication state are excluded from Git. Report/trace access should be limited to trusted reviewers because diagnostics may include demo session data.

## Continuous integration

Workflow: `.github/workflows/tests.yml`. Triggers: push, pull request and manual dispatch. The Ubuntu job installs Node.js 22, pinned npm dependencies and Chromium, checks TypeScript, and runs the full suite headless. It uploads `playwright-report` for non-cancelled test runs, including failures, with 14-day retention. Missing report output after a test run fails the upload step.

1. Open [GitHub Actions — QA Automation Tests](https://github.com/IlliaBukhanov/allright-qa-automation/actions/workflows/tests.yml) and select the latest run for the submitted commit.
2. Download the `playwright-report` artifact and extract all files into a directory named `playwright-report`.
3. Run `npx playwright show-report /path/to/playwright-report` (or `npm run report` if the extracted directory is in the repository root).

The engineer reported a local run of the updated suite: 28 passed, 1 failed (33.1s). The failure exposed BUG-UI-001. The engineer subsequently reported a targeted navigation run of 6 passed (19.3s), including setup and one expected failure for BUG-UI-001. The engineer later reported a successful full regression run; the current checkout should be verified separately in CI.

## AI-assisted implementation and work log

`AGENTS.md` and `.agents/skills/qa-test-generator/SKILL.md` define implementation conventions, review rules and AI activity logging. `pipeline/prompts/` preserves the task prompts used to build and review the maintained UI/API suite; see [`pipeline/prompts/README.md`](pipeline/prompts/README.md) for the consecutive publication numbering and execution order. The optional CLI pipeline is isolated from the maintained runnable suite (see below). `AI_WORKLOG.md` records actual Codex contributions, validation results and observed corrections. Human review/approval is distinct from an agent's own implementation status.

This project uses a **human-orchestrated** process: engineering requirements → ChatGPT-authored task prompts → Codex implementation and local validation → engineer review. This is not a claim of fully autonomous multi-agent execution.

## Bonus — AI-driven test generation

The optional [CLI pipeline](pipeline/README.md) accepts natural-language Markdown cases, invokes Codex non-interactively using the existing agent instructions and QA skill, saves generated TypeScript, typechecks it, runs targeted Playwright scenarios and records evidence. Three demonstration inputs are included: cart navigation, checkout validation and invalid-token API authorization. They reproduce existing coverage; they are not additional regression tests.

After installing project dependencies and Chromium, validate the included generated tests without calling Codex:

```bash
npm run rerun:generated
```

For fresh generation in a clean working copy without generated files, authenticate the Codex CLI and run `npm run generate:test`. Use `--regenerate` only when intentionally replacing existing generated source.

The final local Windows run on 25 November 2026 passed all three generation cases, including five generated tests and two authentication setup executions. Each stage returned exit code 0; the saved original and executed source match for that run. Saved results apply to the recorded source snapshots. Use `rerun:generated` to validate the current runnable files. Earlier generation and runner errors, corrections and final results are documented in the [example evidence index](pipeline/examples/README.md). The final source received ChatGPT static review; engineer approval is not inferred. To execute the already generated examples without calling Codex, use `npm run rerun:generated`. Use `--regenerate` only if intentionally replacing existing generated outputs. The maintained CI does not invoke the model or run experimental generated tests. See the [pipeline guide](pipeline/README.md) for prerequisites, individual cases, reruns, reports and limitations.

## Findings / Bug Reports

### BUG-UI-001 — Product button state remains stale after Reset App State

- **Status:** Confirmed by the engineer manually and by the reported automated run.
- **Environment:** SauceDemo, Chromium, `standard_user`.
- **Severity / Priority:** Minor / Low (proposed triage; cart contents are cleared and a workaround exists).
- **Preconditions:** Authenticated user on the inventory page.

**Steps to reproduce:**

1. Add Sauce Labs Backpack to the cart and verify that its button reads Remove.
2. Open the side menu and click Reset App State.
3. Observe the product button without leaving the inventory page.
4. Open the cart and inspect its contents.
5. Return to the inventory using Continue Shopping.

**Expected:** The badge disappears, the cart is empty, and the button immediately returns to Add to cart.

**Actual:** The badge disappears and the cart is empty, but the button remains Remove. The engineer confirmed that returning from the cart restores the correct button state.

**Workaround:** Open the cart and return to the inventory. The user-facing state is then correct.

**Impact:** The catalog temporarily misrepresents whether the product is in the cart.

**Evidence:** The engineer reported 28 passed and 1 failed in 33.1 seconds. Both immediate button assertions failed; the run listed screenshot, video and trace attachments. Manual reproduction and recovery were subsequently reported by the engineer. The attachment files themselves were not supplied for independent inspection.

**Automated coverage:** `test/ui/navigation.spec.ts` now separates cart clearing, immediate button-state restoration (expected failure via `test.fail()` linked to BUG-UI-001), and recovery after returning from the cart. Only the immediate assertions are marked as expected to fail, after successful setup and reset. An unexpected pass flags a possible fix for review. The engineer reported the targeted navigation suite passed (6 entries including setup and the expected failure); the engineer later reported a successful full regression; hosted CI verification remains pending.

Historical automation-code mistakes are documented in `AI_WORKLOG.md` separately from application defects.

The historical integration-review run recorded **29 Playwright entries including one authentication setup** (28 test scenarios). These are results documented in `AI_WORKLOG.md`, not a claim that the current working tree has been rerun after subsequent cleanup. SauceDemo checks covered `standard_user` login, catalog, sorting, cart, checkout, and signed-out access. Restful Booker checks covered authenticated booking CRUD, invalid credentials, update refusal without authorization, and lookup after deletion. The new invalid-token case replaces the standalone deleted-ID test; the CRUD flow still checks 404.

## Limitations and out-of-scope coverage

- **Authentication:** SauceDemo is a demo application. The `session-username` cookie represents application state and does not verify secure server-side session management.
- **Environment stability:** Both applications are public demo environments without a guaranteed SLA. Restful Booker uses shared, mutable data. Test isolation and cleanup minimize interference but cannot eliminate external changes or resets.
- **External integrations:** Social media links are validated by their target URLs. Third-party websites are intentionally excluded from end-to-end coverage.
- **PDF validation:** The download check verifies the filename, non-empty content, and PDF file signature. Internal document content and business data are not validated.
- **Browser coverage:** UI tests run on desktop Chromium only. Cross-browser and mobile-device testing are out of scope.
- **Non-functional testing:** Performance, load, and security testing are intentionally excluded to prioritize core functional scenarios within the assignment's time constraints.
