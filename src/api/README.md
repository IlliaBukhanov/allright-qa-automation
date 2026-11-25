# Restful Booker API test layer

This directory contains the implemented Playwright `APIRequestContext` controllers:

- `AuthController.ts` — obtains a Restful Booker authentication token.
- `BookingController.ts` — creates, reads, updates and deletes bookings using Playwright HTTP requests.

Tests live in `test/api/booking-crud.spec.ts` and `test/api/booking-negative.spec.ts`. Typed request/response contracts and fixtures are located under `src/type/` and `src/data/fixture/api/`. The `api` project in `playwright.config.ts` uses `https://restful-booker.herokuapp.com` as its `baseURL`.

Run with `npm run test:api` (Windows PowerShell: `npm.cmd run test:api`). See the [root README](../../README.md) for setup, test coverage, CI reporting and limitations.

The service is a shared public demo and may reset its data. Use IDs returned by each test, verify mutations with follow-up GET requests, and clean up test-created records when possible. Do not record auth tokens in Playwright report attachments.
