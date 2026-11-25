# Codex 10 — Restful Booker complete CRUD lifecycle

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Prerequisite: prompt 09 API project and typed controllers are implemented. Read their actual signatures, `TBooking` contracts, API fixture and the repository instructions. Never assume files/methods exist unless present.

## One independent API test: authenticate → create → read → update → read → delete → verify gone
Use `test.step()` to show each phase:
1. POST `/auth`: assert documented success status and validate a nonempty token; never print/attach the token.
2. POST `/booking` with typed fixture: assert status/body structure, extract dynamic `bookingid` and compare returned booking fields to request.
3. GET `/booking/{id}`: assert success and complete persisted content.
4. PUT `/booking/{id}` with `Cookie: token=...`, changed typed payload: assert status and **read again via GET** to verify persistence, not just PUT response.
5. DELETE `/booking/{id}` with authorization: assert the **actual documented/verified status** (Restful Booker commonly returns 201, not a conventional 204), then GET the same ID expecting 404.
6. Add `try/finally`: if creation succeeded but later validation fails, attempt deletion of the test-created booking only. Do not let cleanup errors hide the primary test error; report cleanup problems separately. Avoid duplicate deletes on the success path.

## Rules
No hardcoded booking ID, no shared state between tests, no DB assertions, no secrets in attachments. Keep network-state assertions independently derived from fixture. Use Playwright APIRequestContext for all requests; no browser fixture. If public API resets during the test, report it as an environmental limitation with evidence rather than weakening checks.

## Validate
Run typecheck and `npx.cmd playwright test --project=api` (or targeted API file), report exact status/response failures. Update `AI_WORKLOG.md` with real results and corrections only.
