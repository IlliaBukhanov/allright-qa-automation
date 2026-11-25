# AGENTS.md — All Right QA Automation Assignment

## Mission
Deliver a small, reproducible TypeScript QA automation assignment. Work in small reviewed increments; the engineer owns architecture, accepts changes, and validates AI output. Never claim execution, a defect, or an agent mistake without evidence.

## Requirements and priority
1. SauceDemo UI (`https://www.saucedemo.com`): 5–7 positive/core tests for login, catalog, sorting, cart, checkout; 2–3 negative/boundary tests. Use Playwright Test + TypeScript.
2. Restful Booker API (`https://restful-booker.herokuapp.com`): authenticate → create booking → update → delete → verify absence, with 2–3 negative tests. Use Playwright APIRequestContext unless the engineer explicitly selects Jest.
3. GitHub Actions runs verified tests on push and uploads the test report artifact.
4. README: install/run, coverage and exclusions, actual bug reports with steps/expected/actual only when reproduced.
5. AI_WORKLOG.md: agent prompts, decisions, reviewed diffs, and 3–5 *actual* agent errors if observed; never fabricate.

## UI framework architecture
The project owns its framework: define all base classes, UI element classes, components, pages, and TypeScript contracts **inside this repository**. Follow the established architecture of the current project; do not refer to external or previous frameworks as dependencies or sources of code.

- `src/base/WebElement.ts`: small wrapper around Playwright Locator, common interactions, nested element access.
- `src/base/ParentComponent.ts`: component root, children, `requiredElements`, readiness checks; uses WebElement via composition.
- `src/base/BasePage.ts`: URL navigation and page readiness.
- `src/element/FormControl.ts`: shared enabled/disabled behavior where needed.
- `src/element/Button.ts`, `Input.ts`, `Select.ts`, `Link.ts`: only the specialized UI controls currently required by tests.
- `src/component/`: business components such as `ProductCard`, `CartItem`, `Header`, `BurgerMenu`, `Footer`, `CheckoutSummary`.
- `src/page/`: page objects with typed business methods; tests own scenario assertions.
- `src/type/`: local contracts and interfaces, including separate types for case `testData` and `expectedData`.
- `src/data/dict/`: canonical values for products and other entities.
- `src/data/fixture/`: scenario data, including expected ordering. Keep related sorting cases in a single typed array/file, not one file per variation.

**Element reuse rule:** Before creating a new UI element type or component, inspect existing `WebElement`, `ParentComponent`, and specialized controls. Do **not** create a separate `Text`, `Image`, `Badge`, or any other wrapper if existing element functionality already covers the behavior. Add a new class only for meaningful, reusable behavior; explain the reason. Avoid duplicate wrappers around native Playwright methods.

**Parameterized tests:** define case arrays with `name`, `testData`, and `expectedData`; register independent Playwright tests with `cases.forEach(...)`. Do not use asynchronous `forEach` to sequentially perform UI actions; use `for...of` with `await` for that purpose.

**Authentication:** authenticated UI tests may load a setup-created Playwright `storageState`; login and unauthorized-navigation tests must start without it. Ensure that saved state contains no prefilled cart. Do not commit auth state files.

**Reporting:** use the native Playwright list and HTML reporters (`playwright-report/`, `open: "never"`). CI uploads the complete HTML report after non-cancelled test runs, including failures; missing report output is an error. Default execution is headless; `npm run test:headed` is for debugging. Use `npm run report` to view the report. Retain videos and traces on failure and screenshots only on failure. Verify the HTML report and any diagnostic attachments before claiming successful evidence delivery.

### Playwright HTML report step reporting — required
- Every meaningful Page Object action and validation group must be visible as a descriptive `test.step()` in the HTML report steps.
- Validation methods such as `LoginPage.expectStaticContent()` should create a parent step with nested steps grouped by purpose: logo, credentials panel, form semantics, error container. Name steps in user-readable English, not implementation jargon.
- Use nested steps only when helpful; avoid one step per trivial assertion and avoid duplicate wrapper steps in spec files when the method already reports itself.
- Step names must describe actual work. Preserve assertion failures and native Playwright retries; never swallow errors to keep a step green.
- In tests, group important flows such as login, authorization-state validation, add/remove, checkout and confirmation into named steps.
- UI screenshots, traces, and WebM recordings are evidence; retain expected artifacts according to configuration and confirm attachment visibility in Playwright HTML report. Do not attach secrets or raw authentication cookies to reports.

### Assertion policy — required
- Use `toHaveText()` for **exact, known** static labels, headings, and complete error messages. `toContainText()` is allowed only when intentionally verifying a substring or part of a larger variable-content region; explain that choice.
- Login failure fixtures must carry the full actual message, including the `Epic sadface: ` prefix, validated against the target app. The test must assert no authenticated redirect and no authentication cookie.
- For long credential panels, do not force an exact multiline match until actual whitespace/content has been inspected; validate documented headings and the complete expected username set using appropriately scoped assertions. Never silently loosen an exact error-message assertion.
- Keep test case `expectedData` in fixture and expected entity values in `dict`; avoid hardcoded business assertions in test files.

