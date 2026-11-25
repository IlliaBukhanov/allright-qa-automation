# Codex 06 — Unauthorized protected routes

Read the repository config and `test/auth.setup.ts` before changes. `login` project has empty cookies/origins, while `ui` depends on authenticated setup and uses a saved `storageState`. The test must never inherit that authenticated state.

## Implement
- Test direct access to `/inventory.html`, `/cart.html`, and `/checkout-step-one.html` in **fresh unauthenticated contexts**, using a dedicated project or a per-file explicit storage-state override. Make sure the test's project selection cannot silently use the normal authenticated UI state.
- For each supported protected path, verify redirect to login and the **exact error text**, if confirmed by the running app. Put cases in a typed array (`name`, `testData`, `expectedData`) and register with `forEach`.
- Check absence of `session-username` cookie and do not manually delete cookies after the test starts to manufacture a passing result.
- Prefer a small dedicated test file and minimal config changes; preserve existing login and UI tests. Do not assert unverified routes (e.g. future checkout routes) without checking behavior.

## Validation
Run typecheck and the exact dedicated project/test. If a redirect or error text differs from expectation, record actual observed behavior, not a guessed fix. Append a factual `AI_WORKLOG.md` entry.
