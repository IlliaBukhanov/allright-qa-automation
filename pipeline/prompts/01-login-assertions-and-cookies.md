# Codex prompt 01 — Login assertions and cookies

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Read `AGENTS.md`, `.agents/skills/qa-test-generator/SKILL.md`, the existing login types, dictionary, fixtures, `LoginPage`, tests, and `playwright.config.ts` before editing. Follow the project architecture and report changes in `AI_WORKLOG.md`.

Task: make login checks strict and verify the authentication cookie without adding unnecessary abstractions.

1. In negative login tests, use `await expect(page.getByTestId("error")).toHaveText(expectedData.error)` (or the existing LoginPage validation method with `toHaveText()`). Update fixture error values to the **full verified** messages including `Epic sadface: `. Preserve `invalidLoginCases.forEach` and the five independent cases. Keep expected strings in fixtures rather than test bodies.
2. In successful login, keep the navigation assertion and additionally read cookies via `context.cookies()`; find `session-username`; verify its value equals the test's `username`, its domain matches SauceDemo, and its future expiration if present. Do not hardcode the username or exact expiration date.
3. On every failed login check that `session-username` is absent. Ensure the `login` Playwright project remains unauthenticated (`storageState: {cookies: [], origins: []}`), isolated from setup-based logged-in UI tests.
4. Keep actions in `LoginPage`; business assertions in tests. Do not change unrelated workflows.
5. Run `npm run typecheck` and `npx playwright test --project=login` if environment permits. Report exact results, or `Not executed`.
6. Update `AI_WORKLOG.md` factually with task/prompt, modified files, tests, issues and engineer decisions. Do not claim review approval.

Acceptance: all negative error messages use exact match; success verifies cookie; failures verify cookie absence; tests still produce meaningful results.
