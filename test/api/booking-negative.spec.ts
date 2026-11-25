import { randomUUID } from "node:crypto";
import { expect, test, request as apiRequest, type APIRequestContext } from "@playwright/test";
import { AuthController } from "../../src/api/AuthController";
import { BookingController } from "../../src/api/BookingController";
import { bookerCredentials } from "../../src/data/fixture/api/auth";
import { updatedBooking, validBooking } from "../../src/data/fixture/api/booking";

async function withBooking(
  request: APIRequestContext,
  run: (bookings: BookingController, id: number, initial: typeof validBooking) => Promise<void>,
): Promise<void> {
  const bookings = new BookingController(request);
  const token = await test.step("Authenticate for test booking cleanup", async () => {
    const response = await new AuthController(request).authenticate(bookerCredentials);
    expect(response.status()).toBe(200);
    const token: unknown = (await response.json()).token;
    if (typeof token !== "string" || !token.trim()) throw new Error("Authentication did not return a token");
    return token;
  });
  const initial = { ...validBooking, lastname: `Tester-${randomUUID()}` };
  let id: number | undefined;
  let scenarioPassed = false;
  try {
    const bookingId = await test.step("Create an isolated test booking", async () => {
      const response = await bookings.create(initial);
      expect(response.status()).toBe(200);
      const { bookingid } = await response.json();
      expect(Number.isSafeInteger(bookingid) && bookingid > 0).toBe(true);
      id = Number(bookingid);
      return id;
    });
    await run(bookings, bookingId, initial);
    scenarioPassed = true;
  } finally {
    if (id !== undefined) {
      const cleanupId = id;
      try {
        await test.step("Clean up the test booking", async () => {
          const response = await bookings.delete(cleanupId, token);
          expect([201, 404]).toContain(response.status());
          expect((await bookings.get(cleanupId)).status()).toBe(404);
        });
      } catch (error) {
        if (scenarioPassed) throw error;
        test.info().annotations.push({ type: "cleanup", description: "Cleanup of the test booking failed" });
      }
    }
  }
}

test("Reject invalid Booker credentials without issuing a token", async ({ request }) => {
  await test.step("Verify the invalid credentials response", async () => {
    const response = await new AuthController(request).authenticate({
      username: `invalid-${randomUUID()}`,
      password: "invalid-demo-password",
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reason).toBe("Bad credentials");
    expect(Object.hasOwn(body, "token")).toBe(false);
  });
});

const authorizationCases = [
  { name: "Refuse a booking update without a token and preserve stored data", token: undefined },
  { name: "Refuse a booking update with an invalid token and preserve stored data", token: "invalid-demo-token" },
];

authorizationCases.forEach(({ name, token }) => {
  test(name, async ({ request, baseURL }) => {
    await withBooking(request, async (bookings, id, initial) => {
      // A separate context cannot inherit cookies from the authenticated setup.
      const anonymous = await apiRequest.newContext({
        baseURL,
        storageState: { cookies: [], origins: [] },
      });
      try {
        await test.step("Attempt an unauthorized update and verify refusal", async () => {
          const response = await new BookingController(anonymous).update(
            id, { ...updatedBooking, lastname: initial.lastname }, token,
          );
          expect(response.status(), "Verify the unauthorized update was refused").toBe(403);
        });
      } finally {
        await anonymous.dispose();
      }
      await test.step("Verify the original booking remains unchanged", async () => {
        const response = await bookings.get(id);
        expect(response.status()).toBe(200);
        const saved: typeof validBooking = await response.json();
        expect(typeof saved.totalprice === "number" ? saved.totalprice : "<unavailable>", "Verify the original price was preserved").toEqual(initial.totalprice);
        expect(saved).toEqual(initial);
      });
    });
  });
});
