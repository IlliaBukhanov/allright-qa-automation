# Codex 09 — Restful Booker API foundation (no test suite yet)

Read `AGENTS.md`, skill, `src/type/api/TAuth.ts`, `src/type/api/TBooking.ts`, `playwright.config.ts`, `package.json`, and existing `src/api/README.md` first. `src/api` contains no controllers yet. **Do not replace the existing API types without a demonstrated mismatch.**

Reference documentation: https://restful-booker.herokuapp.com/apidoc/index.html and https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/55eh7vh/restful-booker . The API can reset seeded data, so never assume global booking IDs.

## Implement
- Add a dedicated API Playwright project `use.baseURL = 'https://restful-booker.herokuapp.com'` (the existing global baseURL is SauceDemo; leaving this unchanged will send API calls to the wrong host). Preserve UI `baseURL` behavior.
- Implement `AuthController` and `BookingController` using `APIRequestContext` from `@playwright/test` (no Axios/Jest). Prefer methods that return `APIResponse` so tests can assert real statuses, headers and bodies. Only parse JSON after validating response when appropriate.
- Support POST `/auth`, POST `/booking`, GET `/booking/{id}`, PUT `/booking/{id}`, DELETE `/booking/{id}`. For authorized PUT/DELETE use `Cookie: token=<token>` based on documented flow. Do not confuse this with SauceDemo `session-username` cookie.
- Maintain existing `TAuthRequest`, `TAuthResponse`, `TBooking`, and `TBookingCreated` in `src/type/api`. Add separate negative case types only when needed.
- Define canonical valid booking and updated booking in a fixture `src/data/fixture/api/booking.ts`; define auth credentials separately and avoid logging tokens/passwords. The documented demo credentials may be used, but prefer environment configuration for non-public values.
- Keep controller methods thin: request construction and serialization; tests will own response/status assertions. Use `test.step` in test code for meaningful API phases; do not create meaningless nesting.

## Validate
Typecheck + minimal targeted ping/auth request if network permits. Report actual statuses rather than guessing. Do not add CRUD tests yet; those are in prompt 10. Update `AI_WORKLOG.md`.