### Login authentication-state contract
- Positive login must verify `/inventory.html` and the authentication cookie `session-username` through `page.context().cookies()` (or the `context` test fixture).
- Verify cookie exists, value equals the username provided in test data, belongs to the SauceDemo host (allow legitimate domain formatting, such as a leading dot), and, when a persistent expiration is set, expires in the future. Do not assert an exact expiration timestamp.
- Negative login tests must start with clean `storageState`, assert no authentication cookie is created and keep independent exact error assertions.
- Keep cookie assertions in test/spec or a small reusable assertion helper when justified, not in `LoginPage`; Page Objects own interactions and their page/component readiness/content checks.
- Treat `session-username` as demo application state, not proof of a server-authenticated secure session. Confirm behavior on the running app before claiming a contract is satisfied.

## LoginPage contract
The provided SauceDemo login markup contains:
- `.login_logo` with `Swag Labs`
- `[data-test="login-container"]`, `form[aria-label="Login"]`
- `[data-test="username"]`, `[data-test="password"]`, `[data-test="login-button"]`
- `.error-message-container` (empty on initial view: assert attached, not visible)
- `.login_credentials_wrap`, `.login_credentials_wrap-inner`
- `[data-test="login-credentials"]` and its heading; six displayed usernames
- `[data-test="login-password"]` and its heading; displayed demo password
On initial page open, wait only for the username, password and submit controls. Verify static content, the attached empty error container, placeholders, input types and form/button state separately where required. Do not treat a hidden empty error container as a missing page.

## Reliability and review
- Use Playwright web-first assertions and event-driven waits; no hardcoded sleeps or arbitrary fixed timeouts.
- Do not use `force: true` by default; explain any use.
- Avoid duplicate wrappers over `Locator.fill`, `Locator.clear`, and other native methods without specific behavior. For example, `locator.isVisible()` is an immediate state probe, **not** a wait.
- Tests must be independent and use uniquely generated data where relevant. For Booker, verify writes through follow-up GET; clean up created resources in `finally` when possible.
- Avoid committing credentials, tokens, private repository code or internal company data. Demo credentials can be configured, but prefer environment variables for secrets.
- Do not assume selectors, API status codes or response shapes not confirmed by the provided markup/docs or test execution.
- Keep actual code and actual test results as the source of truth; if uncertain, call it out.

## Working procedure for the agent
1. Read this file and inspect only relevant sources.
2. Before edits, state target files, intended change and acceptance criteria.
3. Prefer a focused change in 1–3 files; no repository-wide refactors without permission.
4. Preserve established naming/style unless the engineer approves a change.
5. Run the narrowest relevant checks and report exact commands/results. If execution isn't available, say so.
6. Show a reviewable diff; flag compromises and risks.
7. Update `AI_WORKLOG.md` after every meaningful AI-assisted task with the actual request/prompt, AI contribution, changed files, executed validation and results, observed errors, detection and human corrections. Never invent evidence, engineer approval or successful runs. Preserve a factual technical record for later editorial cleanup before submission.

## Completion checklist
- Required UI/API scope runs with meaningful assertions and isolated data.
- GitHub Actions uploads report artifact.
- README is reproducible and documents exclusions; bug reports only for reproduced bugs.
- AI_WORKLOG reports genuine agent collaboration and corrections.

## Native assertions and actionability

- Use native Playwright `expect` and meaningful `test.step()` groups. Custom assertion messages may explain the purpose of a check.
- Do not recreate assertion adapters or automatic Expected/Actual snapshot attachments. Native matcher failures supply comparison diagnostics; successful comparisons do not require separate evidence attachments.
- Keep `Input.fill()`, `Button.click()` and `Select.select()` thin; rely on native actionability checks. Use `waitForEnabled()` / `waitForDisabled()` only for an explicit state requirement, not as an automatic prerequisite.
- Preserve web-first retryable locator assertions, independent expected data, original assertion failures and exact comparisons. Do not attach tokens, cookies or sensitive payloads.
- Never access protected or private members directly from tests; use the public interface.
- Historical prompts and saved evidence document previous architecture; current instructions and source contracts take precedence.

## Optional text-to-test CLI
- See `pipeline/README.md`. Keep generated experiments under `pipeline/generated/`, separate from maintained `test/` and primary CI.
- When the CLI requests structured read-only generation, return the requested JSON only; do not edit the repository or worklog, run commands to execute tests, or change framework code. The runner owns persistence, validation and factual logging for that mode. Normal interactive worklog rules remain unchanged.
- Use the stated test-case count and project, preserve expected outcomes, and do not fabricate pass/fail or review evidence.
