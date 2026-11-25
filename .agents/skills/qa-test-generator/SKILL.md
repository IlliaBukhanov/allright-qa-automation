---
name: qa-test-generator
description: Generate and review Playwright TypeScript tests using existing project contracts, UI elements, page objects, and typed test data, with mandatory AI_WORKLOG documentation.
---

# QA test generator

Use this skill when authoring or reviewing UI or API tests in the All Right QA automation repository.

## Inspect before generating

1. Read the repository `AGENTS.md` and relevant existing files.
2. Read types in `src/type/`, canonical entity values in `src/data/dict/`, and scenario fixtures in `src/data/fixture/`.
3. Read existing `WebElement`, `ParentComponent`, specialized UI controls, components, and Page Objects.
4. Reuse their contracts, naming, and selectors. Do not invent alternative parallel architectures.

## UI element reuse — mandatory

- **Do not create a new UI element class when `WebElement`, `Button`, `Input`, `Select`, `Link`, or an existing component already provides the required behavior.**
- In particular, do not introduce `Text`, `Image`, or `Badge` wrappers merely to read text, image attributes, or the cart badge. Start with existing `WebElement` functionality.
- A new element or component is justified only by distinct, reusable behavior not adequately covered by existing abstractions. Explain the reuse benefit and request engineer approval before adding an architectural layer.
- Keep locators and UI mechanics in Page Objects/components. Keep test assertions in test code unless expressly defining page readiness or a component-specific verification contract.
- Use `requiredElements` for required page/component readiness, and Playwright retrying assertions for dynamic states.

## Typed, data-driven test cases

- Define entity contracts and test case types locally in `src/type/`. Do not duplicate or invent types when they already exist.
- Entity values belong in `src/data/dict/`; case-specific `testData` / `expectedData` and expected sorting order belong in `src/data/fixture/`.
- Keep related sorting cases together in one file, represented as a typed case array.
- Use `cases.forEach(({ name, testData, expectedData }) => test(name, async (...) => { ... }))` to register separate tests.
- For sequential awaited UI operations within one test, use `for...of`, not `forEach(async ...)`.
- Never generate expected assertions by simply copying actual UI values. Where the demo catalog is fixed, use verified static expected data.

## Mandatory readable report steps

- On any action/validation method added or modified in `src/page/` or `src/component/`, use descriptive `test.step()` for meaningful operations and assertions; put nested `test.step()` groups inside multi-check verification methods (`expectStaticContent`, readiness checks, complex component verification).
- Preserve the layer boundaries: Page Objects/components may verify their own static content, element readiness, and component state. Tests own scenario outcomes, cookie checks, and cross-page business assertions.
- Example grouping for `LoginPage.expectStaticContent()`: parent `Verify login page static content`, children `Verify logo`, `Verify accepted usernames and password panel`, `Verify login form input types`, `Verify error container presence`.
- Do not duplicate a report step in a spec if the called method already creates that step. Use Playwright `test.step()`, supported by the built-in HTML reporter as nested steps.
- Match full expected error messages with `toHaveText()`; use `toContainText()` only for intentionally partial checks. Read source fixtures and the DOM before replacing an expected string.
- Positive login requires verified `session-username` cookie with expected username, correct host and future expiration if applicable. Negative login requires absence of this cookie, with clean unauthenticated `storageState`. Cookie checks belong in spec/assertion helper, not in `LoginPage` actions.
- Retain videos and traces on failure and screenshots only on failure. Verify the complete HTML report artifact and its referenced attachments; do not promise evidence without checking actual output.

## Validation and review

- Run the narrowest applicable TypeScript, Playwright, or API checks; report exact commands and outputs.
- Ensure UI authentication is isolated; login and protected-route negative scenarios must use unauthenticated contexts.
- Do not weaken assertions merely to make tests pass or fabricate test results.

## Mandatory AI_WORKLOG

After every meaningful generation or review task, append a factual entry to `AI_WORKLOG.md` with:
- Original or accurately recorded prompt; tool; task and engineering decision.
- Created/changed files and generated test IDs.
- Validation commands and real outcomes, or explicitly `Not executed`.
- Actual AI mistakes, how they were detected and corrected, and human interventions or decisions (only if confirmed).
- Final status and any unresolved risks.

Never invent errors to meet the requested count of AI mistakes. Do not assert engineer approval unless explicitly given. Keep the development log factual; it may be edited for clarity and presentation before publication without misrepresenting events.

## Native Playwright assertions and actions

- Use native `expect(locator).toHaveText(...)` and other retryable matchers; use `expect(actual).toEqual(expected)` for values. Add descriptive custom messages and meaningful `test.step()` groups where helpful.
- Do not recreate assertion wrappers or automatic Expected/Actual attachments. Native matcher errors already include comparison diagnostics on failure.
- Use `Input.fill()` for form inputs, and rely on native actionability for click, fill and select. Only assert enabled/disabled when it is a requirement of the scenario.
- Page readiness must use minimal actionable controls; verify decorative/static content separately.
- Do not attach secrets or raw authentication payloads. Current repository instructions supersede historical prompts and snapshots.

## CLI generation mode
When called by `pipeline/generate.mjs`, follow its structured-output contract and return raw TypeScript and notes without modifying files. Use the provided Markdown case as the scope and existing code as reference. The runner performs the typecheck, targeted test execution and worklog update; do not claim those occurred during generation.

- Never access private or protected component members directly from tests. Use public methods and accessors; do not weaken access modifiers to make generated tests compile.
