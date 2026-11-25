# Codex 11 — Restful Booker negative API coverage

> Edited excerpt of the development prompt; nonessential reporting details omitted.

Prerequisite: prompts 09 and 10 completed. Read existing controllers, API types, CRUD test and fixtures. Do not duplicate request construction or break the positive lifecycle.

## Add 2–3 independent negative tests
A. Invalid POST `/auth` credentials: validate the **documented observed response contract** (the service may reply HTTP 200 with `reason: 'Bad credentials'` rather than HTTP 401; verify first). Never expect a token.
B. Unauthorized PUT `/booking/{id}`: create a booking owned by this test, attempt update *without Cookie token*, assert actual refusal status (often 403), GET and verify original data unchanged. Cleanup the created booking with valid credentials in `finally`.
C. GET nonexistent booking: use a deliberately unlikely ID, assert 404; avoid relying on a fixed ID that could exist in a public shared service. If no reliable nonexistent ID can be assured, choose a safer supported invalid-id strategy and document it.

Optional alternative to C: authorized DELETE on nonexistent booking or malformed booking payload, but do not assume a particular validation status until confirmed on the live API.

## Data-driven and reporting
Use a typed `testData` / `expectedData` array with `forEach` **only for homogeneous cases** (e.g. multiple invalid auth credentials). Keep different workflows as separate explicit tests. Use `test.step` for request/response and follow-up no-mutation checks. Do not log sensitive headers or tokens to reports. Keep test data isolated.

## Validation
Typecheck, targeted negative suite, verify statuses and response body, record observed behavior/bugs only with evidence. Append `AI_WORKLOG.md`.
