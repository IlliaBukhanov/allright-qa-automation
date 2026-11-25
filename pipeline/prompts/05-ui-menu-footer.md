# Codex 05 — Burger menu and footer navigation

Inspect existing `InventoryPage`, shared elements, Playwright config and actual deployed SauceDemo DOM before implementation. Follow `AGENTS.md` and skill.

## Implement
- Introduce reusable `Header`/`BurgerMenu`/`Footer` components **only where real reuse justifies them**; do not introduce `Text`, `Image`, or `Badge` wrappers just for simple selectors.
- Verify the burger menu items against the observed app: `All Items`, `About`, `Logout`, `Reset App State`. Do not assume all four are navigation links: `Reset App State` is a state-reset action, not a destination. Test it with meaningful cart setup and reset assertions. Test `Logout` independently in a fresh context and verify the auth cookie is removed and protected access no longer works.
- Test `All Items` navigation and `About` target. External navigation can open a new tab or be blocked by network; inspect behavior before writing assertions. Never assert external page content you cannot reliably control.
- Verify footer links for X/Twitter, Facebook and LinkedIn using exact expected `href`s **after verifying live DOM**. Optionally test target/new-tab behavior, without depending on third-party page uptime.
- Keep side-effecting tests independent, and avoid mutating the shared auth state file. Use stable selectors, named steps, and scenario-level expectations.

## Validation
Run typecheck and targeted tests; record observed `href`, link behavior and any unexpected site differences; update `AI_WORKLOG.md`. Do not claim a live external website is a SauceDemo defect just because it is unreachable.
